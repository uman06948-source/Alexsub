import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { mockProvider } from './providers/mockProvider';

type User = { id: string; name: string; email: string; phone: string; hash: string; suspended: boolean };
type Tx = { reference:string; userId:string; service:string; network:string; recipient:string; product:string; amountKobo:number; status:string; createdAt:string; demo:true };
const users = new Map<string,User>();
const wallets = new Map<string,number>();
const transactions: Tx[] = [];
const idempotency = new Map<string,Tx>();
const plans = [
 ...[['MTN','500MB','1 day','Daily',10000],['MTN','1.5GB','7 days','SME',35000],['MTN','3GB','30 days','Gifting',90000],['MTN','5GB','30 days','Corporate',145000],['Airtel','500MB','1 day','Daily',11000],['Airtel','1.5GB','7 days','SME',36000],['Airtel','3GB','30 days','Gifting',92000],['Airtel','5GB','30 days','Corporate',148000],['Glo','1GB','5 days','Weekly',20000],['Glo','3GB','30 days','SME',80000],['Glo','5GB','30 days','Gifting',125000],['Glo','10GB','30 days','Corporate',240000],['9mobile','500MB','1 day','Daily',12000],['9mobile','2GB','30 days','SME',70000],['9mobile','4GB','30 days','Gifting',130000],['9mobile','10GB','30 days','Corporate',270000]].map((p,i)=>({id:`demo-plan-${i+1}`,network:p[0],size:p[1],validity:p[2],category:p[3],priceKobo:p[4]}))
];
const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({limit:'32kb'}));
app.use(session({ secret:process.env.SESSION_SECRET ?? 'development-only-change-me-please-32chars', resave:false, saveUninitialized:false, cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:1000*60*60*24*7} }));
const authLimiter=rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:true,legacyHeaders:false});
const auth=(req:express.Request,res:express.Response,next:express.NextFunction)=>{if(!req.session.userId)return res.status(401).json({error:'Please sign in.'});const user=[...users.values()].find(u=>u.id===req.session.userId);if(!user||user.suspended){req.session.destroy(()=>{});return res.status(401).json({error:'Account unavailable.'});}(req as any).user=user;next();};
app.get('/api/health',(_req,res)=>res.json({ok:true,demo:true,provider:'mock'}));
app.get('/api/plans',(_req,res)=>res.json(plans));
app.post('/api/auth/register',authLimiter,async(req,res)=>{const parsed=z.object({name:z.string().trim().min(2).max(80),email:z.string().trim().email().max(254),phone:z.string().regex(/^\+?[0-9]{10,14}$/),password:z.string().min(8).max(128)}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Check the registration details.'});const {name,email,phone,password}=parsed.data;const key=email.toLowerCase();if(users.has(key))return res.status(409).json({error:'An account with this email already exists.'});const u={id:`AX-${crypto.randomUUID().slice(0,10).toUpperCase()}`,name,email:key,phone,hash:await bcrypt.hash(password,12),suspended:false};users.set(key,u);wallets.set(u.id,0);req.session.userId=u.id;res.status(201).json({id:u.id,name:u.name,email:u.email});});
app.post('/api/auth/login',authLimiter,async(req,res)=>{const parsed=z.object({email:z.string().email(),password:z.string().min(1).max(128)}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Enter a valid email and password.'});const u=users.get(parsed.data.email.toLowerCase());if(!u||!await bcrypt.compare(parsed.data.password,u.hash)||u.suspended)return res.status(401).json({error:'Email or password is incorrect.'});req.session.userId=u.id;res.json({id:u.id,name:u.name,email:u.email});});
app.get('/api/auth/me',auth,(req,res)=>{const u=(req as any).user as User;res.json({id:u.id,name:u.name,email:u.email});});
app.post('/api/auth/logout',(req,res)=>req.session.destroy(()=>res.status(204).end()));
app.get('/api/wallet',auth,(req,res)=>res.json({balanceKobo:wallets.get((req as any).user.id)??0,demo:true}));
app.post('/api/wallet/demo-credit',auth,(req,res)=>{if(process.env.DEMO_MODE==='false')return res.status(403).json({error:'Demo credits are disabled.'});const parsed=z.object({amountNaira:z.literal(5000)}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Only the fixed demo credit amount is available.'});const u=(req as any).user as User;wallets.set(u.id,(wallets.get(u.id)??0)+500000);res.json({balanceKobo:wallets.get(u.id),demo:true});});
app.get('/api/transactions',auth,(req,res)=>res.json(transactions.filter(t=>t.userId===(req as any).user.id).map(({userId,...t})=>t)));
app.post('/api/transactions/purchase',auth,async(req,res)=>{if(process.env.DEMO_MODE==='false')return res.status(403).json({error:'Demo purchase engine is disabled.'});const u=(req as any).user as User;const key=req.get('Idempotency-Key');if(!key||key.length>100)return res.status(400).json({error:'A valid idempotency key is required.'});const idem=`${u.id}:${key}`;if(idempotency.has(idem))return res.json(idempotency.get(idem));const parsed=z.object({service:z.enum(['DATA','AIRTIME']),network:z.enum(['MTN','Airtel','Glo','9mobile']),recipient:z.string().regex(/^\+?[0-9]{10,14}$/),planId:z.string().optional(),amountNaira:z.number().min(50).max(10000).optional()}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Check the purchase details.'});const p=parsed.data;const plan=p.service==='DATA'?plans.find(x=>x.id===p.planId&&x.network===p.network):undefined;if(p.service==='DATA'&&!plan)return res.status(400).json({error:'Select a valid demo data plan.'});const kobo=p.service==='DATA'?plan!.priceKobo:Math.round((p.amountNaira??0)*100);if((wallets.get(u.id)??0)<kobo)return res.status(400).json({error:'Insufficient demo balance. Add demo credits first.'});const result=await mockProvider.purchase({service:p.service,network:p.network,recipient:p.recipient,product:plan?.size??'Airtime',amountKobo:kobo});const tx:Tx={reference:`AXD-${crypto.randomUUID().slice(0,12).toUpperCase()}`,userId:u.id,service:p.service,network:p.network,recipient:p.recipient,product:plan?.size??`₦${kobo/100} Airtime`,amountKobo:kobo,status:result.status,createdAt:new Date().toISOString(),demo:true};if(tx.status==='SUCCESSFUL')wallets.set(u.id,(wallets.get(u.id)??0)-kobo);transactions.unshift(tx);idempotency.set(idem,tx);res.status(201).json(tx);});
const port=Number(process.env.PORT)||3001;
app.listen(port,'0.0.0.0',()=>console.log(`Alexsub demo API listening on ${port}`));
