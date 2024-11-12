import React, { useEffect, useCallback, useRef } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { useAutoConnect } from '../hooks/useAutoConnect';
import { sendPortabilityMessage, createTransactionMessage } from '../utils/postMessage';
import type { PortabilityMessage } from '../utils/messageTypes';

interface PortabilityProviderProps {
  children: React.ReactNode;
  onMessageReceived?: (message: PortabilityMessage) => void;
}

export const PortabilityProvider: React.FC<PortabilityProviderProps> = ({ 
  children, 
  onMessageReceived 
}) => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();


  if (!publicClient) {
    console.error(
      'PortabilityProvider requires a publicClient from wagmi. Please ensure it is properly configured.'
    )
    
    return;
  }

  //@ts-ignore
  const originalRequestRef = useRef(publicClient.request);

  // Auto-connect functionality
  useAutoConnect();

  // Notify parent about successful connection
  useEffect(() => {
    if (isConnected && address) {
      sendPortabilityMessage({
        type: 'CONNECT_SUCCESS',
        payload: { address },
        id: Math.random().toString(36).substr(2, 9)
      });
    }
  }, [isConnected, address]);

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message = event.data as PortabilityMessage;
      if (message && message.type) {
        onMessageReceived?.(message);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }, [onMessageReceived]);

  // Set up message listener
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Intercept and observe transactions
  useEffect(() => {
    const originalSend = originalRequestRef.current;

    if (!publicClient) {
      console.error(
        'PortabilityProvider requires a publicClient from wagmi. Please ensure it is properly configured.'
      )
      
      return;
    }

    //@ts-ignore
    publicClient.request = async (args: any) => {
      try {
        if (args.method === 'eth_sendTransaction') {
          // Notify about transaction initiation
          sendPortabilityMessage(createTransactionMessage(args.params, 'TRANSACTION_INITIATED'));
          
          // Process the actual transaction
          const result = await originalSend(args);
          
          // Notify about signed transaction
          sendPortabilityMessage(createTransactionMessage([{
            ...args.params[0],
            hash: result
          }], 'TRANSACTION_SIGNED'));
          
          return result;
        }
        return originalSend(args);
      } catch (error) {
        console.error('Transaction error:', error);
        throw error;
      }
    };

    return () => {
      publicClient.request = originalSend;
    };
  }, [publicClient]);

  return <>{children}</>;
};