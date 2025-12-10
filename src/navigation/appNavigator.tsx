import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/appstore.js';

import LoginScreen from '../screens/loginScreen.tsx';
import BottomTabs from './navbar.tsx';
import AddPatientScreen from '../screens/addPatient.tsx';
import Question1 from '../screens/questions/q1.tsx';
import Question2 from '../screens/questions/q2.tsx';
import Question2Select from '../screens/questions/q2select.tsx';
import Question3 from '../screens/questions/q3.tsx';
import Question3Select from '../screens/questions/q3select.tsx'
import Question4 from '../screens/questions/q4.tsx';
import Question4Select from '../screens/questions/q4select.tsx';
import Question5 from '../screens/questions/q5.tsx';
import Question5Select from '../screens/questions/q5select.tsx';
import TestResult from '../screens/questions/result.tsx';
import HomeScreen from '../screens/home.tsx';
import PosturalTremorScreen from '../screens/PosturalTremor.tsx';
import TimedUpAndGoScreen from '../screens/TimedUpAndGo.tsx';
import DelayTimer from '../screens/questions/timer.tsx';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  MainTabs: undefined;
  AddPatient: { onPatientAdded?: () => void };
  Screening: { patient: any };
  PosturalTremor: { patient: any };
  TimedUpAndGo: { patient: any };
  Question1: undefined;
  Question2: undefined;
  Question2Select: undefined;
  Question3: undefined;
  Question3Select: undefined;
  Question4: undefined;
  Question4Select: undefined;
  Question5: undefined;
  Question5Select: undefined;
  TestResult: undefined;
  DelayTimer: {
    nextScreen: keyof RootStackParamList;
    durationMinutes?: number;
    questionNumber?: number;
  }
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
      screenOptions={{ headerShown: false }}
      initialRouteName={isLoggedIn ? 'MainTabs' : 'Login'} // start where you want
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name="AddPatient" component={AddPatientScreen} />
      <Stack.Screen name="PosturalTremor" component={PosturalTremorScreen} />
      <Stack.Screen name="TimedUpAndGo" component={TimedUpAndGoScreen} />
      <Stack.Screen name="Question1" component={Question1} />
      <Stack.Screen name="Question2" component={Question2} />
      <Stack.Screen name="DelayTimer" component={DelayTimer}/>
      <Stack.Screen name="Question2Select" component = {Question2Select} />
      <Stack.Screen name="Question3" component={Question3} />
      <Stack.Screen name="Question3Select" component={Question3Select} />
      <Stack.Screen name="Question4" component={Question4} />
      <Stack.Screen name="Question4Select" component={Question4Select}/>
      <Stack.Screen name="Question5" component={Question5} />
      <Stack.Screen name="Question5Select" component={Question5Select}/>
      <Stack.Screen name="TestResult" component={TestResult} />
    </Stack.Navigator>
  );
}
