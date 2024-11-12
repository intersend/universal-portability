export type MessageType = 
  | 'CONNECT_SUCCESS'
  | 'CONNECT_ERROR'
  | 'TRANSACTION_INITIATED'
  | 'TRANSACTION_SIGNED'
  | 'SIGNATURE_REQUEST'
  | 'SIGNATURE_RESPONSE'
  | 'RPC_REQUEST'
  | 'RPC_RESPONSE'
  | 'CHAIN_CHANGED'
  | 'ACCOUNT_CHANGED';

export interface PortabilityMessage {
  type: MessageType;
  payload: any;
  id: string;
  error?: string;
}

export interface TransactionPayload {
  to: string;
  value: string;
  data: string;
  chainId?: number;
}

export interface RPCRequest {
  method: string;
  params: any[];
}