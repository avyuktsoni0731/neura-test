import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useAppStore } from '../store/appstore.js';

interface Patient {
  id: string;
  name: string;
  age: string;
  sex: string;
  phone?: string;
  medicalHistory: string;
  practitionerId: string;
  createdAt: number;
}

export default function NewSessionScreen({ navigation }) {
  const { practitioner, patients, loadPatients, deletePatient } = useAppStore();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const handleAddPatient = () => {
    navigation.navigate('AddPatient', { onPatientAdded: loadPatients });
  };

  const handleStartScreening = () => {
    if (!selectedPatient) {
      Alert.alert('Error', 'Please select a patient first');
      return;
    }
    // Start screening session
    navigation.navigate('Screening', { patient: selectedPatient });
  };

  const handleDeletePatient = (patientId: string, patientName: string) => {
    Alert.alert(
      'Delete Patient',
      `Are you sure you want to delete ${patientName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePatient(patientId);
              // Clear selection if deleted patient was selected
              if (selectedPatient?.id === patientId) {
                setSelectedPatient(null);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete patient');
            }
          },
        },
      ],
    );
  };

  const renderPatient = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={[
        styles.patientItem,
        selectedPatient?.id === item.id && styles.selectedPatient,
      ]}
      onPress={() => setSelectedPatient(item)}
    >
      <View style={styles.patientContent}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.name}</Text>
          <Text style={styles.patientDetails}>
            Age: {item.age} • Sex: {item.sex}
          </Text>
          {item.phone && (
            <Text style={styles.patientPhone}>Phone: {item.phone}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeletePatient(item.id, item.name)}
        >
          <Text style={styles.deleteBtnText}>×</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>New Session</Text>
      <Text style={styles.subText}>
        Add a patient or select from existing patients to start screening.
      </Text>

      <TouchableOpacity style={styles.addBtn} onPress={handleAddPatient}>
        <Text style={styles.addBtnText}>+ Add New Patient</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Existing Patients</Text>

      <View
        className="flex-col justify-between gap-4"
        style={{ height: '100%' }}
      >
        <FlatList
          data={patients}
          renderItem={renderPatient}
          keyExtractor={item => item.id}
          style={styles.patientList}
          contentContainerStyle={styles.patientListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No patients added yet</Text>
          }
        />

        {selectedPatient && (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleStartScreening}
          >
            <Text style={styles.startBtnText}>Start Screening</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  addBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  patientList: {
    maxHeight: '45%',
    marginBottom: 10,
  },
  patientListContent: {
    paddingBottom: 10,
  },
  patientItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPatient: {
    borderColor: '#007bff',
    backgroundColor: '#e3f2fd',
  },
  patientContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  patientDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  patientPhone: {
    fontSize: 14,
    color: '#666',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 50,
  },
  startBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});
