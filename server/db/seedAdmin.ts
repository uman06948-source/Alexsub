import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
if(!process.env.DATABASE_URL||!process.env.ADMIN_EMAIL||!process.env.ADMIN_PASSWORD||process.env.ADMIN_PASSWORD.length<12)throw new Error('Set DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) in your local env.');
const pool=new Pool({connectionString:process.env.DATABASE_URL});
try{const email=process.env.ADMIN_EMAIL.toLowerCase();const hash=await bcrypt.hash(process.env.ADMIN_PASSWORD,12);const result=await pool.query(`INSERT INTO users(account_id,name,email,phone,password_hash,role) VALUES($1,$2,$3,$4,$5,'ADMIN') ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,role='ADMIN' RETURNING id`,[`AX-ADMIN-${Date.now()}`,'Alexsub Administrator',email,'0000000000',hash]);await pool.query('INSERT INTO wallets(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING',[result.rows[0].id]);console.log(`Development admin provisioned for ${email}`);}finally{await pool.end();}
