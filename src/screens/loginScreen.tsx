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
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appstore.js';
import { changeLanguage } from '../i18n';

console.log('LoginScreen store:', useAppStore);

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
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
      return Alert.alert(t('common.error'), t('login.errorValidPinLength'));
    }

    const success = await loginWithPin(loginPin);
    if (success) {
      navigation.replace('MainTabs');
    } else {
      Alert.alert(t('common.error'), t('login.errorIncorrectPin'));
    }
  };

  const handleNewUserRegistration = async () => {
    // Validation
    if (name.trim() === '')
      return Alert.alert(t('common.error'), t('login.errorEnterName'));
    if (mobile.trim() === '')
      return Alert.alert(t('common.error'), t('login.errorEnterMobile'));
    if (role.trim() === '')
      return Alert.alert(t('common.error'), t('login.errorSelectRole'));
    if (language.trim() === '')
      return Alert.alert(t('common.error'), t('login.errorSelectLanguage'));
    if (pin.trim() === '' || pin.length !== 4)
      return Alert.alert(t('common.error'), t('login.errorValidPin'));
    if (!consentScreening || !consentPatient || !consentData)
      return Alert.alert(t('common.error'), t('login.errorAllConsents'));

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
    // Set language if practitioner has a preferred language
    if (language) {
      const languageMap: { [key: string]: string } = {
        'English': 'en',
        'Hindi': 'hi',
        'Tamil': 'ta',
        'Malayalam': 'ml',
        'en': 'en',
        'hi': 'hi',
        'ta': 'ta',
        'ml': 'ml',
      };
      const langCode = languageMap[language] || 'en';
      await changeLanguage(langCode);
    }
    navigation.replace('MainTabs');
  };

  const handleCreateNewAccount = () => {
    setIsReturningUser(false);
  };

  if (isReturningUser) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('login.welcomeBack')}</Text>
        <Text style={styles.subtitle}>{t('login.hello', { name: practitioner.name })}</Text>

        <TextInput
          placeholder={t('login.enterPin')}
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
          <Text style={styles.buttonText}>{t('login.login')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#6c757d', marginTop: 10 }]}
          onPress={handleCreateNewAccount}
        >
          <Text style={styles.buttonText}>{t('login.createNewAccount')}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Existing new user form...
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('login.practitionerRegistration')}</Text>

      {/* Existing form fields... */}
      <TextInput
        placeholder={t('login.fullName')}
        style={styles.input}
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder={t('login.mobileNumber')}
        style={styles.input}
        keyboardType="phone-pad"
        placeholderTextColor="#999"
        value={mobile}
        onChangeText={setMobile}
      />
      <TextInput
        placeholder={t('login.role')}
        style={styles.input}
        placeholderTextColor="#999"
        value={role}
        onChangeText={setRole}
      />
      <TextInput
        placeholder={t('login.preferredLanguage')}
        style={styles.input}
        placeholderTextColor="#999"
        value={language}
        onChangeText={setLanguage}
      />
      <TextInput
        placeholder={t('login.pin')}
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
            {consentScreening ? '✅' : '⬜'} {t('login.consentScreening')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setConsentPatient(!consentPatient)}
          style={styles.checkbox}
        >
          <Text>
            {consentPatient ? '✅' : '⬜'} {t('login.consentPatient')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setConsentData(!consentData)}
          style={styles.checkbox}
        >
          <Text>
            {consentData ? '✅' : '⬜'} {t('login.consentData')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleNewUserRegistration}
      >
        <Text style={styles.buttonText}>{t('login.registerAndLogin')}</Text>
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
