import {create} from 'zustand';

export const useAppStore = create((set) => ({
    practitioner: {
        name: '',
        mobile: '',
        role: '',
        language: '',
        consent: {
            screening: false,
            patientConsent: false,
            data: false,
        },
    },
        setPractitionerField: (field, value) => 
            set((state) => ({
                practitioner: {
                    ...state.practitioner,
                    [field]: value,
                },
            })),
        setConsent: (field, value) => 
            set((state) => ({
                practitioner: {
                    ...state.practitioner,
                    consent: {
                        ...state.practitioner.consent,
                        [field]: value,
                    },
                },
            })),

        currentSession: null, 
        startSession: (patientId) => 
            set({
                currentSession: {
                    patientId,
                    startedAt: Date.now(),
                    steps: [],
                },
            }),

        addSessionStep: (step) => 
            set((state) => ({
                currentSession: {
                    ...state.currentSession,
                    steps: [...state.currentSession.steps, step],
                },
            })),
        endSession: (summary) => 
            set((state) => ({
                currentSession: {
                    ...state.currentSession,
                    ...summary
                },
            })),

        device: {
        connected: false,
        ip: '192.168.4.1',
        },
    
        setDeviceConnected: (value) =>
        set((state) => ({
            device: { ...state.device, connected: value },
        })),
    
        setDeviceIP: (ip) =>
        set((state) => ({
            device: { ...state.device, ip },
        })),
}));