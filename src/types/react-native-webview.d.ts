declare module 'react-native-webview' {
  import { Component } from 'react';

  export interface WebViewProps {
    source: { uri: string } | { html: string };
    style?: any;
    onMessage?: (event: WebViewMessageEvent) => void;
    onLoad?: () => void;
    onError?: (error: any) => void;
    injectedJavaScript?: string;
    javaScriptEnabled?: boolean;
    domStorageEnabled?: boolean;
    startInLoadingState?: boolean;
    allowFileAccess?: boolean;
    allowUniversalAccessFromFileURLs?: boolean;
    allowFileAccessFromFileURLs?: boolean;
    [key: string]: any;
  }

  export interface WebViewMessageEvent {
    nativeEvent: {
      data: string;
      url: string;
    };
  }

  export class WebView extends Component<WebViewProps> {
    public injectJavaScript(script: string): void;
  }
}
