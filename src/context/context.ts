import { createContext, useContext } from 'react';
import { AuthProvider, HostMessage, WalletInfo } from '../types';

export interface PortabilityContextType {
  walletInfo: WalletInfo | null;
  sendMessage: (message: HostMessage) => void;
  isIframe: boolean;
  authProvider: AuthProvider | null;
}

export const PortabilityContext = createContext<PortabilityContextType | null>(null);

export const usePortability = () => {
  const context = useContext(PortabilityContext);
  if (!context) {
    throw new Error('usePortability must be used within PortabilityProvider');
  }
  return context;
};
