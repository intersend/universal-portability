declare module 'react-native' {
  import { CSSProperties } from 'react';

  export interface ViewProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface TextProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface ImageProps {
    style?: any;
    source: { uri: string } | number;
    [key: string]: any;
  }

  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const Image: React.ComponentType<ImageProps>;
  export const StyleSheet: {
    create<T extends Record<string, CSSProperties>>(styles: T): T;
  };
  
  export interface AppStateStatic {
    currentState: string;
    addEventListener(type: string, listener: (state: AppStateStatus) => void): {
      remove: () => void;
    };
  }
  
  export type AppStateStatus = 'active' | 'background' | 'inactive';
  
  export const AppState: AppStateStatic;
}
