/**
 * ESP32 Telemetry Dashboard
 * React Native App
 *
 * @format
 */

import './app.css';
import { StatusBar, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import TelemetryDashboard from './components/TelemetryDashboard';
import SplashScreen from './components/SplashScreen';

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
      <TelemetryDashboard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
*/


/*import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/loginScreen.js';
import HomeScreen from './src/screens/home.js';

const Stack = createNativeStackNavigator();

export default function App() {
  return(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name ="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}*/
/*
import React from 'react';
import AppNavigator from './src/navigataion/appNavigator.js';

export default function App(){
  return <AppNavigator />;
}*/

import React from 'react';
import AppNavigator from './src/navigataion/appNavigator.tsx';

const App: React.FC = () => {
  return <AppNavigator />;
};

export default App;
