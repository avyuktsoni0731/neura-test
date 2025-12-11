import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/appstore.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';

import LoginScreen from '../screens/loginScreen.tsx';
import BottomTabs from './navbar.tsx';
import AddPatientScreen from '../screens/addPatient.tsx';
import Question1 from '../screens/questions/q1.tsx';
import Question2 from '../screens/questions/q2.tsx';
import Question3 from '../screens/questions/q3.tsx';
import Question4 from '../screens/questions/q4.tsx';
import Question5 from '../screens/questions/q5.tsx';
import TestResult from '../screens/questions/result.tsx';
import HomeScreen from '../screens/home.tsx';
import MotorTestInstructionsScreen from '../screens/motorTests/MotorTestInstructions.tsx';
import PosturalTremorScreen from '../screens/motorTests/PosturalTremor.tsx';
import RestTremorScreen from '../screens/motorTests/RestTremor.tsx';
import NeuroSenseReportScreen from '../screens/NeuroSenseReport.tsx';
import OnboardingContainer from '../screens/onboarding/OnboardingContainer.tsx';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  MainTabs: undefined;
  AddPatient: { onPatientAdded?: () => void };
  Screening: { patient: any };
  MotorTestInstructions: { patient: any };
  PosturalTremor: { patient: any };
  RestTremor: { patient: any };
  NeuroSenseReport: { patient: any };
  TimedUpAndGo: { patient: any };
  Question1: { patient: any };
  Question2: { patient: any };
  Question3: { patient: any };
  Question4: { patient: any };
  Question5: { patient: any };
  TestResult: { patient: any };
  Onboarding: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isLoggedIn, loadSavedPractitioner } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      await loadSavedPractitioner();

      const onboardingComplete = await AsyncStorage.getItem(
        'onboarding_complete',
      );
      const hasSeenOnboarding = onboardingComplete === 'true';
      setHasSeenOnboarding(hasSeenOnboarding);
      setShowOnboarding(!hasSeenOnboarding);

      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
  };

  if (isLoading) {
    return null;
  }

  if (showOnboarding) {
    return (
      <NavigationContainer>
        <OnboardingContainer onComplete={handleOnboardingComplete} />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={isLoggedIn ? 'MainTabs' : 'Login'} // start where you want
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name="AddPatient" component={AddPatientScreen} />
      <Stack.Screen name="MotorTestInstructions" component={MotorTestInstructionsScreen} />
      <Stack.Screen name="RestTremor" component={RestTremorScreen} />
      <Stack.Screen name="PosturalTremor" component={PosturalTremorScreen} />
      <Stack.Screen name="NeuroSenseReport" component={NeuroSenseReportScreen} />

        <Stack.Screen name="Question1" component={Question1} />
        <Stack.Screen name="Question2" component={Question2} />
        <Stack.Screen name="Question3" component={Question3} />
        <Stack.Screen name="Question4" component={Question4} />
        <Stack.Screen name="Question5" component={Question5} />
        <Stack.Screen name="TestResult" component={TestResult} />
      </Stack.Navigator>
    
  </NavigationContainer>
  );
}
