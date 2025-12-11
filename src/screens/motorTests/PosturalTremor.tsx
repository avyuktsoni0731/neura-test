import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTelemetryData from '../../../utils/useTelemetryData';
import { useSessionStore } from '../../store/sessionStore';

export default function PosturalTremorScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const { patient } = route.params || {};
  const { savePosturalTremorResults } = useSessionStore();

  if (!patient) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#EF4444', textAlign: 'center' }}>
          {t('common.error')}: Patient data not found
        </Text>
        <TouchableOpacity
          style={{ marginTop: 20, padding: 12, backgroundColor: '#2563EB', borderRadius: 8 }}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const [showInstructions, setShowInstructions] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  const safeAreaInsets = useSafeAreaInsets();
  const { telemetry, connectionStatus, reconnect } = useTelemetryData();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  // Data collection state
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [averages, setAverages] = useState<{
    frequency: number;
    amplitude: number;
    sampleCount: number;
    stability?: number;
    rhythmicity?: number;
  } | null>(null);

  // Use refs to store readings during recording
  const frequencyReadingsRef = useRef<number[]>([]);
  const amplitudeReadingsRef = useRef<number[]>([]);
  const timeSeriesDataRef = useRef<Array<{
    timestamp: number;
    frequency: number;
    amplitude: number;
    stability?: number;
    rhythmicity?: number;
    status?: string;
    detected?: boolean;
    consecutive?: number;
  }>>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isConnected = telemetry !== null && connectionStatus === 'connected';

  // Start recording when transitioning to test screen
  useEffect(() => {
    if (!showInstructions && isConnected && !isRecording && !showCompletion) {
      startRecording();
    }
    return () => {
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [showInstructions, isConnected, showCompletion]);

  // Collect telemetry data during recording
  useEffect(() => {
    if (isRecording && telemetry) {
      const timestamp = Date.now();
      frequencyReadingsRef.current.push(telemetry.tremor.frequency_hz);
      amplitudeReadingsRef.current.push(telemetry.tremor.amplitude);

      timeSeriesDataRef.current.push({
        timestamp,
        frequency: telemetry.tremor.frequency_hz,
        amplitude: telemetry.tremor.amplitude,
        stability: telemetry.tremor.stability,
        rhythmicity: telemetry.tremor.rhythmicity,
        status: telemetry.tremor.status,
        detected: telemetry.tremor.detected,
        consecutive: telemetry.tremor.consecutive,
      });
    }
  }, [telemetry, isRecording]);

  // Completion animation
  useEffect(() => {
    if (showCompletion) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(300),
          Animated.spring(checkmarkScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [showCompletion]);

  const startRecording = () => {
    setIsRecording(true);
    setTimeRemaining(30);
    frequencyReadingsRef.current = [];
    amplitudeReadingsRef.current = [];
    timeSeriesDataRef.current = [];
    setAverages(null);
    setShowCompletion(false);

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
    const timeSeriesData = timeSeriesDataRef.current;

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

    const avgStability = timeSeriesData.length > 0
      ? timeSeriesData.reduce((sum, val) => sum + (val.stability || 0), 0) / timeSeriesData.length
      : 0;
    const avgRhythmicity = timeSeriesData.length > 0
      ? timeSeriesData.reduce((sum, val) => sum + (val.rhythmicity || 0), 0) / timeSeriesData.length
      : 0;

    // Calculate detection metrics
    const detectedCount = timeSeriesData.filter(d => d.detected === true).length;
    const detectionRate = timeSeriesData.length > 0 ? (detectedCount / timeSeriesData.length) * 100 : 0;
    const maxConsecutive = Math.max(...timeSeriesData.map(d => d.consecutive || 0), 0);

    // Get most common status
    const statusCounts: { [key: string]: number } = {};
    timeSeriesData.forEach(d => {
      if (d.status) {
        statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
      }
    });
    const averageStatus = Object.keys(statusCounts).reduce((a, b) =>
      statusCounts[a] > statusCounts[b] ? a : b, Object.keys(statusCounts)[0] || 'Unknown'
    );

    const results = {
      frequency: avgFrequency,
      amplitude: avgAmplitude,
      sampleCount: frequencyReadings.length,
      stability: avgStability,
      rhythmicity: avgRhythmicity,
      timeSeriesData: timeSeriesData,
      averageStatus: averageStatus,
      detectionRate: detectionRate,
      maxConsecutive: maxConsecutive,
    };

    setAverages(results);
    savePosturalTremorResults(results);

    setTimeout(() => {
      setShowCompletion(true);
    }, 500);
  };

  // Completion Screen
  if (showCompletion && averages) {
    return (
      <View style={[styles.container, { paddingTop: safeAreaInsets.top, backgroundColor: '#fff' }]}>
        <Animated.View
          style={[
            styles.completionContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Animated.View
            style={[styles.checkmarkContainer, { transform: [{ scale: checkmarkScale }] }]}
          >
            <View style={styles.checkmarkCircle}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          </Animated.View>

          <Text style={styles.completionTitle}>Test Complete!</Text>
          <Text style={styles.completionSubtitle}>
            Postural Tremor data recorded successfully
          </Text>

          <View style={styles.resultsSummary}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Average Frequency</Text>
              <Text style={styles.resultValue}>{averages.frequency.toFixed(2)} Hz</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Average Amplitude</Text>
              <Text style={styles.resultValue}>{averages.amplitude.toFixed(2)} m/s²</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Samples Collected</Text>
              <Text style={styles.resultValue}>{averages.sampleCount}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              navigation.navigate('FingerTapping', { patient });
            }}
          >
            <Text style={styles.continueButtonText}>Continue to Finger Tapping Test</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => {
              navigation.navigate('MainTabs', { screen: 'Home' });
            }}
          >
            <Text style={styles.homeButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // Instructions Screen
  if (showInstructions) {
    return (
      <View style={[styles.container, { paddingTop: safeAreaInsets.top, backgroundColor: '#F9FAFB' }]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Postural Tremor Test</Text>
          </View>

          {/* Patient Info */}
          <View style={styles.patientCard}>
            <View style={styles.patientHeader}>
              <View style={styles.patientIcon}>
                <Text style={styles.patientIconText}>👤</Text>
              </View>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.name}</Text>
                <Text style={styles.patientDetails}>
                  {t('patient.detailsWithSex', { age: patient.age, sex: patient.sex })}
                </Text>
              </View>
            </View>
          </View>

          {/* Video Placeholder */}
          <View style={styles.videoContainer}>
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoIcon}>📹</Text>
              <Text style={styles.videoPlaceholderText}>Instruction Video</Text>
              <Text style={styles.videoPlaceholderSubtext}>
                Placeholder for animated demonstration
              </Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📋</Text>
              <Text style={styles.cardTitle}>Test Instructions</Text>
            </View>

            <View style={styles.instructionSection}>
              <Text style={styles.instructionText}>
                Please ask the patient to:
              </Text>
              <View style={styles.instructionBox}>
                <Text style={styles.instructionBoxText}>
                  "Hold both arms outstretched at shoulder-height, palms facing down. Keep your arms steady and maintain this position for 30 seconds."
                </Text>
              </View>
            </View>

            <View style={styles.durationBox}>
              <Text style={styles.durationLabel}>Test Duration:</Text>
              <Text style={styles.durationValue}>30 seconds</Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => setShowInstructions(false)}
          >
            <Text style={styles.skipButtonText}>Skip Instructions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setShowInstructions(false)}
          >
            <Text style={styles.continueButtonText}>Start Test</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Test Screen
  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top, backgroundColor: '#F9FAFB' }]}>
      <View style={styles.testContainer}>
        {/* Header */}
        <View style={styles.testHeader}>
          <TouchableOpacity
            onPress={() => setShowInstructions(true)}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>← Instructions</Text>
          </TouchableOpacity>
          <Text style={styles.testStatus}>
            {isRecording
              ? `Recording... ${timeRemaining}s`
              : averages
                ? 'Test Complete'
                : 'Ready'}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>

        {/* Timer Display */}
        {isRecording && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeRemaining}</Text>
            <Text style={styles.timerLabel}>seconds remaining</Text>
            <TouchableOpacity
              style={styles.skipTimerButton}
              onPress={stopRecording}
            >
              <Text style={styles.skipTimerButtonText}>Skip Timer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results Display */}
        {averages && !isRecording && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Test Results (30s Average)</Text>
            <View style={styles.resultsGrid}>
              <View style={styles.resultBox}>
                <Text style={styles.resultBoxLabel}>Average Frequency</Text>
                <Text style={styles.resultBoxValue}>{averages.frequency.toFixed(2)} Hz</Text>
              </View>
              <View style={styles.resultBox}>
                <Text style={styles.resultBoxLabel}>Average Amplitude</Text>
                <Text style={styles.resultBoxValue}>{averages.amplitude.toFixed(2)} m/s²</Text>
              </View>
              <View style={styles.resultBox}>
                <Text style={styles.resultBoxLabel}>Samples Collected</Text>
                <Text style={styles.resultBoxValue}>{averages.sampleCount}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Live Telemetry Data */}
        {telemetry && isRecording ? (
          <View style={styles.liveDataCard}>
            <Text style={styles.liveDataTitle}>Live Tremor Data</Text>
            <View style={styles.liveDataRow}>
              <Text style={styles.liveDataLabel}>Frequency:</Text>
              <Text style={styles.liveDataValue}>
                {telemetry.tremor.frequency_hz.toFixed(2)} Hz
              </Text>
            </View>
            <View style={styles.liveDataRow}>
              <Text style={styles.liveDataLabel}>Amplitude:</Text>
              <Text style={styles.liveDataValue}>
                {telemetry.tremor.amplitude.toFixed(2)} m/s²
              </Text>
            </View>
            {telemetry.tremor.stability !== undefined && (
              <View style={styles.liveDataRow}>
                <Text style={styles.liveDataLabel}>Stability:</Text>
                <Text style={styles.liveDataValue}>
                  {telemetry.tremor.stability.toFixed(2)}
                </Text>
              </View>
            )}
            {telemetry.tremor.rhythmicity !== undefined && (
              <View style={styles.liveDataRow}>
                <Text style={styles.liveDataLabel}>Rhythmicity:</Text>
                <Text style={styles.liveDataValue}>
                  {telemetry.tremor.rhythmicity.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        ) : !isRecording && !averages ? (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>Waiting for sensor data...</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  patientIconText: {
    fontSize: 24,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  videoContainer: {
    marginBottom: 20,
  },
  videoPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 16,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  videoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  videoPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  videoPlaceholderSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  instructionSection: {
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    fontWeight: '500',
  },
  instructionBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  instructionBoxText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  durationBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  durationLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  durationValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    maxHeight: 44,
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  continueButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 44,
    maxHeight: 44,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  testContainer: {
    flex: 1,
    padding: 20,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  testStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  stopButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timerText: {
    fontSize: 72,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  skipTimerButton: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  skipTimerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  resultsGrid: {
    gap: 12,
  },
  resultBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  resultBoxLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  resultBoxValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  liveDataCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  liveDataTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  liveDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  liveDataLabel: {
    fontSize: 16,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  liveDataValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#60A5FA',
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
  },
  waitingText: {
    fontSize: 18,
    color: '#6B7280',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  checkmarkContainer: {
    marginBottom: 32,
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkmark: {
    fontSize: 64,
    color: '#fff',
    fontWeight: '700',
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  completionSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  resultsSummary: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
  },
  homeButton: {
    backgroundColor: '#6B7280',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
