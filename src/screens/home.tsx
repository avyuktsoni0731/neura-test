import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAppStore } from '../store/appstore.js';

export default function HomeScreen() {
  const { practitioner, logout } = useAppStore();

  return (
    <View style={styles.container}>
      <View className="bg-white h-fit w-fit">
        <Image
          source={require('../../assets/logoIcon.png')}
          className="w-11 h-11"
          resizeMode="cover"
          style={{ width: 200, height: 200 }}
        />
      </View>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 0,
    backgroundColor: 'white',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#555', marginBottom: 5 },
});
