import type { ProviderInterface, PurchaseRequest, PurchaseResult } from './providers/providerInterface';
/** Transaction coordination boundary. Current app selects mockProvider exclusively. */
export class TransactionService {
 constructor(private provider:ProviderInterface){}
 async purchase(input:PurchaseRequest):Promise<PurchaseResult>{return this.provider.purchase(input);}
 async checkStatus(reference:string):Promise<PurchaseResult>{return this.provider.checkStatus(reference);}
}
