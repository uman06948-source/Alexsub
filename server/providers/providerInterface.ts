export type PurchaseRequest = { service:string; network:string; recipient:string; product:string; amountKobo:number };
export type PurchaseResult = { status:'SUCCESSFUL'|'FAILED'|'PENDING'; providerReference?:string; detail:string };
export interface ProviderInterface {
  getServices(): Promise<unknown[]>;
  getDataPlans(): Promise<unknown[]>;
  purchase(input:PurchaseRequest): Promise<PurchaseResult>;
  checkStatus(reference:string): Promise<PurchaseResult>;
  getTransactionHistory(): Promise<unknown[]>;
}
