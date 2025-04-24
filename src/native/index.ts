/**
 * React Native specific implementation of the Universal Portability SDK
 */

// Components
export { default as NativePort, NativePort as Port } from './NativePort';
export { 
  default as NativePortabilityProvider, 
  NativePortabilityProvider as UniversalPortabilityProvider,
  useNativePortability as useUniversalPortability
} from './NativePortabilityProvider';

// Hooks
export { default as useMessageHandler } from './hooks/useMessageHandler';
export { default as usePortHandler } from './hooks/usePortHandler';
export { default as usePortableApps } from './hooks/usePortableApps';

// Utilities
export * from './messageUtils';
export * from '../utils/platform';

// Types
export * from './types';

// Re-export common types
export * from '../types';

/**
 * Version of the Universal Portability SDK
 */
export const PORTABILITY_VERSION = '1.0.0';
