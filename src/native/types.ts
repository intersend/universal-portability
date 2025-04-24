import { PortabilityMessage, MessageType, BasePayload } from '../types';
import { WebView } from 'react-native-webview';
import { RefObject } from 'react';

// Extend the existing types for React Native

// We'll reuse the WalletInfoPayload from main types.ts
// Since it has been defined there now

/**
 * React Native specific message types
 */
export type NativeMessageType = MessageType | 'WALLET_WEBVIEW_READY';

/**
 * React Native specific message with WebView reference
 */
export interface NativePortabilityMessage extends PortabilityMessage {
  webViewRef?: RefObject<WebView>;
}

/**
 * Specific props for React Native WebView Port component
 */
export interface NativePortProps {
  source: { uri: string };
  address?: string;
  rpcUrl?: string;
  chainId?: number;
  style?: any;
  height?: number | string;
  width?: number | string;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

/**
 * Props for the Native Portability Provider
 */
export interface NativePortabilityProviderProps {
  children: React.ReactNode;
  walletAddress?: string;
  chainId?: number;
  isConnected?: boolean;
  onError?: (error: Error) => void;
  config?: {
    allowedOrigins?: string[];
    debug?: boolean;
  };
}
