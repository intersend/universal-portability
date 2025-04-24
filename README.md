# Universal Portability SDK

A framework for enabling Web3 applications to seamlessly operate across different wallet environments.

## Features

- Seamless integration with React and React Native applications
- Built-in support for wallet connectivity and messaging
- Portable dApp container components for both web and native applications

## Installation

```bash
npm install universal-portability
```

For React Native applications, you'll also need:

```bash
npm install react-native-webview
```

## Usage

### Web Applications

```javascript
import { 
  UniversalPortabilityProvider, 
  Port 
} from 'universal-portability';

function App() {
  return (
    <UniversalPortabilityProvider>
      <Port appUrl="https://yourdapp.com" />
    </UniversalPortabilityProvider>
  );
}
```

### React Native Applications

```javascript
import { 
  UniversalPortabilityProvider, 
  Port,
  usePortHandler
} from 'universal-portability';

function DAppContainer() {
  const { webViewRef, handleWebViewMessage } = usePortHandler();
  
  return (
    <Port 
      ref={webViewRef}
      source={{ uri: "https://yourdapp.com" }}
      onMessage={handleWebViewMessage}
    />
  );
}
```

## React Native Support

The Universal Portability SDK has full React Native support. For detailed instructions on using the SDK in React Native applications, please refer to the [React Native Guide](./REACT_NATIVE.md).

## Package Structure

The package is organized to support both web and native environments:

```
universal-portability/
├── dist/                  # Compiled distribution files
│   ├── index.js           # Main bundle for web
│   ├── index.esm.js       # ESM version
│   ├── native.js          # React Native specific bundle
│   ├── native.esm.js      # ESM version
│   ├── react-native.js    # Combined React Native bundle
│   └── react-native.esm.js # ESM version
```

## Import Paths

For web applications:
```javascript
import { Component } from 'universal-portability';
```

For React Native applications:
```javascript
// ✅ Recommended: Main import (auto-detects React Native)
import { Component } from 'universal-portability';

// ✅ Alternative: Direct React Native imports
import { Component } from 'universal-portability/dist/react-native';
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
