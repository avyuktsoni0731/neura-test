import { create } from 'zustand';

export interface TimeSeriesDataPoint {
  timestamp: number;
  frequency: number;
  amplitude: number;
  stability?: number;
  rhythmicity?: number;
  status?: string;
  detected?: boolean;
  consecutive?: number;
}

export interface PosturalTremorResults {
  frequency: number;
  amplitude: number;
  sampleCount: number;
  stability?: number;
  rhythmicity?: number;
  timeSeriesData: TimeSeriesDataPoint[];
  averageStatus?: string;
  detectionRate?: number;
  maxConsecutive?: number;
}

export interface RestTremorResults {
  frequency: number;
  amplitude: number;
  sampleCount: number;
  stability?: number;
  rhythmicity?: number;
  timeSeriesData: TimeSeriesDataPoint[];
  averageStatus?: string;
  detectionRate?: number;
  maxConsecutive?: number;
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
  restTremor?: RestTremorResults;
  timedUpAndGo?: TimedUpAndGoResults;
}

interface SessionStore {
  currentSession: ScreeningSession | null;
  startSession: (patientId: string) => void;
  savePosturalTremorResults: (results: PosturalTremorResults) => void;
  saveRestTremorResults: (results: RestTremorResults) => void;
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
  
  saveRestTremorResults: (results: RestTremorResults) => set((state) => ({
    currentSession: state.currentSession ? {
      ...state.currentSession,
      restTremor: results
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