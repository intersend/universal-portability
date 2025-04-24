/**
 * React Native entry point for Universal Portability SDK
 * This file re-exports components from both native and web implementations
 * to provide a single import point for React Native applications
 */

// Re-export all native components and hooks
export * from './native/index';

// Re-export web components and utilities that work in React Native
export { default as usePortableApps } from './native/hooks/usePortableApps';
export * from './utils/platform';
export * from './types';

// Constants
export const PORTABILITY_VERSION = '1.3.1';
