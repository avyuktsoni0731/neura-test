/**
 * ESP32 Telemetry Dashboard
 * React Native App
 *
 * @format
 */

import './app.css';
import './nativewind-env.d.ts';
import './src/i18n';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
