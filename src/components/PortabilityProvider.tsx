import React, { useEffect, useCallback, useRef } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { useAutoConnect } from '../hooks/useAutoConnect';
import { sendPortabilityMessage } from '../utils/postMessage';
import type { PortabilityMessage, RPCRequest } from '../utils/messageTypes';

interface PortabilityProviderProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

export const PortabilityProvider: React.FC<PortabilityProviderProps> = ({ 
  children,
  onError 
}) => {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();

  //@ts-ignore
  const originalRequestRef = useRef(publicClient.request);

  // Auto-connect functionality
  useAutoConnect();

  // Handle connection status changes
  useEffect(() => {
    if (isConnected && address) {
      sendPortabilityMessage({
        type: 'CONNECT_SUCCESS',
        payload: { 
          address,
          chainId: chain?.id,
          chainName: chain?.name
        },
        id: Math.random().toString(36).substr(2, 9)
      });
    }
  }, [isConnected, address, chain]);

  // Handle chain changes
  useEffect(() => {
    if (chain) {
      sendPortabilityMessage({
        type: 'CHAIN_CHANGED',
        payload: { 
          chainId: chain.id,
          chainName: chain.name
        },
        id: Math.random().toString(36).substr(2, 9)
      });
    }
  }, [chain]);

  // Intercept and observe RPC requests
  useEffect(() => {
    if (!publicClient) return;

    const originalSend = originalRequestRef.current;
    
    //@ts-ignore
    publicClient.request = async (args: RPCRequest) => {
      try {
        // Notify about the RPC request
        sendPortabilityMessage({
          type: 'RPC_REQUEST',
          payload: args,
          id: Math.random().toString(36).substr(2, 9)
        });

        // Process the actual request
        //@ts-ignore
        const result = await originalSend(args);

        // Special handling for specific methods
        switch (args.method) {
          case 'eth_sendTransaction':
            sendPortabilityMessage({
              type: 'TRANSACTION_INITIATED',
              payload: {
                params: args.params,
                result
              },
              id: Math.random().toString(36).substr(2, 9)
            });
            break;

          case 'eth_sign':
          case 'personal_sign':
          case 'eth_signTypedData':
          case 'eth_signTypedData_v4':
            sendPortabilityMessage({
              type: 'SIGNATURE_REQUEST',
              payload: {
                method: args.method,
                params: args.params,
                result
              },
              id: Math.random().toString(36).substr(2, 9)
            });
            break;
        }

        // Notify about the RPC response
        sendPortabilityMessage({
          type: 'RPC_RESPONSE',
          payload: { request: args, response: result },
          id: Math.random().toString(36).substr(2, 9)
        });

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        sendPortabilityMessage({
          type: 'RPC_RESPONSE',
          payload: { request: args },
          error: errorMessage,
          id: Math.random().toString(36).substr(2, 9)
        });

        onError?.(error instanceof Error ? error : new Error(errorMessage));
        throw error; // Re-throw to maintain normal error flow
      }
    };

    return () => {
      publicClient.request = originalSend;
    };
  }, [publicClient, onError]);

  return <>{children}</>;
};