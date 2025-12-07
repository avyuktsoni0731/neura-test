/**
 * ESP32 Telemetry Dashboard
 * React Native App
 *
 * @format
 */

import './app.css';
import { StatusBar, useColorScheme, View, Button } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import TelemetryDashboard from './components/TelemetryDashboard';
import SplashScreen from './components/SplashScreen';
import AppNavigator from './src/navigataion/appNavigator.tsx';

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
  const [showTelemetry, setShowTelemetry] = useState(false);

  if (showTelemetry) {
    return (
      <View className="flex-1" style={{ paddingTop: safeAreaInsets.top }}>
        <TelemetryDashboard onBack={() => setShowTelemetry(false)} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ paddingTop: safeAreaInsets.top }}>
      <AppNavigator />
      <View style={{ padding: 20 }}>
        <Button
          title="Open Telemetry Dashboard"
          onPress={() => setShowTelemetry(true)}
        />
      </View>
    </View>
  );
}

export default App;
