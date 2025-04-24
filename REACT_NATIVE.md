# Universal Portability SDK for React Native

This guide explains how to use the Universal Portability SDK in React Native wallet applications. The SDK makes it easy to integrate dApps from our app store into your React Native wallet.

## Installation

Install the Universal Portability SDK along with React Native WebView:

```bash
# Install the SDK
npm install universal-portability

# Install required peer dependency
npm install react-native-webview
```

## Import Paths

> **IMPORTANT**: When using Universal Portability SDK in React Native, you need to use these import patterns to ensure compatibility:

```javascript
// ✅ Recommended: Use this import path that includes all React Native components 
import { 
  UniversalPortabilityProvider, 
  usePortHandler,
  usePortableApps 
} from 'universal-portability'; // The SDK automatically detects React Native

// ✅ Alternative: If you encounter resolution issues, use the direct import path
import { 
  UniversalPortabilityProvider, 
  usePortHandler,
  usePortableApps 
} from 'universal-portability/dist/react-native';

// ⚠️ For Metro bundler compatibility issues
// Add a metro.config.js file at the root of your project:
/*
module.exports = {
  resolver: {
    extraNodeModules: {
      'universal-portability/native': require.resolve('universal-portability/dist/native'),
      'universal-portability': require.resolve('universal-portability/dist/react-native')
    }
  }
};
*/
```

## Basic Setup

Wrap your application with the Universal Portability Provider:

```tsx
import React from 'react';
import { UniversalPortabilityProvider } from 'universal-portability';
import YourWalletProvider from './your-wallet-provider';

function App() {
  return (
    <YourWalletProvider>
      <UniversalPortabilityProvider>
        {/* Your wallet app */}
      </UniversalPortabilityProvider>
    </YourWalletProvider>
  );
}

export default App;
```

## Implementing Message Handlers

Your wallet needs to handle messages from embedded dApps to process requests like connecting, signing messages, or approving transactions.

### Step 1: Create a Message Handler

```tsx
// src/hooks/useWalletMessageHandler.ts
import { useCallback } from 'react';
import { useUniversalPortability, usePortHandler } from 'universal-portability';
import { useWallet } from './your-wallet-hooks'; // Your wallet hooks

export function useWalletMessageHandler() {
  const { address, chainId, signer } = useWallet();
  
  // This port handler sets up the WebView message handling
  const { webViewRef, handleWebViewMessage, isReady } = usePortHandler({
    address,
    chainId,
    signer
  });
  
  return {
    webViewRef,
    handleWebViewMessage,
    isReady
  };
}
```

## Creating a dApp Container

Create a component that will display and interact with embedded dApps:

```tsx
// src/components/DAppContainer.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Port } from 'universal-portability';
import { useWalletMessageHandler } from '../hooks/useWalletMessageHandler';
import { useWallet } from './your-wallet-hooks'; // Your wallet hooks

interface DAppContainerProps {
  appUrl: string;
  height?: number;
  width?: number;
}

export function DAppContainer({ appUrl, height = 500, width = '100%' }: DAppContainerProps) {
  const { address, chainId, rpcUrl } = useWallet();
  const { webViewRef, handleWebViewMessage, isReady } = useWalletMessageHandler();
  
  if (!isReady) {
    return <Text>Loading wallet...</Text>;
  }
  
  return (
    <View style={styles.container}>
      <Port
        ref={webViewRef}
        source={{ uri: appUrl }}
        address={address}
        chainId={chainId}
        rpcUrl={rpcUrl}
        style={{ height, width }}
        onMessage={handleWebViewMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
```

## Creating a dApp Store

Display all available dApps in a list or grid:

```tsx
// src/screens/DAppStore.tsx
import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { usePortableApps } from 'universal-portability';
import { useNavigation } from '@react-navigation/native'; // Assuming you use React Navigation

export function DAppStore() {
  const { apps, loading, error } = usePortableApps();
  const navigation = useNavigation();
  
  if (loading) {
    return <Text>Loading apps...</Text>;
  }
  
  if (error) {
    return <Text>Error loading apps: {error.message}</Text>;
  }
  
  const handleAppPress = (app) => {
    navigation.navigate('DAppScreen', { 
      app, 
      appUrl: `https://interspace.fi/apps/${app.slug}` 
    });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>dApp Store</Text>
      
      <FlatList
        data={apps}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.appCard}
            onPress={() => handleAppPress(item)}
          >
            <Image source={{ uri: item.logo }} style={styles.appLogo} />
            <Text style={styles.appName}>{item.name}</Text>
            <Text style={styles.appCategory}>{item.category.join(', ')}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  appCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  appLogo: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginBottom: 8,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  appCategory: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
```

## DApp Screen

Create a screen to display the selected dApp:

```tsx
// src/screens/DAppScreen.tsx
import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { DAppContainer } from '../components/DAppContainer';

export function DAppScreen({ route }) {
  const { app, appUrl } = route.params;
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <DAppContainer appUrl={appUrl} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});
```

## Key Differences from Web Implementation

When using Universal Portability SDK in React Native, there are a few key differences compared to the web version:

1. **Import Path**: Use the main `universal-portability` import which automatically detects React Native
2. **WebView vs iFrame**: React Native uses WebView instead of iFrames, but our SDK handles this difference for you
3. **Message Handling**: The WebView communication uses React Native's message event system rather than browser's postMessage
4. **Refs**: You need to pass WebView refs for proper communication between your wallet and embedded dApps

## Communication Flow

```
┌─────────────────┐                  ┌─────────────────┐
│                 │ postMessage      │                 │
│  Wallet App     │◄─────────────────┤  dApp (WebView) │
│  (React Native) │                  │                 │
│                 │ injectJavaScript │                 │
│                 ├─────────────────►│                 │
└─────────────────┘                  └─────────────────┘
```

## Troubleshooting

If you encounter issues with WebView communication:

1. Ensure you've correctly passed the `webViewRef` to the Port component
2. Verify that `handleWebViewMessage` is connected to the WebView's `onMessage` prop
3. Check that your wallet is correctly providing the address, chainId, and signer to usePortHandler
4. Confirm that UniversalPortabilityProvider is correctly wrapping your app

For additional support, please refer to our documentation or contact our support team.
