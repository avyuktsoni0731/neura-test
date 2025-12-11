/**
 * ESP32 Telemetry Dashboard
 * React Native App
 *
 * @format
 */

import './app.css';
import './nativewind-env.d.ts';
import './src/i18n'; // Initialize i18n

// Polyfill TextDecoder for React Native (required by @react-pdf/renderer)
if (typeof TextDecoder === 'undefined') {
  (global as any).TextDecoder = class TextDecoder {
    decode(input: any) {
      if (typeof input === 'string') return input;
      const bytes = new Uint8Array(input);
      let result = '';
      for (let i = 0; i < bytes.length; i++) {
        result += String.fromCharCode(bytes[i]);
      }
      return result;
    }
  };
}
import { StatusBar, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import SplashScreen from './components/SplashScreen';
import AppNavigator from './src/navigation/appNavigator.tsx';
import { NavigationContainer } from '@react-navigation/native';
import { loadSavedLanguage } from './src/i18n';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Load saved language preference
      await loadSavedLanguage();
      
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ paddingTop: safeAreaInsets.top }}>
      <AppNavigator />
    </View>
  );
}

export default App;
