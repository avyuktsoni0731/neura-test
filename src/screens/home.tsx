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
import { useAppStore } from '../store/appstore.js';
import TelemetryDashboard from '../../components/TelemetryDashboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SessionHistory {
  id: string;
  patientId: string;
  timestamp: number;
  status: 'success' | 'warning' | 'error' | 'none';
  results?: any;
}
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AddPatientScreen from './addPatient.js';
import { RootStackParamList } from '../navigation/appNavigator.tsx';

export default function HomeScreen({ navigation }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { practitioner, logout, patients, loadPatients } = useAppStore();
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const safeAreaInsets = useSafeAreaInsets();

  useEffect(() => {
    loadPatients();
    // Load session history from storage
    loadSessionHistory();
  }, []);

  const loadSessionHistory = async () => {
    // TODO: Load from AsyncStorage
    // For now, mock data
    setSessionHistory([]);
  };

  const getPatientLastSession = (patientId: string) => {
    const patientSessions = sessionHistory.filter(
      s => s.patientId === patientId,
    );
    return patientSessions.length > 0
      ? patientSessions[patientSessions.length - 1]
      : null;
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'success':
        return '#22c55e';
      case 'warning':
        return '#eab308';
      case 'error':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  };

  const handleAddPatient = () => {
    navigation.navigate('AddPatient', { onPatientAdded: loadPatients });
  };

  const handlePatientPress = patient => {
    navigation.navigate('PatientDetails', { patient });
  };

  if (showTelemetry) {
    return (
      <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
        <TelemetryDashboard onBack={() => setShowTelemetry(false)} />
      </View>
    );
  }

  const renderPatient = ({ item }) => {
    const lastSession = getPatientLastSession(item.id);
    const statusColor = getStatusColor(lastSession?.status || null);

    return (
      <TouchableOpacity
        style={styles.patientCard}
        onPress={() => handlePatientPress(item)}
      >
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.name}</Text>
          <Text style={styles.patientDetails}>
            Age: {item.age} • {item.sex}
          </Text>
        </View>
        <View
          style={[styles.statusIndicator, { backgroundColor: statusColor }]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logoIcon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Welcome, {practitioner.name || 'Practitioner'}!
        </Text>
        <Text style={styles.roleText}>
          {practitioner.role || 'Healthcare Professional'}
        </Text>
      </View>

      {/* Add Patient Button */}
      <TouchableOpacity
        style={styles.addPatientButton}
        onPress={handleAddPatient}
      >
        <Text style={styles.addPatientText}>+ Add New Patient</Text>
      </TouchableOpacity>

      {/* Patient List */}
      <View style={styles.patientsSection}>
        <Text style={styles.sectionTitle}>Patients</Text>
        {patients.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No patients added yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first patient to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={patients}
            renderItem={renderPatient}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.telemetryButton}
          onPress={() => setShowTelemetry(true)}
        >
          <Text style={styles.telemetryText}>Telemetry Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={{ padding: 20 }}>
        <TouchableOpacity
          className="items-center justify-center mb-4 p-4 rounded-2xl bg-black"
          onPress={() => navigation.navigate('Question1')}
        >
          <Text className="text-white text-lg font-semibold">Start Test</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  roleText: {
    fontSize: 16,
    color: '#6b7280',
  },
  addPatientButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  addPatientText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  patientsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  patientCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  quickActions: {
    gap: 12,
  },
  telemetryButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  telemetryText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
});
