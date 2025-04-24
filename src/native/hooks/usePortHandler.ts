import { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { useMessageHandler, MessageHandlerConfig } from './useMessageHandler';

export interface PortHandlerConfig extends Omit<MessageHandlerConfig, 'walletAddress' | 'chainId'> {
  address?: string;
  chainId?: number;
}

/**
 * Hook to handle WebView communication for React Native
 * 
 * This is the React Native equivalent of the usePortHandler hook
 * for web implementations.
 */
export function usePortHandler(config: PortHandlerConfig = {}) {
  const { address, chainId, signer } = config;
  
  // Make sure we have valid values
  const safeAddress = address || '';
  const safeChainId = chainId || 1;
  
  const { handleWebViewMessage, webViewRef } = useMessageHandler({
    walletAddress: safeAddress,
    chainId: safeChainId,
    signer
  });
  
  return {
    handleWebViewMessage,
    webViewRef,
    isReady: Boolean(address && chainId)
  };
}

export default usePortHandler;
