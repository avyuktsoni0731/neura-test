import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appstore.js';
import TelemetryDashboard from '../../components/TelemetryDashboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTelemetryData from '../../utils/useTelemetryData.ts';

interface SessionHistory {
  id: string;
  patientId: string;
  timestamp: number;
  status: 'success' | 'warning' | 'error' | 'none';
  results?: any;
}

interface PatientData {
  id: string;
  name: string;
  age: number;
  date: string;
  motorScore: number;
  cognitiveTime: number;
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
}

interface ReportData {
  id: string;
  patientName: string;
  date: string;
  cognitiveScore: number;
  motorScore: number;
  maxCognitiveScore?: number; // Add this optional property
}

import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/appNavigator.tsx';

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { practitioner, logout, patients, loadPatients, getScreeningReports } =
    useAppStore();
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'patients' | 'reports'>(
    'patients',
  );
  const safeAreaInsets = useSafeAreaInsets();
  const { connectionStatus } = useTelemetryData();

  useEffect(() => {
    loadPatients();
    loadSessionHistory();
  }, []);

  const loadSessionHistory = async () => {
    setSessionHistory([]);
  };

  const handleExportPDF = (report: ReportData) => {
    // TODO: Implement PDF export functionality
    console.log('Exporting PDF for:', report.patientName);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low Risk':
        return '#22c55e';
      case 'Medium Risk':
        return '#eab308';
      case 'High Risk':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  };

  // Calculate risk level based on scores
  const calculateRiskLevel = (
    cognitiveScore: number,
    motorScore: number,
  ): string => {
    if (cognitiveScore >= 8 && motorScore >= 20) return 'Low Risk';
    if (cognitiveScore >= 6 && motorScore >= 15) return 'Medium Risk';
    return 'High Risk';
  };

  // Get patient data with latest results
  const getPatientData = () => {
    return patients.map(patient => {
      const latestQuiz = patient.quizResults?.[patient.quizResults.length - 1];
      const latestMotor =
        patient.motorResults?.[patient.motorResults.length - 1];

      const cognitiveScore = latestQuiz?.totalScore || 0;
      const motorScore = latestMotor?.totalScore || 0;
      const riskLevel = calculateRiskLevel(cognitiveScore, motorScore);

      return {
        id: patient.id,
        name: patient.name,
        age: parseInt(patient.age) || 0,
        date: latestQuiz?.date || new Date().toISOString().split('T')[0],
        motorScore,
        cognitiveTime: latestQuiz?.cognitiveTime || 0,
        riskLevel,
      };
    });
  };

  const renderPatientItem = ({ item }: { item: PatientData }) => (
    <View style={styles.patientItem}>
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.name}</Text>
          <Text style={styles.patientAge}>
            Age {item.age} • {item.date}
          </Text>
        </View>
        <View
          style={[
            styles.riskBadge,
            { backgroundColor: getRiskColor(item.riskLevel) },
          ]}
        >
          <Text style={styles.riskText}>{item.riskLevel}</Text>
        </View>
      </View>

      <View style={styles.scoresGrid}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Motor Score</Text>
          <Text style={styles.scoreValue}>{item.motorScore}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Cognitive Score</Text>
          <Text style={styles.scoreValue}>{item.cognitiveTime}</Text>
        </View>
      </View>
    </View>
  );

  const renderReportItem = ({ item }: { item: ReportData }) => (
    <View style={styles.reportItem}>
      <View style={styles.reportInfo}>
        <Text style={styles.reportPatientName}>{item.patientName}</Text>
        <Text style={styles.reportDate}>{item.date}</Text>
        <Text style={styles.reportScores}>
          Cognitive: {item.cognitiveScore}/{item.maxCognitiveScore} • Motor:{' '}
          {item.motorScore}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.exportButton}
        onPress={() => handleExportPDF(item)}
      >
        <Text style={styles.exportButtonText}>Export PDF</Text>
      </TouchableOpacity>
    </View>
  );

  if (showTelemetry) {
    return (
      <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
        <TelemetryDashboard onBack={() => setShowTelemetry(false)} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>NeuroSense</Text>
          <Text style={styles.greeting}>
            Hello, {practitioner.name || 'Avyukt'}
          </Text>
        </View>
        <View style={styles.wifiIcon}>
          <Text style={styles.wifiText}>📶</Text>
        </View>
      </View>

      {/* Device Status */}
      <View style={styles.deviceStatus}>
        <Text style={styles.deviceStatusTitle}>Device Status</Text>
        <View style={styles.deviceInfo}>
          <View style={styles.statusIndicator}>
            <Text style={styles.wifiIcon}>📶</Text>
            <View>
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      connectionStatus === 'connected' ? '#22c55e' : '#ef4444',
                  },
                ]}
              >
                {connectionStatus === 'connected'
                  ? 'Connected'
                  : 'Disconnected'}
              </Text>
              <Text style={styles.deviceName}>NeuroSense Kit #001</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('FingerTapping')}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>👆</Text>
          </View>
          <View>
            <Text style={styles.actionTitle}>Finger Tapping Test</Text>
            <Text style={styles.actionSubtitle}>Start new assessment</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'patients' && styles.activeTab]}
          onPress={() => setActiveTab('patients')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'patients' && styles.activeTabText,
            ]}
          >
            👥 Patients
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'reports' && styles.activeTabText,
            ]}
          >
            📋 Reports
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'patients' ? (
          <FlatList
            data={getPatientData()}
            renderItem={renderPatientItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={getScreeningReports()}
            renderItem={renderReportItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
  },
  wifiIcon: {
    fontSize: 20,
  },
  wifiText: {
    fontSize: 20,
  },
  deviceStatus: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActions: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  deviceStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceName: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  patientItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  patientAge: {
    fontSize: 14,
    color: '#6b7280',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  scoresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreItem: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  reportItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reportInfo: {
    flex: 1,
  },
  reportPatientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  reportScores: {
    fontSize: 12,
    color: '#6b7280',
  },
  exportButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
