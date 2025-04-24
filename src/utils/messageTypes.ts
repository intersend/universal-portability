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
  | 'ACCOUNT_CHANGED'
  | 'REQUEST_WALLET_INFO'
  | 'WALLET_INFO'
  | 'INTERSPACE_CONNECT_REQUEST'
  | 'INTERSPACE_CONNECT_RESPONSE'
  | 'SIGN_MESSAGE_REQUEST'
  | 'TRANSACTION_REQUEST'
  | 'SWITCH_CHAIN_REQUEST'
  | 'WALLET_WEBVIEW_READY';

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
