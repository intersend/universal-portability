// Components
export { PortabilityProvider } from './components/PortabilityProvider';

// Hooks
export { usePortability } from './hooks/usePortability';
export { useAutoConnect } from './hooks/useAutoConnect';

// Types
export type {
  MessageType,
  PortabilityMessage,
  TransactionPayload,
  RPCRequest
} from './utils/messageTypes';

// Utils (if needed externally)
export { sendPortabilityMessage } from './utils/postMessage';

// Constants (if needed)
export const PORTABILITY_VERSION = '1.0.0';