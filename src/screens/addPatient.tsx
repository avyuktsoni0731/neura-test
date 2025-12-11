import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
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
  const [bloodGroup, setBloodGroup] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showBloodGroupModal, setShowBloodGroupModal] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const formatDate = text => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    if (cleaned.length > 2 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(
        2,
        4,
      )}-${cleaned.slice(4, 8)}`;
    }

    return formatted.slice(0, 10);
  };

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
    if (!bloodGroup.trim()) {
      Alert.alert(t('common.error'), t('addPatient.validationBloodGroup'));
      return;
    }
    if (!weight.trim()) {
      Alert.alert(t('common.error'), t('addPatient.validationWeight'));
      return;
    }
    if (!height.trim()) {
      Alert.alert(t('common.error'), t('addPatient.validationHeight'));
      return;
    }
    if (!dateOfBirth.trim() || dateOfBirth.length !== 10) {
      Alert.alert(t('common.error'), t('addPatient.validationDateOfBirth'));
      return;
    }

    const patient = {
      id: Date.now().toString(),
      name: name.trim(),
      age: age.trim(),
      sex: sex.trim(),
      phone: phone.trim(),
      medicalHistory: medicalHistory.trim(),
      bloodGroup: bloodGroup.trim(),
      weight: weight.trim(),
      height: height.trim(),
      dateOfBirth: dateOfBirth.trim(),
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

      <Text style={styles.label}>{t('addPatient.dateOfBirth')}</Text>
      <TextInput
        style={styles.input}
        value={dateOfBirth}
        onChangeText={text => setDateOfBirth(formatDate(text))}
        placeholder={t('addPatient.dateOfBirthPlaceholder')}
        keyboardType="numeric"
        maxLength={10}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>{t('addPatient.sex')}</Text>
      <View style={styles.sexContainer}>
        <SexButton value="Male" label={t('addPatient.male')} />
        <SexButton value="Female" label={t('addPatient.female')} />
        <SexButton value="Other" label={t('addPatient.other')} />
      </View>

      <Text style={styles.label}>{t('addPatient.bloodGroup')}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowBloodGroupModal(true)}
      >
        <Text
          style={[styles.dropdownText, !bloodGroup && styles.placeholderText]}
        >
          {bloodGroup || t('addPatient.selectBloodGroup')}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Text style={styles.label}>{t('addPatient.weight')}</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        placeholder={t('addPatient.enterWeight')}
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>{t('addPatient.height')}</Text>
      <TextInput
        style={styles.input}
        value={height}
        onChangeText={setHeight}
        placeholder={t('addPatient.enterHeight')}
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

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

      <Modal
        visible={showBloodGroupModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBloodGroupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('addPatient.selectBloodGroup')}
            </Text>
            <FlatList
              data={bloodGroups}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bloodGroupItem}
                  onPress={() => {
                    setBloodGroup(item);
                    setShowBloodGroupModal(false);
                  }}
                >
                  <Text style={styles.bloodGroupText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowBloodGroupModal(false)}
            >
              <Text style={styles.modalCloseText}>
                {t('addPatient.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  bloodGroupItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bloodGroupText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  modalCloseText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
});
