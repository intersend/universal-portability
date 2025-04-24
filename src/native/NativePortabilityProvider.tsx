import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { parseWebViewMessage } from './messageUtils';
import { PortabilityMessage, WalletInfoPayload } from '../types';
import { NativePortabilityProviderProps } from './types';

interface NativePortabilityContextType {
  sendMessageToWebView: (message: PortabilityMessage, webViewRef: React.RefObject<any>) => void;
  registerWebView: (ref: React.RefObject<any>) => void;
  unregisterWebView: (ref: React.RefObject<any>) => void;
  webViews: React.RefObject<any>[];
  isConnected: boolean;
  walletAddress: string | null;
  chainId: number | null;
}

const NativePortabilityContext = createContext<NativePortabilityContextType>({
  sendMessageToWebView: () => {},
  registerWebView: () => {},
  unregisterWebView: () => {},
  webViews: [],
  isConnected: false,
  walletAddress: null,
  chainId: null
});


/**
 * NativePortabilityProvider is the React Native equivalent of UniversalPortabilityProvider.
 * It manages communication between the wallet app and embedded WebViews.
 */
export const NativePortabilityProvider: React.FC<NativePortabilityProviderProps> = ({
  children,
  walletAddress: initialWalletAddress,
  chainId: initialChainId,
  isConnected: initialIsConnected = false,
  onError,
  config = {
    allowedOrigins: ['*'],
    debug: false
  }
}) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(initialWalletAddress || null);
  const [chainId, setChainId] = useState<number | null>(initialChainId || null);
  const [isConnected, setIsConnected] = useState<boolean>(initialIsConnected);
  const webViewsRef = useRef<React.RefObject<any>[]>([]);
  const appState = useRef(AppState.currentState);

  const log = useCallback((message: string, data?: any) => {
    if (config.debug) {
      console.log(`[NativePortability]: ${message}`, data || '');
    }
  }, [config.debug]);

  // Function to send a message to a specific WebView
  const sendMessageToWebView = useCallback((message: PortabilityMessage, webViewRef: React.RefObject<any>) => {
    try {
      if (webViewRef.current && webViewRef.current.sendMessageToWebView) {
        webViewRef.current.sendMessageToWebView(message);
        log('Sent message to WebView', message);
      } else {
        log('WebView reference is not available', webViewRef);
      }
    } catch (error) {
      log('Failed to send message to WebView', error);
      onError?.(error instanceof Error ? error : new Error('Failed to send message to WebView'));
    }
  }, [log, onError]);

  // Function to send a message to all registered WebViews
  const broadcastToWebViews = useCallback((message: PortabilityMessage) => {
    webViewsRef.current.forEach(webViewRef => {
      sendMessageToWebView(message, webViewRef);
    });
  }, [sendMessageToWebView]);

  // Register a WebView with the provider
  const registerWebView = useCallback((ref: React.RefObject<any>) => {
    if (!webViewsRef.current.includes(ref)) {
      webViewsRef.current = [...webViewsRef.current, ref];
      log('WebView registered', webViewsRef.current.length);
    }
  }, [log]);

  // Unregister a WebView from the provider
  const unregisterWebView = useCallback((ref: React.RefObject<any>) => {
    webViewsRef.current = webViewsRef.current.filter(item => item !== ref);
    log('WebView unregistered', webViewsRef.current.length);
  }, [log]);

  // Handle app state changes (active, background, inactive)
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      log('App has come to foreground, refreshing WebViews');
      
      // Update all WebViews with current wallet state
      if (isConnected && walletAddress && chainId) {
        broadcastToWebViews({
          type: 'WALLET_INFO',
          payload: {
            address: walletAddress,
            chainId,
            isConnected
          } as WalletInfoPayload,
          id: Date.now().toString()
        });
      }
    }
    
    appState.current = nextAppState;
  }, [isConnected, walletAddress, chainId, log, broadcastToWebViews]);

  // Update context when wallet properties change
  useEffect(() => {
    if (walletAddress !== initialWalletAddress && initialWalletAddress) {
      setWalletAddress(initialWalletAddress);
    }
    
    if (chainId !== initialChainId && initialChainId) {
      setChainId(initialChainId);
    }
    
    if (isConnected !== initialIsConnected) {
      setIsConnected(initialIsConnected);
    }
  }, [initialWalletAddress, initialChainId, initialIsConnected, walletAddress, chainId, isConnected]);

  // Broadcast wallet changes to all WebViews
  useEffect(() => {
    if (walletAddress && chainId && isConnected) {
      broadcastToWebViews({
        type: 'WALLET_INFO',
        payload: {
          address: walletAddress,
          chainId,
          isConnected
        } as WalletInfoPayload,
        id: Date.now().toString()
      });
    }
  }, [walletAddress, chainId, isConnected, broadcastToWebViews]);

  // Set up app state change listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

  const contextValue = {
    sendMessageToWebView,
    registerWebView,
    unregisterWebView,
    webViews: webViewsRef.current,
    isConnected,
    walletAddress,
    chainId
  };

  return (
    <NativePortabilityContext.Provider value={contextValue}>
      {children}
    </NativePortabilityContext.Provider>
  );
};

/**
 * Hook to access the NativePortability context
 */
export const useNativePortability = () => useContext(NativePortabilityContext);

export default NativePortabilityProvider;
