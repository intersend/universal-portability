/**
 * Platform-specific utilities for handling differences between web and React Native
 */

/**
 * Check if the current environment is React Native
 */
export const isReactNative = (): boolean => 
  typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

/**
 * Platform-safe implementation of postMessage
 */
export const postMessageSafe = (
  message: any, 
  target: any = '*', 
  webViewRef?: React.RefObject<any>
): void => {
  try {
    if (isReactNative()) {
      // In React Native, we need to use the WebView ref to inject JavaScript
      if (webViewRef?.current) {
        const messageString = JSON.stringify(message);
        // Escape quotes for JavaScript injection
        const escapedMessage = messageString.replace(/"/g, '\\"');
        webViewRef.current.injectJavaScript(`
          (function() {
            window.postMessage(${escapedMessage}, '*');
            return true;
          })();
        `);
      }
    } else {
      // In web, we can use the standard window.parent.postMessage
      window.parent.postMessage(message, target);
    }
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

/**
 * Platform-safe base64 encoding and decoding
 */
export const base64 = {
  // Base64 encoding implementation that works in both web and React Native
  encode: (input: string): string => {
    try {
      if (isReactNative()) {
        // Use global.btoa if available in some React Native environments
        if (typeof global.btoa === 'function') {
          return global.btoa(input);
        }
        
        // Otherwise, use a pure JS implementation
        return customBase64Encode(input);
      } else {
        // Use browser's built-in btoa
        return window.btoa(input);
      }
    } catch (error) {
      console.error('Base64 encoding error:', error);
      return '';
    }
  },
  
  // Base64 decoding implementation that works in both web and React Native
  decode: (input: string): string => {
    try {
      if (isReactNative()) {
        // Use global.atob if available in some React Native environments
        if (typeof global.atob === 'function') {
          return global.atob(input);
        }
        
        // Otherwise, use a pure JS implementation
        return customBase64Decode(input);
      } else {
        // Use browser's built-in atob
        return window.atob(input);
      }
    } catch (error) {
      console.error('Base64 decoding error:', error);
      return '';
    }
  }
};

/**
 * Pure JavaScript implementation of base64 encoding
 * This doesn't rely on browser or Node.js specific APIs
 */
function customBase64Encode(str: string): string {
  // The base64 character set
  const base64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  
  let result = '';
  let i = 0;
  
  // Convert the string to a UTF-8 byte array
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      bytes.push(charCode);
    } else if (charCode < 0x800) {
      bytes.push(0xc0 | (charCode >> 6), 
                 0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      bytes.push(0xe0 | (charCode >> 12), 
                 0x80 | ((charCode >> 6) & 0x3f), 
                 0x80 | (charCode & 0x3f));
    } else {
      // Handle UTF-16 surrogate pairs
      i++;
      const c2 = str.charCodeAt(i);
      const c = 0x10000 + (((charCode & 0x3ff) << 10) | (c2 & 0x3ff));
      bytes.push(0xf0 | (c >> 18), 
                 0x80 | ((c >> 12) & 0x3f), 
                 0x80 | ((c >> 6) & 0x3f), 
                 0x80 | (c & 0x3f));
    }
  }
  
  // Convert every three bytes to four base64 characters
  for (i = 0; i < bytes.length; i += 3) {
    const triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    for (let j = 0; j < 4; j++) {
      if (i + j * 0.75 < bytes.length) {
        result += base64chars[(triplet >> (6 * (3 - j))) & 0x3f];
      } else {
        result += '=';
      }
    }
  }
  
  return result;
}

/**
 * Pure JavaScript implementation of base64 decoding
 * This doesn't rely on browser or Node.js specific APIs
 */
function customBase64Decode(str: string): string {
  // The base64 character set
  const base64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  
  // Remove invalid characters
  str = str.replace(/[^A-Za-z0-9+/=]/g, '');
  
  let result = '';
  let i = 0;
  
  // Collect bytes from the base64 string
  const bytes: number[] = [];
  for (i = 0; i < str.length; i += 4) {
    const encoded1 = base64chars.indexOf(str.charAt(i));
    const encoded2 = base64chars.indexOf(str.charAt(i + 1));
    const encoded3 = base64chars.indexOf(str.charAt(i + 2));
    const encoded4 = base64chars.indexOf(str.charAt(i + 3));
    
    const byte1 = (encoded1 << 2) | (encoded2 >> 4);
    const byte2 = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    const byte3 = ((encoded3 & 3) << 6) | encoded4;
    
    bytes.push(byte1);
    
    if (encoded3 !== 64) {
      bytes.push(byte2);
    }
    
    if (encoded4 !== 64) {
      bytes.push(byte3);
    }
  }
  
  // Convert bytes to characters
  let charIndex = 0;
  while (charIndex < bytes.length) {
    let charCode = bytes[charIndex++];
    
    if (charCode < 0x80) {
      result += String.fromCharCode(charCode);
    } else if (charCode > 0xbf && charCode < 0xe0) {
      charCode = ((charCode & 0x1f) << 6) | (bytes[charIndex++] & 0x3f);
      result += String.fromCharCode(charCode);
    } else if (charCode > 0xdf && charCode < 0xf0) {
      charCode = ((charCode & 0x0f) << 12) | 
                ((bytes[charIndex++] & 0x3f) << 6) | 
                (bytes[charIndex++] & 0x3f);
      result += String.fromCharCode(charCode);
    } else {
      // Handle UTF-16 surrogate pairs
      charCode = ((charCode & 0x07) << 18) | 
                ((bytes[charIndex++] & 0x3f) << 12) | 
                ((bytes[charIndex++] & 0x3f) << 6) | 
                (bytes[charIndex++] & 0x3f);
      charCode -= 0x10000;
      result += String.fromCharCode((charCode >> 10) | 0xd800, (charCode & 0x3ff) | 0xdc00);
    }
  }
  
  return result;
}
