import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTelemetryData from '../../../utils/useTelemetryData';

export default function MotorTestInstructionsScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const { patient } = route.params || {};
  const isDarkMode = useColorScheme() === 'dark';
  const safeAreaInsets = useSafeAreaInsets();
  const { telemetry, connectionStatus, reconnect } = useTelemetryData();

  const isConnected = telemetry !== null && connectionStatus === 'connected';

  if (!patient) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#EF4444', textAlign: 'center' }}>
          {t('common.error')}: Patient data not found
        </Text>
        <TouchableOpacity
          style={{ marginTop: 20, padding: 12, backgroundColor: '#2563EB', borderRadius: 8 }}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleContinue = () => {
    // Start session before navigating
    const { useSessionStore } = require('../../store/sessionStore');
    useSessionStore.getState().startSession(patient.id);
    // Navigate to Rest Tremor first (as per requirement)
    navigation.navigate('RestTremor', { patient });
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: safeAreaInsets.top,
          backgroundColor: '#fff',
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Motor Function Tests</Text>
        </View>

        {/* Patient Info Card */}
        <View style={styles.patientCard}>
          <View style={styles.patientHeader}>
            <View style={styles.patientIcon}>
              <Text style={styles.patientIconText}>👤</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientDetails}>
                {t('patient.detailsWithSex', {
                  age: patient.age,
                  sex: patient.sex,
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Setup Instructions Card */}
        <View style={styles.instructionsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📋</Text>
            <Text style={styles.cardTitle}>Setup Instructions</Text>
          </View>

          {/* WiFi Connection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('posturalTremor.connectWiFi')}
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>
                {t('posturalTremor.networkName')}
              </Text>
              <Text style={styles.infoValue}>Neura-Screening</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>
                {t('posturalTremor.password')}
              </Text>
              <Text style={styles.infoValue}>neura123</Text>
            </View>
          </View>

          {/* Connection Status */}
          <View style={styles.connectionCard}>
            <View style={styles.connectionRow}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isConnected ? '#22C55E' : '#EF4444' },
                ]}
              />
              <Text style={styles.connectionText}>
                {isConnected
                  ? t('posturalTremor.deviceConnected')
                  : t('posturalTremor.deviceNotConnected')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={reconnect}
              style={[
                styles.refreshButton,
                isConnected && styles.refreshButtonActive,
              ]}
            >
              <Text style={[styles.refreshButtonText, isConnected && { color: '#fff' }]}>
                {t('posturalTremor.refresh')}
              </Text>
            </TouchableOpacity>
            {!isConnected && (
              <Text style={styles.connectionHint}>
                {t('posturalTremor.connectWiFiHint')}
              </Text>
            )}
          </View>
        </View>

        {/* Test Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🧪</Text>
            <Text style={styles.cardTitle}>Test Overview</Text>
          </View>
          <View style={styles.testList}>
            <View style={styles.testItem}>
              <View style={styles.testNumber}>
                <Text style={styles.testNumberText}>1</Text>
              </View>
              <View style={styles.testContent}>
                <Text style={styles.testName}>Rest Tremor Test</Text>
                <Text style={styles.testDescription}>
                  Measure tremor while hands are at rest
                </Text>
              </View>
            </View>
            <View style={styles.testItem}>
              <View style={styles.testNumber}>
                <Text style={styles.testNumberText}>2</Text>
              </View>
              <View style={styles.testContent}>
                <Text style={styles.testName}>Postural Tremor Test</Text>
                <Text style={styles.testDescription}>
                  Measure tremor while holding arms outstretched
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isConnected && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isConnected}
        >
          <Text
            style={[
              styles.continueButtonText,
              !isConnected && styles.continueButtonTextDisabled,
            ]}
          >
            {isConnected
              ? 'Start Motor Tests'
              : t('posturalTremor.connectDeviceFirst')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  patientIconText: {
    fontSize: 24,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: 'monospace',
  },
  connectionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  connectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  refreshButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  refreshButtonActive: {
    backgroundColor: '#2563EB',
  },
  refreshButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  connectionHint: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  testList: {
    gap: 16,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  testNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  testContent: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

