import { PortabilityMessage, TransactionPayload } from './messageTypes';
import { postMessageSafe } from './platform';

export const sendPortabilityMessage = (
  message: PortabilityMessage, 
  webViewRef?: React.RefObject<any>
) => {
  postMessageSafe(message, '*', webViewRef);
};

export const createTransactionMessage = (
  txs: TransactionPayload[],
  type: 'TRANSACTION_INITIATED' | 'TRANSACTION_SIGNED'
): PortabilityMessage => ({
  type,
  payload: { txs },
  id: Math.random().toString(36).substr(2, 9)
});
