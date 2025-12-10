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
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appstore.js';

export default function AddPatientScreen({ navigation, route }) {
  const { t } = useTranslation();
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
      Alert.alert(t('common.error'), t('addPatient.validationName'));
      return;
    }
    if (!age.trim()) {
      Alert.alert(t('common.error'), t('addPatient.validationAge'));
      return;
    }
    if (!sex.trim()) {
      Alert.alert(t('common.error'), t('addPatient.validationSex'));
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
      Alert.alert(t('common.success'), t('addPatient.patientAddedSuccess'), [
        {
          text: t('common.ok'),
          onPress: () => {
            onPatientAdded?.();
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert(t('common.error'), t('addPatient.failedToSave'));
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
      <Text style={styles.header}>{t('addPatient.title')}</Text>

      <Text style={styles.label}>{t('addPatient.nameOrId')}</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder={t('addPatient.enterNameOrId')}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>{t('addPatient.age')}</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        placeholder={t('addPatient.enterAge')}
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>{t('addPatient.sex')}</Text>
      <View style={styles.sexContainer}>
        <SexButton value="Male" label={t('addPatient.male')} />
        <SexButton value="Female" label={t('addPatient.female')} />
        <SexButton value="Other" label={t('addPatient.other')} />
      </View>

      <Text style={styles.label}>{t('addPatient.phone')}</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder={t('addPatient.enterPhone')}
        keyboardType="phone-pad"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>{t('addPatient.medicalHistory')}</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={medicalHistory}
        onChangeText={setMedicalHistory}
        placeholder={t('addPatient.enterMedicalHistory')}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSavePatient}>
        <Text style={styles.saveBtnText}>{t('addPatient.savePatient')}</Text>
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
