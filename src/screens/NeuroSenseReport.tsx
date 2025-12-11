import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useSessionStore } from '../store/sessionStore';
import { useAppStore } from '../store/appstore';

const screenWidth = Dimensions.get('window').width;

interface StatisticalAnalysis {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  range: number;
  coefficientOfVariation: number;
  median: number;
}

export default function NeuroSenseReportScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const { patient } = route.params || {};
  const { currentSession } = useSessionStore();
  const { practitioner, patients } = useAppStore();
  const isDarkMode = useColorScheme() === 'dark';
  const safeAreaInsets = useSafeAreaInsets();

  if (!patient) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#EF4444', textAlign: 'center' }}>
          Error: Patient data not found
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

  const posturalTremor = currentSession?.posturalTremor;
  const restTremor = currentSession?.restTremor;

  // Get latest cognitive test results for this patient
  const currentPatient = patients.find((p: any) => p.id === patient?.id);
  const latestCognitiveTest = currentPatient?.quizResults
    ? currentPatient.quizResults.sort((a: any, b: any) => b.timestamp - a.timestamp)[0]
    : null;

  // Calculate cognitive test breakdown
  const cognitiveBreakdown = latestCognitiveTest?.answers
    ? {
        dateOrientation: {
          entered: latestCognitiveTest.answers.Question1?.entered || '-',
          isCorrect: latestCognitiveTest.answers.Question1?.isCorrect || false,
        },
        wordRecall: {
          correct: (latestCognitiveTest.answers.Question2 || []).filter((w: string) =>
            (latestCognitiveTest.answers.wordList || []).includes(w),
          ).length,
          total: 4,
        },
        digitSpan: {
          correct: latestCognitiveTest.answers.Question3 === '3185' ? 1 : 0,
          total: 1,
        },
        pictureNaming: {
          correct:
            latestCognitiveTest.answers.Question4?.toLowerCase().trim() === 'lion' ? 1 : 0,
          total: 1,
        },
        spatialMemory: {
          correct: latestCognitiveTest.answers.Question5?.correctCount || 0,
          total: 4,
        },
      }
    : null;

  // Calculate statistical analysis
  const calculateStats = (data: number[]): StatisticalAnalysis => {
    if (!data || data.length === 0) {
      return {
        mean: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        range: 0,
        coefficientOfVariation: 0,
        median: 0,
      };
    }

    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance =
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const coefficientOfVariation = mean !== 0 ? (stdDev / mean) * 100 : 0;
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    return {
      mean,
      stdDev,
      min,
      max,
      range,
      coefficientOfVariation,
      median,
    };
  };

  // Get tremor severity assessment
  const getSeverityAssessment = (
    frequency: number,
    amplitude: number,
    testType: 'rest' | 'postural',
  ): { severity: string; description: string; color: string } => {
    // Clinical thresholds (adjust based on medical guidelines)
    const restThresholds = {
      frequency: { mild: 4, moderate: 6, severe: 8 },
      amplitude: { mild: 0.5, moderate: 1.0, severe: 2.0 },
    };
    const posturalThresholds = {
      frequency: { mild: 5, moderate: 8, severe: 12 },
      amplitude: { mild: 0.8, moderate: 1.5, severe: 3.0 },
    };

    const thresholds =
      testType === 'rest' ? restThresholds : posturalThresholds;

    let severityScore = 0;
    if (frequency >= thresholds.frequency.severe || amplitude >= thresholds.amplitude.severe) {
      severityScore = 3;
    } else if (frequency >= thresholds.frequency.moderate || amplitude >= thresholds.amplitude.moderate) {
      severityScore = 2;
    } else if (frequency >= thresholds.frequency.mild || amplitude >= thresholds.amplitude.mild) {
      severityScore = 1;
    }

    if (severityScore === 3) {
      return {
        severity: 'Severe',
        description: 'Significant tremor detected. Clinical evaluation recommended.',
        color: '#EF4444',
      };
    } else if (severityScore === 2) {
      return {
        severity: 'Moderate',
        description: 'Moderate tremor detected. Monitoring advised.',
        color: '#F59E0B',
      };
    } else if (severityScore === 1) {
      return {
        severity: 'Mild',
        description: 'Mild tremor detected. Routine monitoring recommended.',
        color: '#EAB308',
      };
    } else {
      return {
        severity: 'Normal',
        description: 'No significant tremor detected.',
        color: '#22C55E',
      };
    }
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '3',
      strokeWidth: '1',
      stroke: '#2563EB',
    },
  };

  const prepareChartData = (
    timeSeriesData: any[],
    field: 'frequency' | 'amplitude' | 'stability' | 'rhythmicity',
    label: string,
  ) => {
    if (!timeSeriesData || timeSeriesData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    }

    // Sample data points for display (max 30 points for readability)
    const sampleSize = Math.min(30, timeSeriesData.length);
    const step = Math.max(1, Math.floor(timeSeriesData.length / sampleSize));
    const sampledData = [];
    for (let i = 0; i < timeSeriesData.length; i += step) {
      sampledData.push(timeSeriesData[i]);
    }

    const labels = sampledData.map((_, index) => {
      if (sampledData.length <= 10) {
        return `${index + 1}`;
      }
      return index % 5 === 0 ? `${index + 1}` : '';
    });

    const values = sampledData.map(d => {
      const val = d[field];
      // Scale amplitude for better visibility in charts
      return field === 'amplitude' ? val * 10 : val;
    });

    return {
      labels,
      datasets: [
        {
          data: values,
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  // Calculate statistics for both tests

  // Calculate statistics for both tests
  const restFrequencyStats = restTremor?.timeSeriesData
    ? calculateStats(restTremor.timeSeriesData.map(d => d.frequency))
    : null;
  const restAmplitudeStats = restTremor?.timeSeriesData
    ? calculateStats(restTremor.timeSeriesData.map(d => d.amplitude))
    : null;
  const posturalFrequencyStats = posturalTremor?.timeSeriesData
    ? calculateStats(posturalTremor.timeSeriesData.map(d => d.frequency))
    : null;
  const posturalAmplitudeStats = posturalTremor?.timeSeriesData
    ? calculateStats(posturalTremor.timeSeriesData.map(d => d.amplitude))
    : null;

  const restSeverity = restTremor
    ? getSeverityAssessment(restTremor.frequency, restTremor.amplitude, 'rest')
    : null;
  const posturalSeverity = posturalTremor
    ? getSeverityAssessment(
        posturalTremor.frequency,
        posturalTremor.amplitude,
        'postural',
      )
    : null;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: safeAreaInsets.top,
          backgroundColor: '#F9FAFB',
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Report Header */}
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>NeuroSense Assessment Report</Text>
            <Text style={styles.reportSubtitle}>Comprehensive Cognitive & Motor Function Evaluation</Text>
          </View>

          {/* Patient & Practitioner Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Patient Information</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{patient.name}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Age:</Text>
                  <Text style={styles.infoValue}>{patient.age} years</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Sex:</Text>
                  <Text style={styles.infoValue}>{patient.sex}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Practitioner:</Text>
                  <Text style={styles.infoValue}>
                    {practitioner.name || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Date:</Text>
                  <Text style={styles.infoValue}>
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Time:</Text>
                  <Text style={styles.infoValue}>
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Cognitive Assessment Section */}
          {latestCognitiveTest && cognitiveBreakdown && (
            <View style={styles.testSection}>
              <View style={styles.testHeader}>
                <Text style={styles.testTitle}>Cognitive Assessment</Text>
                <View
                  style={[
                    styles.severityBadge,
                    {
                      backgroundColor:
                        latestCognitiveTest.totalScore >= 8
                          ? '#22C55E'
                          : latestCognitiveTest.totalScore >= 6
                          ? '#F59E0B'
                          : '#EF4444',
                    },
                  ]}
                >
                  <Text style={styles.severityText}>
                    {latestCognitiveTest.totalScore}/{latestCognitiveTest.maxScore}
                  </Text>
                </View>
              </View>

              {/* Cognitive Summary */}
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Overall Score</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Total Score</Text>
                    <Text style={styles.statValue}>
                      {latestCognitiveTest.totalScore} / {latestCognitiveTest.maxScore}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Percentage</Text>
                    <Text style={styles.statValue}>
                      {((latestCognitiveTest.totalScore / latestCognitiveTest.maxScore) * 100).toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Assessment Date</Text>
                    <Text style={styles.statValue}>
                      {latestCognitiveTest.date
                        ? new Date(latestCognitiveTest.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Cognitive Test Breakdown */}
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Test Breakdown</Text>
                <View style={styles.cognitiveList}>
                  <View style={styles.cognitiveItem}>
                    <Text style={styles.cognitiveLabel}>1. Date Orientation</Text>
                    <View style={styles.cognitiveResult}>
                      <Text style={styles.cognitiveValue}>
                        {cognitiveBreakdown.dateOrientation.entered}
                      </Text>
                      <View
                        style={[
                          styles.cognitiveBadge,
                          {
                            backgroundColor: cognitiveBreakdown.dateOrientation.isCorrect
                              ? '#22C55E'
                              : '#EF4444',
                          },
                        ]}
                      >
                        <Text style={styles.cognitiveBadgeText}>
                          {cognitiveBreakdown.dateOrientation.isCorrect ? '✓' : '✗'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cognitiveItem}>
                    <Text style={styles.cognitiveLabel}>2. Word Recall</Text>
                    <View style={styles.cognitiveResult}>
                      <Text style={styles.cognitiveValue}>
                        {cognitiveBreakdown.wordRecall.correct} / {cognitiveBreakdown.wordRecall.total}
                      </Text>
                      <View
                        style={[
                          styles.cognitiveBadge,
                          {
                            backgroundColor:
                              cognitiveBreakdown.wordRecall.correct === cognitiveBreakdown.wordRecall.total
                                ? '#22C55E'
                                : cognitiveBreakdown.wordRecall.correct >= 2
                                ? '#F59E0B'
                                : '#EF4444',
                          },
                        ]}
                      >
                        <Text style={styles.cognitiveBadgeText}>
                          {cognitiveBreakdown.wordRecall.correct}/{cognitiveBreakdown.wordRecall.total}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cognitiveItem}>
                    <Text style={styles.cognitiveLabel}>3. Backward Digit Span</Text>
                    <View style={styles.cognitiveResult}>
                      <Text style={styles.cognitiveValue}>
                        {cognitiveBreakdown.digitSpan.correct} / {cognitiveBreakdown.digitSpan.total}
                      </Text>
                      <View
                        style={[
                          styles.cognitiveBadge,
                          {
                            backgroundColor: cognitiveBreakdown.digitSpan.correct === 1 ? '#22C55E' : '#EF4444',
                          },
                        ]}
                      >
                        <Text style={styles.cognitiveBadgeText}>
                          {cognitiveBreakdown.digitSpan.correct === 1 ? '✓' : '✗'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cognitiveItem}>
                    <Text style={styles.cognitiveLabel}>4. Picture Naming</Text>
                    <View style={styles.cognitiveResult}>
                      <Text style={styles.cognitiveValue}>
                        {cognitiveBreakdown.pictureNaming.correct} / {cognitiveBreakdown.pictureNaming.total}
                      </Text>
                      <View
                        style={[
                          styles.cognitiveBadge,
                          {
                            backgroundColor:
                              cognitiveBreakdown.pictureNaming.correct === 1 ? '#22C55E' : '#EF4444',
                          },
                        ]}
                      >
                        <Text style={styles.cognitiveBadgeText}>
                          {cognitiveBreakdown.pictureNaming.correct === 1 ? '✓' : '✗'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cognitiveItem}>
                    <Text style={styles.cognitiveLabel}>5. Spatial Memory</Text>
                    <View style={styles.cognitiveResult}>
                      <Text style={styles.cognitiveValue}>
                        {cognitiveBreakdown.spatialMemory.correct} / {cognitiveBreakdown.spatialMemory.total}
                      </Text>
                      <View
                        style={[
                          styles.cognitiveBadge,
                          {
                            backgroundColor:
                              cognitiveBreakdown.spatialMemory.correct === cognitiveBreakdown.spatialMemory.total
                                ? '#22C55E'
                                : cognitiveBreakdown.spatialMemory.correct >= 2
                                ? '#F59E0B'
                                : '#EF4444',
                          },
                        ]}
                      >
                        <Text style={styles.cognitiveBadgeText}>
                          {cognitiveBreakdown.spatialMemory.correct}/{cognitiveBreakdown.spatialMemory.total}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Motor Function Assessment Section Header */}
          {(restTremor || posturalTremor) && (
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionDividerText}>Motor Function Assessment</Text>
            </View>
          )}

          {/* Rest Tremor Section */}
          {restTremor && (
            <View style={styles.testSection}>
              <View style={styles.testHeader}>
                <Text style={styles.testTitle}>1. Rest Tremor Assessment</Text>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: restSeverity?.color || '#6B7280' },
                  ]}
                >
                  <Text style={styles.severityText}>
                    {restSeverity?.severity || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Severity Assessment */}
              <View style={styles.severityCard}>
                <Text style={styles.severityTitle}>Clinical Assessment</Text>
                <Text style={styles.severityDescription}>
                  {restSeverity?.description}
                </Text>
              </View>

              {/* Summary Statistics */}
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Summary Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Average Frequency</Text>
                    <Text style={styles.statValue}>
                      {restTremor.frequency.toFixed(2)} Hz
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Average Amplitude</Text>
                    <Text style={styles.statValue}>
                      {restTremor.amplitude.toFixed(2)} m/s²
                    </Text>
                  </View>
                  {restTremor.stability !== undefined && (
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Stability Index</Text>
                      <Text style={styles.statValue}>
                        {restTremor.stability.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  {restTremor.rhythmicity !== undefined && (
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Rhythmicity Index</Text>
                      <Text style={styles.statValue}>
                        {restTremor.rhythmicity.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Total Samples</Text>
                    <Text style={styles.statValue}>{restTremor.sampleCount}</Text>
                  </View>
                  {restTremor.averageStatus && (
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Sensor Status</Text>
                      <Text style={styles.statValue}>{restTremor.averageStatus}</Text>
                    </View>
                  )}
                  {restTremor.detectionRate !== undefined && (
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Detection Rate</Text>
                      <Text style={styles.statValue}>{restTremor.detectionRate.toFixed(1)}%</Text>
                    </View>
                  )}
                  {restTremor.maxConsecutive !== undefined && (
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Max Consecutive</Text>
                      <Text style={styles.statValue}>{restTremor.maxConsecutive}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Detailed Statistics */}
              {restFrequencyStats && restAmplitudeStats && (
                <View style={styles.detailedStatsCard}>
                  <Text style={styles.detailedStatsTitle}>
                    Frequency Analysis
                  </Text>
                  <View style={styles.statsTable}>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Mean:</Text>
                      <Text style={styles.statsRowValue}>
                        {restFrequencyStats.mean.toFixed(2)} Hz
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Std Deviation:</Text>
                      <Text style={styles.statsRowValue}>
                        {restFrequencyStats.stdDev.toFixed(2)} Hz
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Range:</Text>
                      <Text style={styles.statsRowValue}>
                        {restFrequencyStats.min.toFixed(2)} -{' '}
                        {restFrequencyStats.max.toFixed(2)} Hz
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Coefficient of Variation:</Text>
                      <Text style={styles.statsRowValue}>
                        {restFrequencyStats.coefficientOfVariation.toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.detailedStatsTitle, { marginTop: 20 }]}>
                    Amplitude Analysis
                  </Text>
                  <View style={styles.statsTable}>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Mean:</Text>
                      <Text style={styles.statsRowValue}>
                        {restAmplitudeStats.mean.toFixed(2)} m/s²
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Std Deviation:</Text>
                      <Text style={styles.statsRowValue}>
                        {restAmplitudeStats.stdDev.toFixed(2)} m/s²
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Range:</Text>
                      <Text style={styles.statsRowValue}>
                        {restAmplitudeStats.min.toFixed(2)} -{' '}
                        {restAmplitudeStats.max.toFixed(2)} m/s²
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Coefficient of Variation:</Text>
                      <Text style={styles.statsRowValue}>
                        {restAmplitudeStats.coefficientOfVariation.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Charts */}
              {restTremor.timeSeriesData &&
                restTremor.timeSeriesData.length > 0 && (
                  <View style={styles.chartsContainer}>
                    <View style={styles.chartCard}>
                      <Text style={styles.chartTitle}>
                        Frequency Over Time (Hz)
                      </Text>
                      <LineChart
                        data={prepareChartData(
                          restTremor.timeSeriesData,
                          'frequency',
                          'Frequency',
                        )}
                        width={screenWidth - 80}
                        height={200}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                        withInnerLines={true}
                        withVerticalLabels={true}
                        withHorizontalLabels={true}
                      />
                    </View>

                    <View style={styles.chartCard}>
                      <Text style={styles.chartTitle}>
                        Amplitude Over Time (m/s² × 10)
                      </Text>
                      <LineChart
                        data={prepareChartData(
                          restTremor.timeSeriesData,
                          'amplitude',
                          'Amplitude',
                        )}
                        width={screenWidth - 80}
                        height={200}
                        chartConfig={{
                          ...chartConfig,
                          color: (opacity = 1) => `rgba(147, 51, 234, ${opacity})`,
                        }}
                        bezier
                        style={styles.chart}
                        withInnerLines={true}
                        withVerticalLabels={true}
                        withHorizontalLabels={true}
                      />
                    </View>

                    {restTremor.timeSeriesData[0]?.stability !== undefined && (
                      <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>
                          Stability Index Over Time
                        </Text>
                        <LineChart
                          data={prepareChartData(
                            restTremor.timeSeriesData,
                            'stability',
                            'Stability',
                          )}
                          width={screenWidth - 80}
                          height={200}
                          chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                          }}
                          bezier
                          style={styles.chart}
                          withInnerLines={true}
                          withVerticalLabels={true}
                          withHorizontalLabels={true}
                        />
                      </View>
                    )}

                    {restTremor.timeSeriesData[0]?.rhythmicity !== undefined && (
                      <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>
                          Rhythmicity Index Over Time
                        </Text>
                        <LineChart
                          data={prepareChartData(
                            restTremor.timeSeriesData,
                            'rhythmicity',
                            'Rhythmicity',
                          )}
                          width={screenWidth - 80}
                          height={200}
                          chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                          }}
                          bezier
                          style={styles.chart}
                          withInnerLines={true}
                          withVerticalLabels={true}
                          withHorizontalLabels={true}
                        />
                      </View>
                    )}
                  </View>
                )}
            </View>
          )}

          {/* Postural Tremor Section */}
          {posturalTremor && (
            <View style={styles.testSection}>
              <View style={styles.testHeader}>
                <Text style={styles.testTitle}>2. Postural Tremor Assessment</Text>
                <View
                  style={[
                    styles.severityBadge,
                    {
                      backgroundColor: posturalSeverity?.color || '#6B7280',
                    },
                  ]}
                >
                  <Text style={styles.severityText}>
                    {posturalSeverity?.severity || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Severity Assessment */}
              <View style={styles.severityCard}>
                <Text style={styles.severityTitle}>Clinical Assessment</Text>
                <Text style={styles.severityDescription}>
                  {posturalSeverity?.description}
                </Text>
              </View>

              {/* Summary Statistics */}
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Summary Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Average Frequency</Text>
                    <Text style={styles.statValue}>
                      {posturalTremor.frequency.toFixed(2)} Hz
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Average Amplitude</Text>
                    <Text style={styles.statValue}>
                      {posturalTremor.amplitude.toFixed(2)} m/s²
                    </Text>
                  </View>
                  {posturalTremor.stability !== undefined && (
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Stability Index</Text>
                      <Text style={styles.statValue}>
                        {posturalTremor.stability.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  {posturalTremor.rhythmicity !== undefined && (
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Rhythmicity Index</Text>
                      <Text style={styles.statValue}>
                        {posturalTremor.rhythmicity.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Total Samples</Text>
                    <Text style={styles.statValue}>
                      {posturalTremor.sampleCount}
                    </Text>
                  </View>
                  {posturalTremor.averageStatus && (
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Sensor Status</Text>
                      <Text style={styles.statValue}>{posturalTremor.averageStatus}</Text>
                    </View>
                  )}
                  {posturalTremor.detectionRate !== undefined && (
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Detection Rate</Text>
                      <Text style={styles.statValue}>{posturalTremor.detectionRate.toFixed(1)}%</Text>
                    </View>
                  )}
                  {posturalTremor.maxConsecutive !== undefined && (
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Max Consecutive</Text>
                      <Text style={styles.statValue}>{posturalTremor.maxConsecutive}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Detailed Statistics */}
              {posturalFrequencyStats && posturalAmplitudeStats && (
                <View style={styles.detailedStatsCard}>
                  <Text style={styles.detailedStatsTitle}>
                    Frequency Analysis
                  </Text>
                  <View style={styles.statsTable}>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Mean:</Text>
                      <Text style={styles.statsRowValue}>
                        {posturalFrequencyStats.mean.toFixed(2)} Hz
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Std Deviation:</Text>
                      <Text style={styles.statsRowValue}>
                        {posturalFrequencyStats.stdDev.toFixed(2)} Hz
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Range:</Text>
                      <Text style={styles.statsRowValue}>
                        {posturalFrequencyStats.min.toFixed(2)} -{' '}
                        {posturalFrequencyStats.max.toFixed(2)} Hz
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Coefficient of Variation:</Text>
                      <Text style={styles.statsRowValue}>
                        {posturalFrequencyStats.coefficientOfVariation.toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.detailedStatsTitle, { marginTop: 20 }]}>
                    Amplitude Analysis
                  </Text>
                  <View style={styles.statsTable}>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Mean:</Text>
                      <Text style={styles.statsRowValue}>
                        {posturalAmplitudeStats.mean.toFixed(2)} m/s²
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Std Deviation:</Text>
                      <Text style={styles.statsRowValue}>
                        {posturalAmplitudeStats.stdDev.toFixed(2)} m/s²
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Range:</Text>
                      <Text style={styles.statsRowValue}>
                        {posturalAmplitudeStats.min.toFixed(2)} -{' '}
                        {posturalAmplitudeStats.max.toFixed(2)} m/s²
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsRowLabel}>Coefficient of Variation:</Text>
                      <Text style={styles.statsRowValue}>
                        {posturalAmplitudeStats.coefficientOfVariation.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Charts */}
              {posturalTremor.timeSeriesData &&
                posturalTremor.timeSeriesData.length > 0 && (
                  <View style={styles.chartsContainer}>
                    <View style={styles.chartCard}>
                      <Text style={styles.chartTitle}>
                        Frequency Over Time (Hz)
                      </Text>
                      <LineChart
                        data={prepareChartData(
                          posturalTremor.timeSeriesData,
                          'frequency',
                          'Frequency',
                        )}
                        width={screenWidth - 80}
                        height={200}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                        withInnerLines={true}
                        withVerticalLabels={true}
                        withHorizontalLabels={true}
                      />
                    </View>

                    <View style={styles.chartCard}>
                      <Text style={styles.chartTitle}>
                        Amplitude Over Time (m/s² × 10)
                      </Text>
                      <LineChart
                        data={prepareChartData(
                          posturalTremor.timeSeriesData,
                          'amplitude',
                          'Amplitude',
                        )}
                        width={screenWidth - 80}
                        height={200}
                        chartConfig={{
                          ...chartConfig,
                          color: (opacity = 1) => `rgba(147, 51, 234, ${opacity})`,
                        }}
                        bezier
                        style={styles.chart}
                        withInnerLines={true}
                        withVerticalLabels={true}
                        withHorizontalLabels={true}
                      />
                    </View>

                    {posturalTremor.timeSeriesData[0]?.stability !== undefined && (
                      <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>
                          Stability Index Over Time
                        </Text>
                        <LineChart
                          data={prepareChartData(
                            posturalTremor.timeSeriesData,
                            'stability',
                            'Stability',
                          )}
                          width={screenWidth - 80}
                          height={200}
                          chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                          }}
                          bezier
                          style={styles.chart}
                          withInnerLines={true}
                          withVerticalLabels={true}
                          withHorizontalLabels={true}
                        />
                      </View>
                    )}

                    {posturalTremor.timeSeriesData[0]?.rhythmicity !== undefined && (
                      <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>
                          Rhythmicity Index Over Time
                        </Text>
                        <LineChart
                          data={prepareChartData(
                            posturalTremor.timeSeriesData,
                            'rhythmicity',
                            'Rhythmicity',
                          )}
                          width={screenWidth - 80}
                          height={200}
                          chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                          }}
                          bezier
                          style={styles.chart}
                          withInnerLines={true}
                          withVerticalLabels={true}
                          withHorizontalLabels={true}
                        />
                      </View>
                    )}
                  </View>
                )}
            </View>
          )}

          {/* Comparative Analysis */}
          {restTremor && posturalTremor && (
            <View style={styles.comparisonSection}>
              <Text style={styles.comparisonTitle}>Comparative Analysis</Text>
              
              <View style={styles.comparisonCard}>
                <Text style={styles.comparisonSubtitle}>Frequency Comparison</Text>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Rest Tremor:</Text>
                  <Text style={styles.comparisonValue}>
                    {restTremor.frequency.toFixed(2)} Hz
                  </Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Postural Tremor:</Text>
                  <Text style={styles.comparisonValue}>
                    {posturalTremor.frequency.toFixed(2)} Hz
                  </Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Difference:</Text>
                  <Text
                    style={[
                      styles.comparisonValue,
                      {
                        color:
                          Math.abs(
                            posturalTremor.frequency - restTremor.frequency,
                          ) > 2
                            ? '#EF4444'
                            : '#22C55E',
                      },
                    ]}
                  >
                    {Math.abs(
                      posturalTremor.frequency - restTremor.frequency,
                    ).toFixed(2)}{' '}
                    Hz
                  </Text>
                </View>
              </View>

              <View style={styles.comparisonCard}>
                <Text style={styles.comparisonSubtitle}>Amplitude Comparison</Text>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Rest Tremor:</Text>
                  <Text style={styles.comparisonValue}>
                    {restTremor.amplitude.toFixed(2)} m/s²
                  </Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Postural Tremor:</Text>
                  <Text style={styles.comparisonValue}>
                    {posturalTremor.amplitude.toFixed(2)} m/s²
                  </Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Difference:</Text>
                  <Text
                    style={[
                      styles.comparisonValue,
                      {
                        color:
                          Math.abs(
                            posturalTremor.amplitude - restTremor.amplitude,
                          ) > 1.0
                            ? '#EF4444'
                            : '#22C55E',
                      },
                    ]}
                  >
                    {Math.abs(
                      posturalTremor.amplitude - restTremor.amplitude,
                    ).toFixed(2)}{' '}
                    m/s²
                  </Text>
                </View>
              </View>

              {/* Combined Chart */}
              {restTremor.timeSeriesData &&
                posturalTremor.timeSeriesData &&
                restTremor.timeSeriesData.length > 0 &&
                posturalTremor.timeSeriesData.length > 0 && (
                  <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>
                      Frequency Comparison: Rest vs Postural
                    </Text>
                    <LineChart
                      data={{
                        labels: Array(20)
                          .fill(0)
                          .map((_, i) => (i % 5 === 0 ? `${i + 1}` : '')),
                        datasets: [
                          {
                            data: prepareChartData(
                              restTremor.timeSeriesData,
                              'frequency',
                              'Rest',
                            ).datasets[0].data,
                            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                            strokeWidth: 2,
                          },
                          {
                            data: prepareChartData(
                              posturalTremor.timeSeriesData,
                              'frequency',
                              'Postural',
                            ).datasets[0].data,
                            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                            strokeWidth: 2,
                          },
                        ],
                      }}
                      width={screenWidth - 80}
                      height={220}
                      chartConfig={chartConfig}
                      bezier
                      style={styles.chart}
                      withInnerLines={true}
                      withVerticalLabels={true}
                      withHorizontalLabels={true}
                    />
                  </View>
                )}
            </View>
          )}

          {/* Clinical Interpretation */}
          <View style={styles.interpretationSection}>
            <Text style={styles.interpretationTitle}>
              Clinical Interpretation & Recommendations
            </Text>
            <View style={styles.interpretationCard}>
              <Text style={styles.interpretationText}>
                {latestCognitiveTest
                  ? `Cognitive Assessment: The patient scored ${latestCognitiveTest.totalScore} out of ${latestCognitiveTest.maxScore} (${((latestCognitiveTest.totalScore / latestCognitiveTest.maxScore) * 100).toFixed(0)}%) on the cognitive screening. ${latestCognitiveTest.totalScore >= 8 ? 'Cognitive function appears to be within normal limits.' : latestCognitiveTest.totalScore >= 6 ? 'Mild cognitive concerns noted. Further evaluation may be beneficial.' : 'Significant cognitive concerns identified. Comprehensive neuropsychological assessment recommended.'}${restTremor || posturalTremor ? '\n\n' : ''}`
                  : ''}
                {restTremor && posturalTremor
                  ? `Motor Assessment: This evaluation assessed tremor characteristics during rest and postural conditions. 
                  
Rest tremor frequency of ${restTremor.frequency.toFixed(2)} Hz and amplitude of ${restTremor.amplitude.toFixed(2)} m/s² ${restSeverity?.severity === 'Normal' ? 'indicates normal findings' : `suggests ${restSeverity?.severity.toLowerCase()} tremor activity`}. ${restTremor.averageStatus ? `Sensor status: ${restTremor.averageStatus}.` : ''} ${restTremor.detectionRate !== undefined ? `Tremor detection rate: ${restTremor.detectionRate.toFixed(1)}%.` : ''}

Postural tremor frequency of ${posturalTremor.frequency.toFixed(2)} Hz and amplitude of ${posturalTremor.amplitude.toFixed(2)} m/s² ${posturalSeverity?.severity === 'Normal' ? 'indicates normal findings' : `suggests ${posturalSeverity?.severity.toLowerCase()} tremor activity`}. ${posturalTremor.averageStatus ? `Sensor status: ${posturalTremor.averageStatus}.` : ''} ${posturalTremor.detectionRate !== undefined ? `Tremor detection rate: ${posturalTremor.detectionRate.toFixed(1)}%.` : ''}

${Math.abs(posturalTremor.frequency - restTremor.frequency) > 2 ? 'Significant difference between rest and postural tremor frequencies may indicate action tremor component.' : 'Minimal difference between rest and postural tremor suggests consistent tremor pattern.'}

${restSeverity?.severity === 'Severe' || posturalSeverity?.severity === 'Severe' ? 'Given the severity of findings, comprehensive neurological evaluation is recommended.' : restSeverity?.severity === 'Moderate' || posturalSeverity?.severity === 'Moderate' ? 'Moderate tremor detected. Consider follow-up monitoring and clinical correlation.' : 'Findings are within normal limits. Routine monitoring recommended.'}`
                  : restTremor
                  ? `Motor Assessment: Rest tremor evaluation completed. Frequency: ${restTremor.frequency.toFixed(2)} Hz, Amplitude: ${restTremor.amplitude.toFixed(2)} m/s². ${restTremor.averageStatus ? `Sensor status: ${restTremor.averageStatus}.` : ''} ${restTremor.detectionRate !== undefined ? `Detection rate: ${restTremor.detectionRate.toFixed(1)}%.` : ''} ${restSeverity?.description}`
                  : posturalTremor
                  ? `Motor Assessment: Postural tremor evaluation completed. Frequency: ${posturalTremor.frequency.toFixed(2)} Hz, Amplitude: ${posturalTremor.amplitude.toFixed(2)} m/s². ${posturalTremor.averageStatus ? `Sensor status: ${posturalTremor.averageStatus}.` : ''} ${posturalTremor.detectionRate !== undefined ? `Detection rate: ${posturalTremor.detectionRate.toFixed(1)}%.` : ''} ${posturalSeverity?.description}`
                  : latestCognitiveTest
                  ? 'Motor assessment data not available. Please complete motor function tests for a comprehensive evaluation.'
                  : 'No assessment data available. Please complete cognitive and motor function tests to generate a comprehensive report.'}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This report is generated automatically from sensor data.
            </Text>
            <Text style={styles.footerText}>
              Results should be interpreted by a qualified healthcare professional
              in conjunction with clinical examination and patient history.
            </Text>
            <Text style={styles.footerText}>
              Report generated on{' '}
              {new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => {
            navigation.navigate('MainTabs', { screen: 'Home' });
          }}
        >
          <Text style={styles.homeButtonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  reportHeader: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  reportSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  testSection: {
    marginBottom: 24,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  testTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  severityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  severityCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  severityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  severityDescription: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
    textAlign: 'center',
  },
  detailedStatsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailedStatsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  statsTable: {
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statsRowLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsRowValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  chartsContainer: {
    gap: 20,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  comparisonSection: {
    marginBottom: 24,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  comparisonCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  comparisonSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  comparisonLabel: {
    fontSize: 15,
    color: '#1E40AF',
    fontWeight: '500',
  },
  comparisonValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
  },
  interpretationSection: {
    marginBottom: 24,
  },
  interpretationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  interpretationCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  interpretationText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 22,
  },
  footer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  homeButton: {
    width: '100%',
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionDivider: {
    marginVertical: 24,
    paddingVertical: 16,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  sectionDividerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  cognitiveList: {
    gap: 12,
  },
  cognitiveItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cognitiveLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  cognitiveResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cognitiveValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  cognitiveBadge: {
    minWidth: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cognitiveBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});