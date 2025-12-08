import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/appstore.js';

export default function HomeScreen() {
  const { practitioner, logout } = useAppStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome, {practitioner.name || 'Practitioner'}!
      </Text>
      <Text style={styles.subtitle}>Mobile: {practitioner.mobile || '-'}</Text>
      <Text style={styles.subtitle}>Role: {practitioner.role || '-'}</Text>
      <Text style={styles.subtitle}>
        Language: {practitioner.language || '-'}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: '#dc3545',
          padding: 15,
          borderRadius: 8,
          marginTop: 20,
        }}
        onPress={logout}
      >
        <Text
          style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}
        >
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#555', marginBottom: 5 },
});
