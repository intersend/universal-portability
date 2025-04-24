import { RefObject } from 'react';
import { WebView } from 'react-native-webview';
import { PortabilityMessage } from '../utils/messageTypes';
import { postMessageSafe } from '../utils/platform';

/**
 * Sends a message to a WebView using injectJavaScript
 * 
 * This is the React Native equivalent of window.postMessage used in web browsers
 * 
 * @param webViewRef - Reference to the WebView component
 * @param message - The message to send to the WebView
 */
export const sendPortabilityMessageToWebView = (
  webViewRef: RefObject<WebView>,
  message: PortabilityMessage
): void => {
  try {
    if (!webViewRef.current) {
      console.warn('WebView reference is not available');
      return;
    }

    // Use our platform-safe postMessage implementation
    postMessageSafe(message, '*', webViewRef);
  } catch (error) {
    console.error('Failed to send message to WebView:', error);
  }
};

/**
 * Parse a message event from a WebView
 * 
 * @param event - The WebView message event
 * @returns The parsed message or null if parsing failed
 */
export const parseWebViewMessage = (event: any): PortabilityMessage | null => {
  try {
    if (typeof event.nativeEvent.data === 'string') {
      return JSON.parse(event.nativeEvent.data);
    }
    return null;
  } catch (error) {
    console.error('Failed to parse WebView message:', error);
    return null;
  }
};
