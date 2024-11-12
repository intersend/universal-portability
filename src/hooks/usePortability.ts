import { useCallback, useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { sendPortabilityMessage } from '../utils/postMessage';
import type { PortabilityMessage, TransactionPayload, RPCRequest } from '../utils/messageTypes';

export const usePortability = () => {
  const { chain } = useAccount();
  const publicClient = usePublicClient();
  const [lastMessage, setLastMessage] = useState<PortabilityMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message = event.data as PortabilityMessage;
      if (message && message.type) {
        setLastMessage(message);
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Message handling failed'));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Manual transaction sender
  const sendTransaction = useCallback(async (txs: TransactionPayload[]) => {
    try {
      if (!publicClient) throw new Error('Public client not available');

      sendPortabilityMessage({
        type: 'TRANSACTION_INITIATED',
        payload: { txs, chainId: chain?.id },
        id: Math.random().toString(36).substr(2, 9)
      });

      return txs;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Transaction failed'));
      throw error;
    }
  }, [publicClient, chain]);

  // Manual RPC request sender
  const sendRpcRequest = useCallback(async (request: RPCRequest) => {
    try {
      if (!publicClient) throw new Error('Public client not available');

      sendPortabilityMessage({
        type: 'RPC_REQUEST',
        payload: request,
        id: Math.random().toString(36).substr(2, 9)
      });

      //@ts-ignore
      const result = await publicClient.request(request);
      return result;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('RPC request failed'));
      throw error;
    }
  }, [publicClient]);

  return {
    sendTransaction,
    sendRpcRequest,
    lastMessage,
    error,
    clearError: () => setError(null)
  };
};