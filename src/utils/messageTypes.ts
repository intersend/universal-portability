export type MessageType = 'TRANSACTION_INITIATED' | 'TRANSACTION_SIGNED' | 'CONNECT_SUCCESS' | 'CONNECT_ERROR';

export interface PortabilityMessage {
  type: MessageType;
  payload: any;
  id: string;
}

export interface TransactionPayload {
  to: string;
  value: string;
  data: string;
  chainId?: number;
}