import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAppStore } from '../store/appstore.js'; 
import AppNavigator from '../navigataion/appNavigator.js';

console.log("LoginScreen store:", useAppStore);


export default function LoginScreen({ navigation }) {
const setPractitionerField = useAppStore((state) => state.setPractitionerField);
const setConsent = useAppStore((state) => state.setConsent);

const [name, setName] = useState('');
const [mobile, setMobile] = useState('');
const [role, setRole] = useState('');
const [language, setLanguage] = useState('');
const [pin, setPin] = useState('');
const [consentScreening, setConsentScreening] = useState(false);
const [consentPatient, setConsentPatient] = useState(false);
const [consentData, setConsentData] = useState(false);

const handleLogin = () => {
    if (name.trim() === '') return Alert.alert('Error', 'Please enter your name');
    if (mobile.trim() === '') return Alert.alert('Error', 'Please enter your mobile number');
    if (role.trim() === '') return Alert.alert('Error', 'Please select your role');
    if (language.trim() === '') return Alert.alert('Error', 'Please select your preferred language');
    if (pin.trim() === '' || pin.length !== 4) return Alert.alert('Error', 'Enter a valid 4-digit PIN');
    if (!consentScreening || !consentPatient || !consentData)
    return Alert.alert('Error', 'Please agree to all consent checkboxes');

    // setPractitionerField('name', name);
    setPractitionerField('name', name);
    setPractitionerField('mobile', mobile);
    setPractitionerField('role', role);
    setPractitionerField('language', language);


    setConsent('screening', consentScreening);
    setConsent('patientConsent', consentPatient);
    setConsent('data', consentData);

    navigation.replace('MainTabs');
};

return (
    <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Practitioner Login</Text>

    <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
    />
    <TextInput
        placeholder="Mobile Number"
        style={styles.input}
        keyboardType="phone-pad"
        value={mobile}
        onChangeText={setMobile}
    />
    <TextInput
        placeholder="Role (e.g. Nurse)"
        style={styles.input}
        value={role}
        onChangeText={setRole}
    />
    <TextInput
        placeholder="Preferred Language"
        style={styles.input}
        value={language}
        onChangeText={setLanguage}
    />
    <TextInput
        placeholder="4-digit PIN"
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        keyboardType="number-pad"
        secureTextEntry={true}
        maxLength={4}
    />

    <View style={styles.checkboxContainer}>
        <TouchableOpacity onPress={() => setConsentScreening(!consentScreening)} style={styles.checkbox}>
        <Text>{consentScreening ? '✅' : '⬜'} I understand this is for screening only</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setConsentPatient(!consentPatient)} style={styles.checkbox}>
        <Text>{consentPatient ? '✅' : '⬜'} I will obtain patient consent before screening</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setConsentData(!consentData)} style={styles.checkbox}>
        <Text>{consentData ? '✅' : '⬜'} I will handle patient data responsibly</Text>
        </TouchableOpacity>
    </View>

    

    <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
    </TouchableOpacity>
    </ScrollView>
);
}

const styles = StyleSheet.create({
container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
input: { borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 8, marginBottom: 20 },
button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center' },
buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
checkboxContainer: {marginBottom: 20},
checkbox: {flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
});
