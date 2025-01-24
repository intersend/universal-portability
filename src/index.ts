// Hooks
export { usePortableApps } from './hooks/usePortableApps';
export * from './utils/postMessage'
export * from './utils/messageTypes'

// Types
export type {
  MessageType,
  PortabilityMessage,
  TransactionPayload,
  RPCRequest
} from './utils/messageTypes';

// Constants (if needed)
export const PORTABILITY_VERSION = '1.0.0';


// impersonator methods
import {
  ImpersonatorIframeProvider as OriginalProvider,
  ImpersonatorIframe as OriginalIframe,
  useImpersonatorIframe as originalHook,
} from "@impersonator/iframe";

// Export with proper types
export const UniversalPortabilityProvider: React.FC<{children: React.ReactNode}> = OriginalProvider;

export const Port: React.FC<any> = OriginalIframe;
export const useUniversalPortability: () => ReturnType<typeof originalHook> = originalHook;


// Also export the new types for consumers
export type UniversalPortabilityProps = React.ComponentProps<typeof OriginalProvider>;
export type MyCustomIframeProps = React.ComponentProps<typeof OriginalIframe>;
export type UseUniversalPortabilityReturn = ReturnType<typeof originalHook>;
