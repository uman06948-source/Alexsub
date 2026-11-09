import type { ProviderInterface, PurchaseRequest, PurchaseResult } from './providerInterface';
/** Safe deterministic-shape simulator. This adapter never calls a network provider. */
export const mockProvider:ProviderInterface={
 async getServices(){return ['DATA','AIRTIME'];},
 async getDataPlans(){return [];},
 async purchase(_input:PurchaseRequest):Promise<PurchaseResult>{return {status:Math.random()<0.88?'SUCCESSFUL':'FAILED',detail:'DEMO simulation only; no provider request was made.'};},
 async checkStatus(_reference:string):Promise<PurchaseResult>{return {status:'PENDING',detail:'Mock adapter has no live provider status.'};},
 async getTransactionHistory(){return [];}
};
