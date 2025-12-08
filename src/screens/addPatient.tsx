import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAppStore } from '../store/appstore.js';

export default function AddPatientScreen({ navigation, route }) {
  const { practitioner, savePatient } = useAppStore();
  const { onPatientAdded } = route.params || {};

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [phone, setPhone] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  const handleSavePatient = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter patient name or ID');
      return;
    }
    if (!age.trim()) {
      Alert.alert('Error', 'Please enter patient age');
      return;
    }
    if (!sex.trim()) {
      Alert.alert('Error', 'Please select patient sex');
      return;
    }

    const patient = {
      id: Date.now().toString(),
      name: name.trim(),
      age: age.trim(),
      sex: sex.trim(),
      phone: phone.trim(),
      medicalHistory: medicalHistory.trim(),
      practitionerId: practitioner.mobile,
      createdAt: Date.now(),
    };

    try {
      await savePatient(patient);
      Alert.alert('Success', 'Patient added successfully', [
        {
          text: 'OK',
          onPress: () => {
            onPatientAdded?.();
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save patient');
    }
  };

  const SexButton = ({ value, label }) => (
    <TouchableOpacity
      style={[styles.sexButton, sex === value && styles.selectedSexButton]}
      onPress={() => setSex(value)}
    >
      <Text
        style={[
          styles.sexButtonText,
          sex === value && styles.selectedSexButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add New Patient</Text>

      <Text style={styles.label}>Name or ID *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter patient name or ID"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Age *</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        placeholder="Enter age"
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Sex *</Text>
      <View style={styles.sexContainer}>
        <SexButton value="Male" label="Male" />
        <SexButton value="Female" label="Female" />
        <SexButton value="Other" label="Other" />
      </View>

      <Text style={styles.label}>Phone (Optional)</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Medical History</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={medicalHistory}
        onChangeText={setMedicalHistory}
        placeholder="Enter relevant medical history"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSavePatient}>
        <Text style={styles.saveBtnText}>Save Patient</Text>
      </TouchableOpacity>
    </ScrollView>
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
    marginBottom: 30,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 100,
  },
  sexContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  sexButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  selectedSexButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  sexButtonText: {
    fontSize: 16,
    color: '#666',
  },
  selectedSexButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
