import React, { useRef, useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { sendPortabilityMessageToWebView } from './messageUtils';
import { MessageType, PortabilityMessage } from '../utils/messageTypes';
import { WalletInfoPayload } from '../types';

interface NativePortProps {
  source: { uri: string };
  address?: string;
  rpcUrl?: string;
  chainId?: number;
  style?: any;
  onMessage?: (event: WebViewMessageEvent) => void;
  onLoad?: () => void;
  onError?: (error: any) => void;
  injectedJavaScript?: string;
}

/**
 * NativePort is the React Native equivalent of the web Port component.
 * It uses WebView instead of iframe to embed dApps.
 */
export const NativePort: React.FC<NativePortProps> = ({
  source,
  address,
  rpcUrl,
  chainId,
  style,
  onMessage: userOnMessage,
  onLoad,
  onError,
  injectedJavaScript: userInjectedJavaScript,
  ...props
}) => {
  const webViewRef = useRef<WebView>(null);
  
  // Setup initial configuration to inject into WebView
  const initialConfig = `
    window.ethereum = {
      isMetaMask: true,
      address: "${address || ''}",
      chainId: ${chainId || 1},
      rpcUrl: "${rpcUrl || ''}",
      // Add placeholder methods that will be replaced by message handlers
      request: function(payload) {
        return new Promise((resolve, reject) => {
          window.postMessage(
            {
              type: 'RPC_REQUEST',
              payload,
              id: Date.now().toString()
            },
            '*'
          );
        });
      }
    };

    // Let the host know the WebView is ready
    window.postMessage(
      { 
        type: 'WALLET_WEBVIEW_READY', 
        payload: {}, 
        id: Date.now().toString() 
      }, 
      '*'
    );
    true;
  `;

  // Combine user's injected JavaScript with ours
  const injectedJavaScript = `
    ${initialConfig}
    ${userInjectedJavaScript || ''}
  `;

  // Handle messages from WebView
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      // Process the message based on type
      switch (message.type) {
        case 'INTERSPACE_CONNECT_REQUEST':
          if (address && chainId) {
            const connectResponse: PortabilityMessage = {
              type: 'INTERSPACE_CONNECT_RESPONSE',
              payload: {
                address,
                chainId,
                isConnected: true
              } as WalletInfoPayload,
              id: message.id || Date.now().toString()
            };
            sendPortabilityMessageToWebView(webViewRef, connectResponse);
          }
          break;
          
        case 'SIGN_MESSAGE_REQUEST':
          // Forward to the wallet
          break;
          
        case 'TRANSACTION_REQUEST':
          // Forward to the wallet
          break;
      }
      
      // Forward the message to user handler if provided
      if (userOnMessage) {
        userOnMessage(event);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  }, [address, chainId, userOnMessage]);

  /**
   * Public method to send messages to the WebView
   */
  const sendMessageToWebView = useCallback((message: PortabilityMessage) => {
    sendPortabilityMessageToWebView(webViewRef, message);
  }, []);

  // Expose sendMessageToWebView method to parent components
  useEffect(() => {
    if (webViewRef.current) {
      (webViewRef.current as any).sendMessageToWebView = sendMessageToWebView;
    }
  }, [sendMessageToWebView]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={source}
        onMessage={handleMessage}
        onLoad={onLoad}
        onError={onError}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});

export default NativePort;
