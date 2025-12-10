import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppStore } from '../store/appstore.js';

import LoginScreen from '../screens/loginScreen.tsx'; // Update to .tsx
import BottomTabs from '../navigation/appNavigator.tsx';
import AddPatientScreen from '../screens/addPatient.tsx';
import PosturalTremorScreen from '../screens/PosturalTremor.tsx';
import TimedUpAndGoScreen from '../screens/TimedUpAndGo.tsx';

type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  AddPatient: { onPatientAdded?: () => void };
  Screening: { patient: any };
  PosturalTremor: { patient: any };
  TimedUpAndGo: { patient: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isLoggedIn, loadSavedPractitioner } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedPractitioner().finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabs} />
            <Stack.Screen name="AddPatient" component={AddPatientScreen} />
            <Stack.Screen
              name="PosturalTremor"
              component={PosturalTremorScreen}
            />
            <Stack.Screen
              name="TimedUpAndGo"
              component={TimedUpAndGoScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
