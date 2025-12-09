/**
 * ESP32 Telemetry Dashboard
 * React Native App
 *
 * @format
 */

import './app.css';
import './nativewind-env.d.ts';
import { StatusBar, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import SplashScreen from './components/SplashScreen';
import AppNavigator from './src/navigation/appNavigator.tsx';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
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
