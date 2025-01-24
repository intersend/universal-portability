export type MessageType = 
  | 'TRANSACTION_INITIATED'
  | 'TRANSACTION_SIGNED'
  | 'CONNECT_SUCCESS'
  | 'CONNECT_ERROR'
  | 'SIGN_MESSAGE'
  | 'SIGN_TYPED_DATA'
  | 'GET_BALANCE'
  | 'ESTIMATE_GAS'
  | 'CHAIN_CHANGED'
  | 'ACCOUNT_CHANGED'
  | 'REQUEST_WALLET_INFO'
  | 'WALLET_INFO'
  | 'RPC_REQUEST'
  | 'RPC_RESPONSE'
  | 'DISCONNECT'
  | 'ERROR'
  | 'CUSTOM_MESSAGE'
  | 'AUTO_CONNECT_SUCCESS'
  | 'AUTO_CONNECT_ERROR'
  | 'AUTO_CONNECT_TIMEOUT'
  | 'AUTO_CONNECT_INITIATED'
  | 'AUTO_CONNECT_CANCELLED';

export interface BasePayload {
  chainId: number;
}

export interface TransactionPayload extends BasePayload {
  to: string;
  value: string;
  data: string;
  from: string;
  gas?: string;
  nonce?: number;
}

export interface SignMessagePayload extends BasePayload {
  message: string;
  address: string;
}

export interface SignTypedDataPayload extends BasePayload {
  address: string;
  typedData: any;
}

export interface PortabilityMessage {
  type: MessageType;
  payload: TransactionPayload | SignMessagePayload | SignTypedDataPayload | BasePayload;
  id: string;
}

export interface AutoConnectConfig {
  timeout?: number;
  allowedOrigins?: string[];
  onError?: (error: Error) => void;
}

export interface AuthProvider {
  type: 'privy' | 'dynamic' | 'magic' | 'custom';
  instance: any;
  methods?: {
    login?: (...args: any[]) => Promise<any>;
    logout?: (...args: any[]) => Promise<any>;
    getUser?: (...args: any[]) => any;
    getSigner?: (...args: any[]) => any;
  };
}

export interface PortabilityConfig {
  allowedOrigins: string[];
  debug?: boolean;
  chainId?: number;
}

export interface HostMessage {
  type: string;
  payload: any;
  id: string;
  error?: any;
  timestamp?: number;
}

export interface WalletInfo {
  address: string;
  chainId: number;
  isConnected: boolean;
  provider: any;
}

export interface PortableApp {
  id: string;
  name: string;
  slug: string;
  logo: string;
  banner: string;
  description: string;
  category: string[];
  privacy_policy: string;
  terms: string;
  screenshots: string[];
  about: string;
  features: string[];
  developer: string;
  link: string;
  developer_website: string;
  createdAt: string;
  kyc: boolean;
}

export type FilterConfig = 
  | string  // single category/wallet/app name
  | string[] // multiple app names
  | { 
      type: 'category' | 'wallet' | 'popular' | 'apps';
      value: string | string[];
    };