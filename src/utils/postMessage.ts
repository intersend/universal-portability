import { PortabilityMessage, TransactionPayload } from './messageTypes';

export const sendPortabilityMessage = (message: PortabilityMessage) => {
  try {
    window.parent.postMessage(message, '*');
  } catch (error) {
    console.error('Failed to send postMessage:', error);
  }
};

export const createTransactionMessage = (
  txs: TransactionPayload[],
  type: 'TRANSACTION_INITIATED' | 'TRANSACTION_SIGNED'
): PortabilityMessage => ({
  type,
  payload: { txs },
  id: Math.random().toString(36).substr(2, 9)
});