export interface Transaction {
    to: string;
    value: string;
    data: string;
  }
  
  export interface TransactionMessage {
    id: string;
    method: string;
    params: {
      txs: Transaction[];
    };
    env: {
      sdkVersion: string;
    };
  }