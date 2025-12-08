import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useAppStore } from '../store/appstore.js';

console.log('LoginScreen store:', useAppStore);

export default function LoginScreen({ navigation }) {
  const {
    practitioner,
    loadSavedPractitioner,
    loginWithPin,
    savePractitionerAndLogin,
    clearPractitionerData,
  } = useAppStore();

  const [isReturningUser, setIsReturningUser] = useState(false);
  const [loginPin, setLoginPin] = useState('');

  // Form states for new user
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('');
  const [language, setLanguage] = useState('');
  const [pin, setPin] = useState('');
  const [consentScreening, setConsentScreening] = useState(false);
  const [consentPatient, setConsentPatient] = useState(false);
  const [consentData, setConsentData] = useState(false);

  useEffect(() => {
    loadSavedPractitioner().then(() => {
      if (practitioner.name && practitioner.pin) {
        setIsReturningUser(true);
      }
    });
  }, []);

  const handleReturningUserLogin = async () => {
    if (loginPin.length !== 4) {
      return Alert.alert('Error', 'Enter a valid 4-digit PIN');
    }

    const success = await loginWithPin(loginPin);
    if (success) {
      navigation.replace('MainTabs');
    } else {
      Alert.alert('Error', 'Incorrect PIN');
    }
  };

  const handleNewUserRegistration = async () => {
    // Validation
    if (name.trim() === '')
      return Alert.alert('Error', 'Please enter your name');
    if (mobile.trim() === '')
      return Alert.alert('Error', 'Please enter your mobile number');
    if (role.trim() === '')
      return Alert.alert('Error', 'Please select your role');
    if (language.trim() === '')
      return Alert.alert('Error', 'Please select your preferred language');
    if (pin.trim() === '' || pin.length !== 4)
      return Alert.alert('Error', 'Enter a valid 4-digit PIN');
    if (!consentScreening || !consentPatient || !consentData)
      return Alert.alert('Error', 'Please agree to all consent checkboxes');

    // Check if user with same mobile and PIN already exists
    if (practitioner.mobile === mobile && practitioner.pin === pin) {
      // User exists, just login
      const success = await loginWithPin(pin);
      if (success) {
        navigation.replace('MainTabs');
        return;
      }
    }

    // Create new account
    const newPractitioner = {
      name,
      mobile,
      role,
      language,
      pin,
      consent: {
        screening: consentScreening,
        patientConsent: consentPatient,
        data: consentData,
      },
    };

    await savePractitionerAndLogin(newPractitioner);
    navigation.replace('MainTabs');
  };

  const handleCreateNewAccount = () => {
    setIsReturningUser(false);
  };

  if (isReturningUser) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Hello, {practitioner.name}</Text>

        <TextInput
          placeholder="Enter your 4-digit PIN"
          style={styles.input}
          value={loginPin}
          onChangeText={setLoginPin}
          keyboardType="number-pad"
          placeholderTextColor="#999"
          //   secureTextEntry={true}
          maxLength={4}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleReturningUserLogin}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#6c757d', marginTop: 10 }]}
          onPress={handleCreateNewAccount}
        >
          <Text style={styles.buttonText}>Create New Account</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Existing new user form...
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Practitioner Registration</Text>

      {/* Existing form fields... */}
      <TextInput
        placeholder="Full Name"
        style={styles.input}
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Mobile Number"
        style={styles.input}
        keyboardType="phone-pad"
        placeholderTextColor="#999"
        value={mobile}
        onChangeText={setMobile}
      />
      <TextInput
        placeholder="Role (e.g. Nurse)"
        style={styles.input}
        placeholderTextColor="#999"
        value={role}
        onChangeText={setRole}
      />
      <TextInput
        placeholder="Preferred Language"
        style={styles.input}
        placeholderTextColor="#999"
        value={language}
        onChangeText={setLanguage}
      />
      <TextInput
        placeholder="4-digit PIN"
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        keyboardType="number-pad"
        placeholderTextColor="#999"
        // secureTextEntry={true}
        maxLength={4}
      />

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          onPress={() => setConsentScreening(!consentScreening)}
          style={styles.checkbox}
        >
          <Text>
            {consentScreening ? '✅' : '⬜'} I understand this is for screening
            only
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setConsentPatient(!consentPatient)}
          style={styles.checkbox}
        >
          <Text>
            {consentPatient ? '✅' : '⬜'} I will obtain patient consent before
            screening
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setConsentData(!consentData)}
          style={styles.checkbox}
        >
          <Text>
            {consentData ? '✅' : '⬜'} I will handle patient data responsibly
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleNewUserRegistration}
      >
        <Text style={styles.buttonText}>Register & Login</Text>
      </TouchableOpacity>

      {/* <View style={{ padding: 20 }}>
        <TouchableOpacity
          className="items-center justify-center mb-4 p-4 rounded-2xl bg-black"
          onPress={() => setShowTelemetry(true)}
        >
          <Text className="text-white">Open Telemetry Dashboard</Text>
        </TouchableOpacity>
      </View> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  checkboxContainer: { marginBottom: 20 },
  checkbox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
});
