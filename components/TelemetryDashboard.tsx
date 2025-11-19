import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  ScrollView,
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

const WS_URL = 'ws://192.168.4.1:81/';

export default function TelemetryDashboard() {
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
  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          ESP32 Telemetry
        </Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: status.color,
                opacity: readyState === WebSocket.OPEN ? 1 : 0.8,
              },
            ]}
          />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
        <Text style={[styles.debugText, { color: colors.subtext }]}>
          {WS_URL}
        </Text>
        {readyState === WebSocket.CLOSED && connectionAttempts > 0 && (
          <Text style={[styles.debugText, { color: '#EF4444', marginTop: 4 }]}>
            ⚠️ Connection failed. Make sure:
            {'\n'}• ESP32 is powered on
            {'\n'}• Device is on same WiFi network
            {'\n'}• ESP32 IP is{' '}
            {WS_URL.replace('ws://', '').replace(':81/', '')}
          </Text>
        )}
      </View>

      {telemetry ? (
        <View style={styles.cardsContainer}>
          {/* MPU6500 Sensor Card */}
          <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, styles.blueIconBg]}>
                <Text style={styles.iconText}>📱</Text>
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  MPU6500
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>
                  Motion Sensor
                </Text>
              </View>
            </View>

            <View style={styles.dataRows}>
              <DataRow
                label="Pitch"
                value={telemetry.pitch.toFixed(2)}
                unit="°"
                color="#2563EB"
                bgColor={colors.dataBg}
                textColor={colors.text}
                subtextColor={colors.subtext}
              />
              <DataRow
                label="Roll"
                value={telemetry.roll.toFixed(2)}
                unit="°"
                color="#9333EA"
                bgColor={colors.dataBg}
                textColor={colors.text}
                subtextColor={colors.subtext}
              />
              <DataRow
                label="Yaw"
                value={telemetry.yaw.toFixed(2)}
                unit="°"
                color="#4F46E5"
                bgColor={colors.dataBg}
                textColor={colors.text}
                subtextColor={colors.subtext}
              />
            </View>
          </View>

          {/* MAX30102 Sensor Card */}
          <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, styles.redIconBg]}>
                <Text style={styles.iconText}>❤️</Text>
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  MAX30102
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>
                  Heart Rate Sensor
                </Text>
              </View>
            </View>

            <View style={styles.dataRows}>
              <View
                style={[styles.dataBox, { backgroundColor: colors.dataBg }]}
              >
                <Text style={[styles.dataLabel, { color: colors.subtext }]}>
                  Heart Rate (BPM)
                </Text>
                <View style={styles.bpmContainer}>
                  <Text style={[styles.bpmValue, { color: '#DC2626' }]}>
                    {telemetry.bpm}
                  </Text>
                  <Text style={[styles.bpmUnit, { color: colors.subtext }]}>
                    BPM
                  </Text>
                </View>
              </View>

              <View
                style={[styles.dataBox, { backgroundColor: colors.dataBg }]}
              >
                <Text style={[styles.dataLabel, { color: colors.subtext }]}>
                  Raw BPM
                </Text>
                <View style={styles.bpmContainer}>
                  <Text
                    style={[
                      styles.bpmValue,
                      { color: '#DC2626', fontSize: 28 },
                    ]}
                  >
                    {telemetry.rawBPM}
                  </Text>
                  <Text style={[styles.bpmUnit, { color: colors.subtext }]}>
                    BPM
                  </Text>
                </View>
              </View>

              {telemetry.status && (
                <View
                  style={[styles.dataBox, { backgroundColor: colors.dataBg }]}
                >
                  <Text style={[styles.dataLabel, { color: colors.subtext }]}>
                    Status
                  </Text>
                  <Text
                    style={[
                      styles.statusValue,
                      {
                        color:
                          telemetry.status === 'No Finger'
                            ? '#F97316'
                            : '#22C55E',
                      },
                    ]}
                  >
                    {telemetry.status}
                  </Text>
                </View>
              )}

              {telemetry.timestamp && (
                <View
                  style={[styles.dataBox, { backgroundColor: colors.dataBg }]}
                >
                  <Text style={[styles.dataLabel, { color: colors.subtext }]}>
                    Timestamp
                  </Text>
                  <Text style={[styles.timestampValue, { color: colors.text }]}>
                    {telemetry.timestamp.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={[styles.loadingText, { color: colors.subtext }]}>
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
  bgColor: string;
  textColor: string;
  subtextColor: string;
}

function DataRow({
  label,
  value,
  unit,
  color,
  bgColor,
  textColor,
  subtextColor,
}: DataRowProps) {
  return (
    <View style={[styles.dataBox, { backgroundColor: bgColor }]}>
      <Text style={[styles.dataLabel, { color: subtextColor }]}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.dataValue, { color }]}>{value}</Text>
        <Text style={[styles.dataUnit, { color: subtextColor }]}>{unit}</Text>
      </View>
    </View>
  );
}

const lightColors = {
  background: '#FAFAFA',
  text: '#18181B',
  subtext: '#71717A',
  cardBg: '#FFFFFF',
  dataBg: '#F4F4F5',
};

const darkColors = {
  background: '#000000',
  text: '#FAFAFA',
  subtext: '#A1A1AA',
  cardBg: '#18181B',
  dataBg: 'rgba(39, 39, 42, 0.5)',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  debugText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    gap: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueIconBg: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  redIconBg: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  iconText: {
    fontSize: 20,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  dataRows: {
    gap: 12,
  },
  dataBox: {
    borderRadius: 12,
    padding: 16,
  },
  dataLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  dataValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dataUnit: {
    fontSize: 14,
  },
  bpmContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  bpmValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  bpmUnit: {
    fontSize: 18,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  timestampValue: {
    fontSize: 16,
    fontFamily: 'monospace',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
