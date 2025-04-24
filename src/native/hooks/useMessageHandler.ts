import { useEffect, useRef, useCallback } from 'react';
import { WebView } from 'react-native-webview';
import { useNativePortability } from '../NativePortabilityProvider';
import { parseWebViewMessage } from '../messageUtils';
import { SignMessagePayload, TransactionPayload } from '../../types';
import { PortabilityMessage, MessageType } from '../../utils/messageTypes';

export interface MessageHandlerConfig {
  walletAddress: string;
  chainId: number;
  signer?: any; // Wallet signer object
}

/**
 * Hook to handle messages from the WebView dApp
 * 
 * This is the React Native equivalent of the useMessageHandler hook
 * for web implementations. It handles communication with embedded dApps
 * inside WebViews.
 */
export function useMessageHandler({ walletAddress, chainId, signer }: MessageHandlerConfig) {
  const { sendMessageToWebView } = useNativePortability();
  const webViewRef = useRef<WebView>(null);
  
  /**
   * Helper to send a response message back to the WebView
   */
  const sendResponse = useCallback((messageType: string, payload: any, requestId: string) => {
    if (!webViewRef.current) return;
    
    sendMessageToWebView({
      type: messageType as any,
      payload,
      id: requestId
    }, webViewRef);
  }, [sendMessageToWebView]);
  
  /**
   * Handler for WebView messages
   */
  const handleWebViewMessage = useCallback(async (event: any) => {
    try {
      const message = parseWebViewMessage(event);
      if (!message) return;
      
      const { type, payload, id: requestId } = message;
      
      switch (type as MessageType) {
        case 'INTERSPACE_CONNECT_REQUEST':
          // Handle connection request
          sendResponse('INTERSPACE_CONNECT_RESPONSE', {
            address: walletAddress,
            chainId,
            isConnected: true
          }, requestId);
          break;
          
        case 'SIGN_MESSAGE_REQUEST':
          // Handle message signing request
          try {
            if (!signer) {
              throw new Error('Signer is not available');
            }
            
            // Type assertion for SignMessagePayload
            const messagePayload = payload as SignMessagePayload;
            const signedMessage = await signer.signMessage(messagePayload.message);
            sendResponse('SIGNATURE_RESPONSE', {
              signature: signedMessage,
              success: true
            }, requestId);
          } catch (error) {
            sendResponse('SIGNATURE_RESPONSE', {
              error: (error as Error).message,
              success: false
            }, requestId);
          }
          break;
          
        case 'TRANSACTION_REQUEST':
          // Handle transaction request
          try {
            if (!signer) {
              throw new Error('Signer is not available');
            }
            
            // Notify that we received the transaction
            sendResponse('TRANSACTION_INITIATED', {
              txId: requestId,
              status: 'pending'
            }, requestId);
            
            // Type assertion for TransactionPayload
            const txPayload = payload as TransactionPayload;
            
            // Process the transaction
            const tx = await signer.sendTransaction({
              to: txPayload.to,
              data: txPayload.data,
              value: txPayload.value,
              chainId: txPayload.chainId || chainId
            });
            
            // Send the successful response
            sendResponse('TRANSACTION_SIGNED', {
              txId: requestId,
              hash: tx.hash,
              status: 'success'
            }, requestId);
          } catch (error) {
            sendResponse('TRANSACTION_SIGNED', {
              txId: requestId,
              error: (error as Error).message,
              status: 'error'
            }, requestId);
          }
          break;
          
        case 'SWITCH_CHAIN_REQUEST':
          // Handle chain switching
          // This would depend on the wallet's implementation
          // and will need to be customized by the wallet
          break;
          
        // Add more cases as needed
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  }, [walletAddress, chainId, signer, sendResponse]);
  
  // Register the hook with any WebView by setting onMessage prop to this function
  return {
    handleWebViewMessage,
    webViewRef
  };
}

export default useMessageHandler;
