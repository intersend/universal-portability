# Universal Portability SDK - Troubleshooting Guide

This guide is intended to help you resolve common issues when using the Universal Portability SDK in your React or React Native applications.

## React Native Import Issues

### Issue: Unable to resolve module 'universal-portability/native'

If you see errors like:
```
Unable to resolve "universal-portability/native" from "src/screens/WalletScreen.tsx"
```

**Solutions:**

1. **Use the main import path with auto-detection:**
   ```javascript
   // Import directly from the main package
   import { 
     UniversalPortabilityProvider, 
     usePortHandler,
     usePortableApps
   } from 'universal-portability';  // Will auto-detect React Native
   ```

2. **If still experiencing issues, use the direct dist path:**
   ```javascript
   // Import directly from the React Native dist file
   import { 
     UniversalPortabilityProvider, 
     usePortHandler,
     usePortableApps
   } from 'universal-portability/dist/react-native';
   ```

3. **Configure Metro bundler** by adding a metro.config.js file at the root of your project:
   ```javascript
   module.exports = {
     resolver: {
       extraNodeModules: {
         'universal-portability/native': require.resolve('universal-portability/dist/native'),
         'universal-portability': require.resolve('universal-portability/dist/react-native')
       }
     }
   };
   ```

### Issue: atob/btoa is not defined errors

If you encounter errors related to `atob` or `btoa` not being defined:

**Solutions:**

1. **Use direct imports from react-native bundle:**
   ```javascript
   // This bundle has platform-specific implementations
   import { usePortableApps } from 'universal-portability/dist/react-native';
   ```

2. **Add polyfills** (if needed for other packages):
   ```javascript
   // In your app's entry point (index.js)
   import { decode as atob, encode as btoa } from 'base-64';
   
   if (typeof global.btoa === 'undefined') {
     global.btoa = btoa;
   }
   
   if (typeof global.atob === 'undefined') {
     global.atob = atob;
   }
   
   // Don't forget to install the package
   // npm install base-64
   ```

## Common Issues

### Issue: Missing dist directory

If you receive errors indicating that the dist directory or files are missing:

**Solutions:**

1. **Verify package version:** Ensure you're using version 1.3.3 or later which includes critical fixes
   ```bash
   npm list universal-portability
   ```

2. **Clean install:**
   ```bash
   npm remove universal-portability
   npm cache clean --force
   npm install universal-portability
   ```

3. **For package maintainers:** If you're maintaining a fork of this package, always run the verification scripts before publishing:
   ```bash
   npm run verify-dist
   npm run verify-pack
   ```

### Issue: WebView communication not working

If the communication between your wallet app and embedded dApps isn't working:

**Solutions:**

1. **Verify your setup:**
   - Ensure you're passing the `webViewRef` to the Port component
   - Verify `handleWebViewMessage` is connected to the WebView's `onMessage` prop
   - Check that you're wrapping your app with `UniversalPortabilityProvider`

2. **Check console logs** for any errors or warnings

3. **Try using direct imports:**
   ```javascript
   import { 
     Port,
     usePortHandler 
   } from 'universal-portability/dist/native';
   ```

## Need More Help?

If you're still experiencing issues after trying these solutions, please open an issue on GitHub with:

1. Your environment details (React Native version, device/emulator, etc.)
2. Steps to reproduce the issue
3. Any error messages or logs
4. Code snippets demonstrating the issue

Our team will investigate and help you resolve the problem as quickly as possible.
