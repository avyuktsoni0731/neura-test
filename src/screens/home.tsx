import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAppStore } from '../store/appstore.js';

export default function HomeScreen() {
  const { practitioner, logout } = useAppStore();

  return (
    <View style={styles.container}>
      <View className='bg-white rounded-full p-2 pt-1 w-[16px] h-[16px] '>
      <Image
      source={require('../../assets/logo2.png')}
      className='w-full h-full mt-0'
      resizeMode='contain'
      /></View>
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
    backgroundColor: 'pink',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#555', marginBottom: 5 },
});
