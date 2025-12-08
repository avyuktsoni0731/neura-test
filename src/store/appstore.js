import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAppStore = create((set, get) => ({
  // Authentication state
  isLoggedIn: false,

  // Practitioner data
  practitioner: {
    name: '',
    mobile: '',
    role: '',
    language: '',
    pin: '',
    consent: {
      screening: false,
      patientConsent: false,
      data: false,
    },
  },

  // Load saved practitioner data
  loadSavedPractitioner: async () => {
    try {
      const savedData = await AsyncStorage.getItem('practitionerData');
      if (savedData) {
        const practitioner = JSON.parse(savedData);
        set({ practitioner, isLoggedIn: false });
      }
    } catch (error) {
      console.error('Failed to load practitioner data:', error);
    }
  },

  // Login with PIN verification
  loginWithPin: async inputPin => {
    const { practitioner } = get();
    if (practitioner.pin === inputPin) {
      set({ isLoggedIn: true });
      return true;
    }
    return false;
  },

  // Save practitioner data and login
  savePractitionerAndLogin: async practitionerData => {
    try {
      await AsyncStorage.setItem(
        'practitionerData',
        JSON.stringify(practitionerData),
      );
      set({
        practitioner: practitionerData,
        isLoggedIn: true,
      });
    } catch (error) {
      console.error('Failed to save practitioner data:', error);
    }
  },

  // Logout
  logout: () => set({ isLoggedIn: false }),

  // Clear all data
  clearPractitionerData: async () => {
    try {
      await AsyncStorage.removeItem('practitionerData');
      set({
        practitioner: {
          name: '',
          mobile: '',
          role: '',
          language: '',
          pin: '',
          consent: { screening: false, patientConsent: false, data: false },
        },
        isLoggedIn: false,
      });
    } catch (error) {
      console.error('Failed to clear practitioner data:', error);
    }
  },

  // Patient management
  patients: [],

  // Load patients for current practitioner
  loadPatients: async () => {
    const { practitioner } = get();
    try {
      const savedPatients = await AsyncStorage.getItem(
        `patients_${practitioner.mobile}`,
      );
      if (savedPatients) {
        const patients = JSON.parse(savedPatients);
        set({ patients });
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  },

  // Save new patient
  savePatient: async patient => {
    const { practitioner, patients } = get();
    try {
      const updatedPatients = [...patients, patient];
      await AsyncStorage.setItem(
        `patients_${practitioner.mobile}`,
        JSON.stringify(updatedPatients),
      );
      set({ patients: updatedPatients });
    } catch (error) {
      console.error('Failed to save patient:', error);
    }
  },

  // Delete patient
  deletePatient: async patientId => {
    const { practitioner, patients } = get();
    try {
      const updatedPatients = patients.filter(p => p.id !== patientId);
      await AsyncStorage.setItem(
        `patients_${practitioner.mobile}`,
        JSON.stringify(updatedPatients),
      );
      set({ patients: updatedPatients });
    } catch (error) {
      console.error('Failed to delete patient:', error);
    }
  },

  // Existing methods...
  setPractitionerField: (field, value) =>
    set(state => ({
      practitioner: {
        ...state.practitioner,
        [field]: value,
      },
    })),

  setConsent: (field, value) =>
    set(state => ({
      practitioner: {
        ...state.practitioner,
        consent: {
          ...state.practitioner.consent,
          [field]: value,
        },
      },
    })),

  currentSession: null,
  startSession: patientId =>
    set({
      currentSession: {
        patientId,
        startedAt: Date.now(),
        steps: [],
      },
    }),

  addSessionStep: step =>
    set(state => ({
      currentSession: {
        ...state.currentSession,
        steps: [...state.currentSession.steps, step],
      },
    })),
  endSession: summary =>
    set(state => ({
      currentSession: {
        ...state.currentSession,
        ...summary,
      },
    })),

  device: {
    connected: false,
    ip: '192.168.4.1',
  },

  setDeviceConnected: value =>
    set(state => ({
      device: { ...state.device, connected: value },
    })),

  setDeviceIP: ip =>
    set(state => ({
      device: { ...state.device, ip },
    })),
}));
