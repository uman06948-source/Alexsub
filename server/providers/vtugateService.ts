import type { ProviderInterface, PurchaseRequest, PurchaseResult } from './providerInterface';
/** Deliberately disabled: no endpoints or payload fields are guessed. Activate only after reviewing VTUGATE's current official docs and obtaining authorization. */
export const vtugateProvider:ProviderInterface={
 async getServices(){throw new Error('VTUGATE adapter disabled: verify official endpoint documentation first.');},
 async getDataPlans(){throw new Error('VTUGATE adapter disabled: verify official endpoint documentation first.');},
 async purchase(_input:PurchaseRequest):Promise<PurchaseResult>{throw new Error('VTUGATE live purchases are disabled.');},
 async checkStatus(_reference:string):Promise<PurchaseResult>{throw new Error('VTUGATE adapter disabled.');},
 async getTransactionHistory(){throw new Error('VTUGATE adapter disabled.');}
};
