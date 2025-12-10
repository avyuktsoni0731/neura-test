import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/appstore.js';

import FingerTappingCamera from '../screens/FingerTappingCamera';
import LoginScreen from '../screens/loginScreen';
import BottomTabs from './navbar';
import AddPatientScreen from '../screens/addPatient';
import Question1 from '../screens/questions/q1';
import Question2 from '../screens/questions/q2';
import Question3 from '../screens/questions/q3';
import Question4 from '../screens/questions/q4';
import Question5 from '../screens/questions/q5';
import TestResult from '../screens/questions/result';
import HomeScreen from '../screens/home';
import PosturalTremorScreen from '../screens/PosturalTremor';
import TimedUpAndGoScreen from '../screens/TimedUpAndGo';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  MainTabs: undefined;
  AddPatient: { onPatientAdded?: () => void };
  Screening: { patient: any };
  PosturalTremor: { patient: any };
  TimedUpAndGo: { patient: any };
  FingerTapping: { patient: any };
  Question1: undefined;
  Question2: undefined;
  Question3: undefined;
  Question4: undefined;
  Question5: undefined;
  TestResult: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isLoggedIn, loadSavedPractitioner } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedPractitioner().finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      id="root"
      screenOptions={{ headerShown: false }}
      initialRouteName={isLoggedIn ? 'MainTabs' : 'Login'} // start where you want
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name="AddPatient" component={AddPatientScreen} />
      <Stack.Screen name="PosturalTremor" component={PosturalTremorScreen} />
      <Stack.Screen name="TimedUpAndGo" component={TimedUpAndGoScreen} />
      <Stack.Screen name="FingerTapping" component={FingerTappingCamera} options={{ headerShown: true, title: 'Finger Tapping Test' }} />

      <Stack.Screen name="Question1" component={Question1} />
      <Stack.Screen name="Question2" component={Question2} />
      <Stack.Screen name="Question3" component={Question3} />
      <Stack.Screen name="Question4" component={Question4} />
      <Stack.Screen name="Question5" component={Question5} />
      <Stack.Screen name="TestResult" component={TestResult} />
    </Stack.Navigator>
  );
}
