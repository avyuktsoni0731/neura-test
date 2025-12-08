import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAppStore } from '../store/appstore.js';
import TelemetryDashboard from '../../components/TelemetryDashboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function HomeScreen() {
  const { practitioner, logout } = useAppStore();
  const [showTelemetry, setShowTelemetry] = useState(false);

  if (showTelemetry) {
    const safeAreaInsets = useSafeAreaInsets();

    return (
      <View className="flex-1" style={{ paddingTop: safeAreaInsets.top }}>
        <TelemetryDashboard onBack={() => setShowTelemetry(false)} />
      </View>
    );
  }

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

      <View style={{ padding: 20 }}>
        <TouchableOpacity
          className="items-center justify-center mb-4 p-4 rounded-2xl bg-black"
          onPress={() => setShowTelemetry(true)}
        >
          <Text className="text-white">Open Telemetry Dashboard</Text>
        </TouchableOpacity>
      </View>
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
