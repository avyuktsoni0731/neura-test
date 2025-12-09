import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTelemetryData from '../../utils/useTelemetryData';
import { useSessionStore } from '../store/sessionStore';

export default function PosturalTremorScreen({ navigation, route }) {
  const { patient } = route.params;
  const { savePosturalTremorResults } = useSessionStore();
  const [showInstructions, setShowInstructions] = useState(true);
  const isDarkMode = useColorScheme() === 'dark';
  const safeAreaInsets = useSafeAreaInsets();
  const { telemetry, connectionStatus, reconnect } = useTelemetryData();

  // Data collection state
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [averages, setAverages] = useState<{
    frequency: number;
    amplitude: number;
    sampleCount: number;
  } | null>(null);

  // Use refs to store readings during recording
  const frequencyReadingsRef = useRef<number[]>([]);
  const amplitudeReadingsRef = useRef<number[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isConnected = telemetry !== null && connectionStatus === 'connected';

  // Start recording when transitioning to telemetry screen
  useEffect(() => {
    if (!showInstructions && isConnected && !isRecording) {
      startRecording();
    }
    return () => {
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [showInstructions, isConnected]);

  // Collect telemetry data during recording - use ref to avoid missing updates
  useEffect(() => {
    if (isRecording && telemetry) {
      console.log('Recording telemetry:', telemetry);
      frequencyReadingsRef.current.push(telemetry.hz);
      amplitudeReadingsRef.current.push(telemetry.amp_ms2);
      console.log(
        'Frequency readings count:',
        frequencyReadingsRef.current.length,
      );
      console.log(
        'Amplitude readings count:',
        amplitudeReadingsRef.current.length,
      );
    }
  }, [telemetry, isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setTimeRemaining(30);
    // Reset refs instead of state
    frequencyReadingsRef.current = [];
    amplitudeReadingsRef.current = [];
    setAverages(null);

    // Countdown timer
    countdownTimerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Stop recording after 30 seconds
    recordingTimerRef.current = setTimeout(() => {
      stopRecording();
    }, 30000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);

    const frequencyReadings = frequencyReadingsRef.current;
    const amplitudeReadings = amplitudeReadingsRef.current;

    const avgFrequency =
      frequencyReadings.length > 0
        ? frequencyReadings.reduce((sum, val) => sum + val, 0) /
          frequencyReadings.length
        : 0;

    const avgAmplitude =
      amplitudeReadings.length > 0
        ? amplitudeReadings.reduce((sum, val) => sum + val, 0) /
          amplitudeReadings.length
        : 0;

    const results = {
      frequency: avgFrequency,
      amplitude: avgAmplitude,
      sampleCount: frequencyReadings.length,
    };

    setAverages(results);

    // Save to session store
    savePosturalTremorResults(results);
  };

  if (showInstructions) {
    return (
      <View
        className="flex-1 "
        style={{
          paddingTop: safeAreaInsets.top,
          backgroundColor: '#fff',
        }}
      >
        <ScrollView className="flex-1 px-6 py-4 ">
          {/* Header */}
          <View className="flex-col items-start justify-between mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Text className="text-blue-600 text-lg">Back</Text>
            </TouchableOpacity>
            <Text
              className={`text-xl font-semibold text-black text-center
              `}
            >
              Postural Tremor Test
            </Text>
          </View>

          {/* Patient Info */}
          <View className={`rounded-xl p-4 mb-6 bg-gray-50`}>
            <Text className={`text-lg font-semibold mb-1 text-black`}>
              Patient: {patient.name}
            </Text>
            <Text className={`text-sm text-gray-600`}>
              Age: {patient.age} • Sex: {patient.sex}
            </Text>
          </View>

          {/* Instructions */}
          <View
            className={`rounded-xl p-6 mb-6 bg-white`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <Text className={`text-xl font-bold mb-4 text-black`}>
              Setup Instructions
            </Text>

            <View className="mb-4">
              <Text className={`text-lg font-semibold mb-2 text-black`}>
                1. Connect to WiFi Network
              </Text>
              <Text className={`text-base mb-2  text-gray`}>
                • Network Name:{' '}
                <Text className="font-mono font-bold">Neura-Screening</Text>
              </Text>
              <Text className={`text-base mb-3 text-gray-700`}>
                • Password:{' '}
                <Text className="font-mono font-bold">neura123</Text>
              </Text>
            </View>

            <View className="mb-4">
              <Text className={`text-lg font-semibold mb-2 text-black`}>
                2. Test Instructions
              </Text>
              <Text className={`text-base mb-2 text-gray-700`}>
                Ask the patient to:
              </Text>
              <Text className={`text-base font-semibold text-blue-600`}>
                "Hold both arms outstretched at shoulder-height, palms down."
              </Text>
              <Text className={`text-sm mt-2 text-gray-500`}>
                Duration: 30 seconds
              </Text>
            </View>

            {/* Connection Status */}
            <View className={`rounded-lg p-4 mb-4 bg-gray-50`}>
              <View className="flex-col items-center justify-between gap-4">
                <View className="flex-row items-center">
                  <Text className="text-lg mr-2">
                    {isConnected ? '✅' : '❌'}
                  </Text>
                  <Text className="font-semibold text-black">
                    {isConnected ? 'Device Connected' : 'Device Not Connected'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={reconnect}
                  className="bg-blue-600 px-3 py-1 rounded-lg"
                  style={{
                    opacity: isConnected ? 1 : 0.5,
                    marginInline: 10,
                    marginVertical: 10,
                  }}
                >
                  <Text className="text-black border-md border-black text-xl font-semibold bg-gray-50 p-4 rounded-xl">
                    Refresh
                  </Text>
                </TouchableOpacity>
              </View>
              {!isConnected && (
                <Text className="text-white text-sm mt-1">
                  Connect to Neura-Screening WiFi, then tap Refresh
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Next Button */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            className={`rounded-xl p-4 ${
              isConnected ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            onPress={() => setShowInstructions(false)}
            disabled={!isConnected}
          >
            <Text
              className={`text-center text-lg font-semibold ${
                isConnected ? 'text-white' : 'text-gray-500'
              }`}
            >
              {isConnected ? 'Start Test' : 'Connect Device First'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Telemetry readings screen
  return (
    <View
      className="flex-1"
      style={{
        paddingTop: safeAreaInsets.top,
        backgroundColor: isDarkMode ? '#000' : '#fff',
      }}
    >
      <View className="px-6 py-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => setShowInstructions(true)}
            className="p-2"
          >
            <Text className="text-blue-600 text-lg">← Instructions</Text>
          </TouchableOpacity>
          <Text
            className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-black'
            }`}
          >
            {isRecording
              ? `Recording... ${timeRemaining}s`
              : averages
              ? 'Test Complete'
              : 'Ready'}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Text className="text-red-600 text-lg">Stop</Text>
          </TouchableOpacity>
        </View>

        {/* Timer Display */}
        {isRecording && (
          <View className="items-center mb-6">
            <Text
              className={`text-4xl font-bold ${
                timeRemaining <= 5 ? 'text-white' : 'text-white'
              }`}
            >
              {timeRemaining}
            </Text>
            <Text
              className={`text-sm ${
                isDarkMode ? 'text-white' : 'text-gray-600'
              }`}
            >
              seconds remaining
            </Text>
          </View>
        )}

        {/* Results Display */}
        {averages && (
          <View className="gap-4 mb-6">
            <View
              className={`rounded-xl p-6 ${
                isDarkMode ? 'bg-black' : 'bg-green-50'
              }`}
            >
              <Text
                className={`text-xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-black'
                }`}
              >
                Test Results (30s Average)
              </Text>

              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <Text
                    className={`text-lg ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Average Frequency:
                  </Text>
                  <Text
                    className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-blue-600'
                    }`}
                  >
                    {averages?.frequency.toFixed(2)} Hz
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text
                    className={`text-lg ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Average Amplitude:
                  </Text>
                  <Text
                    className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-purple-600'
                    }`}
                  >
                    {averages.amplitude.toFixed(2)} m/s²
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text
                    className={`text-sm ${
                      isDarkMode ? 'text-zinc-400' : 'text-gray-500'
                    }`}
                  >
                    Samples collected:
                  </Text>
                  <Text
                    className={`text-sm ${
                      isDarkMode ? 'text-zinc-400' : 'text-gray-500'
                    }`}
                  >
                    {averages.sampleCount}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Live Telemetry Data */}
        {telemetry && isRecording ? (
          <View className="gap-4">
            <View
              className={`rounded-xl p-6 ${
                isDarkMode ? 'bg-zinc-900' : 'bg-white'
              }`}
            >
              <Text
                className={`text-xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-black'
                }`}
              >
                Live Tremor Data
              </Text>

              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <Text
                    className={`text-lg ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Frequency:
                  </Text>
                  <Text
                    className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-blue-600'
                    }`}
                  >
                    {telemetry.hz.toFixed(2)} Hz
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text
                    className={`text-lg ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Amplitude:
                  </Text>
                  <Text
                    className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-purple-600'
                    }`}
                  >
                    {telemetry.amp_ms2.toFixed(2)} m/s²
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : !isRecording && !averages ? (
          <View className="flex-1 justify-center items-center">
            <Text
              className={`text-lg ${
                isDarkMode ? 'text-zinc-400' : 'text-gray-600'
              }`}
            >
              Waiting for sensor data...
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
