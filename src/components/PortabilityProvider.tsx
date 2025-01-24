//@ts-nocheck
import React, { useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { PortabilityEIP1193Provider } from '../provider/eip1193Provider';

import { useAutoConnect } from '../hooks/useAutoConnect';

interface PortabilityContextType {
  provider: PortabilityEIP1193Provider | null;
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
}

export const PortabilityContext = createContext<PortabilityContextType>({
  provider: null,
  isConnected: false,
  address: null,
  chainId: null
});

interface PortabilityProviderProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
  config?: {
    allowedOrigins?: string[];
    debug?: boolean;
  };
}

export const PortabilityProvider: React.FC<PortabilityProviderProps> = ({
  children,
  onError,
  config = {
    allowedOrigins: ['intersend.io', 'localhost', 'https://0478-142-115-138-228.ngrok-free.app', '*'],
    debug: false
  }
}) => {
  const providerRef = useRef<PortabilityEIP1193Provider | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [address, setAddress] = React.useState<string | null>(null);
  const [chainId, setChainId] = React.useState<number | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);



  const log = useCallback((message: string, data?: any) => {
    if (config.debug) {
      console.log(`[Portability]: ${message}`, data || '');
    }
  }, [config.debug]);

  
  const sendToHost = useCallback((message: any) => {
    if (window !== window.parent) {
      window.parent.postMessage({
        ...message,
        timestamp: Date.now()
      }, '*');
    }
  }, []);


  useEffect(() => {
    if (!providerRef.current && typeof window !== 'undefined') {
      try {
        const provider = new PortabilityEIP1193Provider(sendToHost);
        providerRef.current = provider;

        // Inject provider into window.ethereum
        Object.defineProperty(window, 'ethereum', {
          value: provider,
          writable: true,
          configurable: true,
          enumerable: true
        });

        setIsInitialized(true);
        window.dispatchEvent(new Event('ethereum#initialized'));

        // Request initial wallet info
        if (window !== window.parent) {
          provider.request({ method: 'eth_accounts' }).catch(console.error);
        }
      } catch (error) {
        console.error('Provider initialization error:', error);
        onError?.(error instanceof Error ? error : new Error('Provider initialization failed'));
      }
    }
  }, [sendToHost, onError]);

  // Handle messages from host
  const handleHostMessage = useCallback((event: MessageEvent) => {
    if (!config.allowedOrigins?.some(origin => 
      origin === '*' || event.origin.includes(origin)
    )) {
      return;
    }

    const message = event.data;
    if (config.debug) {
      console.log('Received message:', message);
    }

    try {
      switch (message.type) {
        case 'WALLET_INFO':
          const { address: walletAddress, chainId: walletChainId, provider: providerInfo } = message.payload;
          
          if (walletAddress && walletChainId) {
            setAddress(walletAddress);
            setChainId(typeof walletChainId === 'string' 
              ? parseInt(walletChainId.replace('0x', ''), 16)
              : walletChainId);
            setIsConnected(true);
            
            providerRef.current?.setWalletInfo(
              walletAddress,
              typeof walletChainId === 'string'
                ? parseInt(walletChainId.replace('0x', ''), 16)
                : walletChainId,
              providerInfo
            );

            // Dispatch connection event
            window.dispatchEvent(new Event('connect'));
          }
          break;
      }
    } catch (error) {
      console.error('Message handling error:', error);
      onError?.(error instanceof Error ? error : new Error('Message handling failed'));
    }
  }, [config.allowedOrigins, config.debug, onError]);

  useEffect(() => {
    window.addEventListener('message', handleHostMessage);
    return () => window.removeEventListener('message', handleHostMessage);
  }, [handleHostMessage]);

  const contextValue = {
    provider: providerRef.current,
    isConnected,
    address,
    chainId,
    isInitialized
  };

  return (
    <PortabilityContext.Provider value={contextValue}>
      {children}
    </PortabilityContext.Provider>
  );
};