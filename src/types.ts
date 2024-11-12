export type MessageType = 
  | 'TRANSACTION_INITIATED'
  | 'TRANSACTION_SIGNED'
  | 'CONNECT_SUCCESS'
  | 'CONNECT_ERROR'
  | 'SIGN_MESSAGE'
  | 'SIGN_TYPED_DATA'
  | 'GET_BALANCE'
  | 'ESTIMATE_GAS'
  | 'CHAIN_CHANGED'
  | 'ACCOUNT_CHANGED';

export interface BasePayload {
  chainId: number;
}

export interface TransactionPayload extends BasePayload {
  to: string;
  value: string;
  data: string;
  from: string;
  gas?: string;
  nonce?: number;
}

export interface SignMessagePayload extends BasePayload {
  message: string;
  address: string;
}

export interface SignTypedDataPayload extends BasePayload {
  address: string;
  typedData: any;
}

export interface PortabilityMessage {
  type: MessageType;
  payload: TransactionPayload | SignMessagePayload | SignTypedDataPayload | BasePayload;
  id: string;
}