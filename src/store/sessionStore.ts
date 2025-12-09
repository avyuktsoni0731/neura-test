import { create } from 'zustand';

interface PosturalTremorResults {
  frequency: number;
  amplitude: number;
  sampleCount: number;
}

interface TimedUpAndGoResults {
  completionTime: number;
  averageAmplitude: number;
  sampleCount: number;
}

interface ScreeningSession {
  patientId: string;
  startedAt: number;
  posturalTremor?: PosturalTremorResults;
  timedUpAndGo?: TimedUpAndGoResults;
}

interface SessionStore {
  currentSession: ScreeningSession | null;
  startSession: (patientId: string) => void;
  savePosturalTremorResults: (results: PosturalTremorResults) => void;
  saveTimedUpAndGoResults: (results: TimedUpAndGoResults) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  currentSession: null,
  
  startSession: (patientId: string) => set({
    currentSession: {
      patientId,
      startedAt: Date.now(),
    }
  }),
  
  savePosturalTremorResults: (results: PosturalTremorResults) => set((state) => ({
    currentSession: state.currentSession ? {
      ...state.currentSession,
      posturalTremor: results
    } : null
  })),
  
  saveTimedUpAndGoResults: (results: TimedUpAndGoResults) => set((state) => ({
    currentSession: state.currentSession ? {
      ...state.currentSession,
      timedUpAndGo: results
    } : null
  })),
  
  clearSession: () => set({ currentSession: null }),
}));