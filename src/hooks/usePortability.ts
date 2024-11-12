import { useCallback, useEffect, useState } from 'react';
import { sendPortabilityMessage, createTransactionMessage } from '../utils/postMessage';
import type { PortabilityMessage, TransactionPayload } from '../utils/messageTypes';

export const usePortability = () => {
  const [lastMessage, setLastMessage] = useState<PortabilityMessage | null>(null);

  const sendTransaction = useCallback((txs: TransactionPayload[]) => {
    sendPortabilityMessage(createTransactionMessage(txs, 'TRANSACTION_INITIATED'));
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message = event.data as PortabilityMessage;
      if (message && message.type) {
        setLastMessage(message);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  return {
    sendTransaction,
    lastMessage,
  };
};