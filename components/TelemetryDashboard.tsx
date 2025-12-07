import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  useColorScheme,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useWebSocket } from '../hooks/useWebSocket';

interface TelemetryData {
  pitch: number;
  roll: number;
  yaw: number;
  bpm: number;
  rawBPM: number;
  status?: string;
  timestamp?: number;
}

interface TelemetryDashboardProps {
  onBack?: () => void;
}

const WS_URL = 'ws://192.168.4.1:81/';

export default function TelemetryDashboard({
  onBack,
}: TelemetryDashboardProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const { readyState, lastMessage } = useWebSocket(WS_URL);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage) as TelemetryData;
        setTelemetry(data);
        console.log('✅ Successfully parsed telemetry:', data);
      } catch (e) {
        console.error('❌ Failed to parse telemetry data:', e);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    if (readyState === WebSocket.CONNECTING) {
      setConnectionAttempts(prev => prev + 1);
      console.log(
        `🔄 Connection attempt #${connectionAttempts + 1} to ${WS_URL}`,
      );
    }
  }, [readyState]);

  const connectionStatus = () => {
    switch (readyState) {
      case WebSocket.CONNECTING:
        return { label: 'Connecting', color: '#EAB308' };
      case WebSocket.OPEN:
        return { label: 'Connected', color: '#22C55E' };
      case WebSocket.CLOSING:
        return { label: 'Closing', color: '#F97316' };
      default:
        return { label: 'Disconnected', color: '#EF4444' };
    }
  };

  const status = connectionStatus();

  return (
    <ScrollView
      className={`flex-1 ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Back Button */}
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          className="flex-row items-center justify-center mb-4"
        >
          <View className="flex-row items-baseline rounded-xl justify-center bg-blue-600/10 px-4 py-2">
            <Text className="text-xl mr-2">←</Text>
            <Text
              className={`text-lg ${
                isDarkMode ? 'text-gray-50' : 'text-zinc-900'
              }`}
            >
              Back
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Header */}
      <View className="items-center mb-6">
        <Text
          className={`text-3xl font-bold mb-3 ${
            isDarkMode ? 'text-gray-50' : 'text-zinc-900'
          }`}
        >
          ESP32 Telemetry
        </Text>
        <View className="flex-row items-center gap-2">
          <View
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: status.color,
              opacity: readyState === WebSocket.OPEN ? 1 : 0.8,
            }}
          />
          <Text
            className="text-sm font-semibold"
            style={{ color: status.color }}
          >
            {status.label}
          </Text>
        </View>
        <Text
          className={`text-xs text-center mt-2 px-5 ${
            isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
          }`}
        >
          {WS_URL}
        </Text>
        {readyState === WebSocket.CLOSED && connectionAttempts > 0 && (
          <Text
            className="text-xs text-center mt-1 px-5"
            style={{ color: '#EF4444' }}
          >
            ⚠️ Connection failed. Make sure:
            {'\n'}• ESP32 is powered on
            {'\n'}• Device is on same WiFi network
            {'\n'}• ESP32 IP is{' '}
            {WS_URL.replace('ws://', '').replace(':81/', '')}
          </Text>
        )}
      </View>

      {telemetry ? (
        <View className="gap-5">
          {/* MPU6500 Sensor Card */}
          <View
            className={`rounded-2xl p-5 shadow-lg ${
              isDarkMode ? 'bg-zinc-900' : 'bg-white'
            }`}
          >
            <View className="flex-row items-center mb-4 gap-3">
              <View className="w-10 h-10 rounded-xl justify-center items-center bg-blue-600/10">
                <Text className="text-xl">📱</Text>
              </View>
              <View className="flex-1">
                <Text
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-gray-50' : 'text-zinc-900'
                  }`}
                >
                  MPU6500
                </Text>
                <Text
                  className={`text-xs mt-0.5 ${
                    isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  Motion Sensor
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <DataRow
                label="Pitch"
                value={telemetry.pitch?.toFixed(2)}
                unit="°"
                color="#2563EB"
                isDarkMode={isDarkMode}
              />
              <DataRow
                label="Roll"
                value={telemetry.roll?.toFixed(2)}
                unit="°"
                color="#9333EA"
                isDarkMode={isDarkMode}
              />
              <DataRow
                label="Yaw"
                value={telemetry.yaw?.toFixed(2)}
                unit="°"
                color="#4F46E5"
                isDarkMode={isDarkMode}
              />
            </View>
          </View>

          {/* MAX30102 Sensor Card */}
          <View
            className={`rounded-2xl p-5 shadow-lg ${
              isDarkMode ? 'bg-zinc-900' : 'bg-white'
            }`}
          >
            <View className="flex-row items-center mb-4 gap-3">
              <View className="w-10 h-10 rounded-xl justify-center items-center bg-red-600/10">
                <Text className="text-xl">❤️</Text>
              </View>
              <View className="flex-1">
                <Text
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-gray-50' : 'text-zinc-900'
                  }`}
                >
                  MAX30102
                </Text>
                <Text
                  className={`text-xs mt-0.5 ${
                    isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  Heart Rate Sensor
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <View
                className={`rounded-xl p-4 ${
                  isDarkMode ? 'bg-zinc-800/50' : 'bg-zinc-100'
                }`}
              >
                <Text
                  className={`text-sm mb-1.5 ${
                    isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  Heart Rate (BPM)
                </Text>
                <View className="flex-row items-baseline gap-2">
                  <Text
                    className="text-4xl font-bold"
                    style={{ color: '#DC2626' }}
                  >
                    {telemetry.bpm}
                  </Text>
                  <Text
                    className={`text-lg ${
                      isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                    }`}
                  >
                    BPM
                  </Text>
                </View>
              </View>

              <View
                className={`rounded-xl p-4 ${
                  isDarkMode ? 'bg-zinc-800/50' : 'bg-zinc-100'
                }`}
              >
                <Text
                  className={`text-sm mb-1.5 ${
                    isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  Raw BPM
                </Text>
                <View className="flex-row items-baseline gap-2">
                  <Text
                    className="text-3xl font-bold"
                    style={{ color: '#DC2626' }}
                  >
                    {telemetry.rawBPM}
                  </Text>
                  <Text
                    className={`text-lg ${
                      isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                    }`}
                  >
                    BPM
                  </Text>
                </View>
              </View>

              {telemetry.status && (
                <View
                  className={`rounded-xl p-4 ${
                    isDarkMode ? 'bg-zinc-800/50' : 'bg-zinc-100'
                  }`}
                >
                  <Text
                    className={`text-sm mb-1.5 ${
                      isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                    }`}
                  >
                    Status
                  </Text>
                  <Text
                    className="text-lg font-semibold"
                    style={{
                      color:
                        telemetry.status === 'No Finger'
                          ? '#F97316'
                          : '#22C55E',
                    }}
                  >
                    {telemetry.status}
                  </Text>
                </View>
              )}

              {telemetry.timestamp && (
                <View
                  className={`rounded-xl p-4 ${
                    isDarkMode ? 'bg-zinc-800/50' : 'bg-zinc-100'
                  }`}
                >
                  <Text
                    className={`text-sm mb-1.5 ${
                      isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                    }`}
                  >
                    Timestamp
                  </Text>
                  <Text
                    className={`text-base font-mono ${
                      isDarkMode ? 'text-gray-50' : 'text-zinc-900'
                    }`}
                  >
                    {telemetry.timestamp?.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View className="items-center py-15">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text
            className={`mt-4 text-base ${
              isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
            }`}
          >
            Waiting for telemetry data...
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

interface DataRowProps {
  label: string;
  value: string;
  unit: string;
  color: string;
  isDarkMode: boolean;
}

function DataRow({ label, value, unit, color, isDarkMode }: DataRowProps) {
  return (
    <View
      className={`rounded-xl p-4 ${
        isDarkMode ? 'bg-zinc-800/50' : 'bg-zinc-100'
      }`}
    >
      <Text
        className={`text-sm mb-1.5 ${
          isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
        }`}
      >
        {label}
      </Text>
      <View className="flex-row items-baseline gap-1">
        <Text className="text-2xl font-bold" style={{ color }}>
          {value}
        </Text>
        <Text
          className={`text-sm ${
            isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
          }`}
        >
          {unit}
        </Text>
      </View>
    </View>
  );
}
