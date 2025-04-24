// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

// Common plugins for all bundles
const commonPlugins = [
  peerDepsExternal(),
  resolve(),
  commonjs(),
  terser()
];

// Configuration for the web bundle
const webConfig = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    ...commonPlugins,
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      declarationMap: true,
      sourceMap: true
    })
  ]
};

// Configuration for the React Native bundle
const reactNativeConfig = {
  input: 'src/native/index.ts',
  output: [
    {
      file: 'dist/native.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/native.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    ...commonPlugins,
    typescript({
      tsconfig: './tsconfig.native.json',
      declaration: true,
      declarationDir: 'dist',
      declarationMap: true,
      sourceMap: true
    })
  ],
  // Mark react-native and react-native-webview as external
  external: ['react-native', 'react-native-webview']
};

// Configuration for the unified React Native entry point
const reactNativeEntryConfig = {
  input: 'src/react-native.ts',
  output: [
    {
      file: 'dist/react-native.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/react-native.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    ...commonPlugins,
    typescript({
      tsconfig: './tsconfig.native.json',
      declaration: true,
      declarationDir: 'dist',
      declarationMap: true,
      sourceMap: true
    })
  ],
  // Mark react-native and react-native-webview as external
  external: ['react-native', 'react-native-webview']
};

export default [webConfig, reactNativeConfig, reactNativeEntryConfig];
