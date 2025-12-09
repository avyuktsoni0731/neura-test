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

export default function TimedUpAndGoScreen({ navigation, route }) {
  const { patient } = route.params;
  const [showInstructions, setShowInstructions] = useState(true);
  const isDarkMode = useColorScheme() === 'dark';
  const safeAreaInsets = useSafeAreaInsets();
  const { telemetry, connectionStatus, reconnect } = useTelemetryData();
  const { saveTimedUpAndGoResults } = useSessionStore();

  // Data collection state
  const [isRecording, setIsRecording] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [averageAmplitude, setAverageAmplitude] = useState<number | null>(null);

  // Use refs to store readings during recording
  const amplitudeReadingsRef = useRef<number[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isConnected = telemetry !== null && connectionStatus === 'connected';

  // Collect telemetry data during recording
  useEffect(() => {
    if (isRecording && telemetry) {
      amplitudeReadingsRef.current.push(telemetry.amp_ms2);
    }
  }, [telemetry, isRecording]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    };
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setStartTime(Date.now());
    amplitudeReadingsRef.current = [];
    setCompletionTime(null);
    setAverageAmplitude(null);
  };

  const stopRecording = () => {
    if (!startTime) return;
    
    setIsRecording(false);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    setCompletionTime(duration);

    // Calculate average amplitude
    const amplitudeReadings = amplitudeReadingsRef.current;
    const avgAmplitude = amplitudeReadings.length > 0
      ? amplitudeReadings.reduce((sum, val) => sum + val, 0) / amplitudeReadings.length
      : 0;

    setAverageAmplitude(avgAmplitude);

    // Save results to session store
    saveTimedUpAndGoResults({
      completionTime: duration,
      averageAmplitude: avgAmplitude,
      sampleCount: amplitudeReadings.length,
    });
  };

  if (showInstructions) {
    return (
      <View
        className="flex-1"
        style={{
          paddingTop: safeAreaInsets.top,
          backgroundColor: '#fff',
        }}
      >
        <ScrollView className="flex-1 px-6 py-4">
          {/* Header */}
          <View className="flex-col items-start justify-between mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Text className="text-blue-600 text-lg">Back</Text>
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-black text-center">
              Timed Up and Go Test
            </Text>
          </View>

          {/* Patient Info */}
          <View className="rounded-xl p-4 mb-6 bg-gray-50">
            <Text className="text-lg font-semibold mb-1 text-black">
              Patient: {patient.name}
            </Text>
            <Text className="text-sm text-gray-600">
              Age: {patient.age} • Sex: {patient.sex}
            </Text>
          </View>

          {/* Instructions */}
          <View
            className="rounded-xl p-6 mb-6 bg-white"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <Text className="text-xl font-bold mb-4 text-black">
              Setup Instructions
            </Text>

            <View className="mb-4">
              <Text className="text-lg font-semibold mb-2 text-black">
                1. Connect to WiFi Network
              </Text>
              <Text className="text-base mb-2 text-gray-700">
                • Network Name:{' '}
                <Text className="font-mono font-bold">Neura-Screening</Text>
              </Text>
              <Text className="text-base mb-3 text-gray-700">
                • Password:{' '}
                <Text className="font-mono font-bold">neura123</Text>
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-lg font-semibold mb-2 text-black">
                2. Test Instructions
              </Text>
              <Text className="text-base mb-2 text-gray-700">
                Ask the patient to:
              </Text>
              <Text className="text-base font-semibold text-blue-600 mb-2">
                "Stand up, walk 3 meters, turn around, walk back, and sit down."
              </Text>
              <Text className="text-sm text-gray-500 mb-2">
                Duration: 2-3 minutes (patient's natural pace)
              </Text>
              <Text className="text-sm text-gray-600">
                • First: Do normally
                {'\n'}• Then: While reciting something (optional)
                {'\n'}• Measure: Time to complete, gait speed, step regularity
              </Text>
            </View>

            {/* Connection Status */}
            <View className="rounded-lg p-4 mb-4 bg-gray-50">
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
                >
                  <Text className="text-black border-md border-black text-xl font-semibold bg-gray-50 p-4 rounded-xl">
                    Refresh
                  </Text>
                </TouchableOpacity>
              </View>
              {!isConnected && (
                <Text className="text-gray-600 text-sm mt-1">
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
            {isRecording ? 'Recording...' : completionTime ? 'Test Complete' : 'Ready'}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Text className="text-red-600 text-lg">Stop</Text>
          </TouchableOpacity>
        </View>

        {/* Control Buttons */}
        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity
            className={`flex-1 rounded-xl p-4 ${
              isRecording ? 'bg-red-600' : 'bg-green-600'
            }`}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={!isConnected}
          >
            <Text className="text-center text-lg font-semibold text-white">
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results Display */}
        {completionTime !== null && averageAmplitude !== null && (
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
                Test Results
              </Text>

              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <Text
                    className={`text-lg ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Completion Time:
                  </Text>
                  <Text
                    className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-blue-600'
                    }`}
                  >
                    {completionTime.toFixed(2)} sec
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
                    {averageAmplitude.toFixed(2)} m/s²
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
                    {amplitudeReadingsRef.current.length}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Live Telemetry Data */}
        {telemetry && isRecording && (
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
                Live Movement Data
              </Text>

              <View className="gap-3">
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
        )}

        {!isRecording && completionTime === null && (
          <View className="flex-1 justify-center items-center">
            <Text
              className={`text-lg ${
                isDarkMode ? 'text-zinc-400' : 'text-gray-600'
              }`}
            >
              Press "Start Recording" to begin the test
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}