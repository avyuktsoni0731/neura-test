import { create } from "zustand";

// --- Types ---
export type Question5Data = {
  shown: number[];        // which positions were displayed
  selected: number[];     // which positions user tapped
  correctCount: number;   // scoring
};

export type QuizAnswers = {
  wordList: string[];         // used in Q1
  Question1: string | null;
  Question2: string | null;
  Question3: string | null;
  Question4: string | null;
  Question5: Question5Data;   // complex object
};

// --- Store type ---
type Store = {
  answers: QuizAnswers;
  setAnswer: <K extends keyof QuizAnswers>(
    key: K,
    value: QuizAnswers[K]
  ) => void;
  resetQuiz: () => void;
};

// --- Default values ---
const defaultState: QuizAnswers = {
  wordList: [],
  Question1: null,
  Question2: null,
  Question3: null,
  Question4: null,
  Question5: {
    shown: [],
    selected: [],
    correctCount: 0,
  },
};


export const useQuizStore = create<Store>((set) => ({
  answers: defaultState,

  setAnswer: (key, value) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [key]: value,
      },
    })),

  resetQuiz: () =>
    set({
      answers: { ...defaultState },
    }),
}));

/*
import { create } from 'zustand';

export interface QuizStore {
  answers: Record<string, string>; 
  setAnswer: (question: string, answer: string) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizStore>((set) => ({
  answers: {},
  setAnswer: (questionKey, value) => set((state) => ({
    answers: { ...state.answers, [questionKey]: value }
  })),
  resetQuiz: () => set({ answers: {} }),
}));
*/
/*
import { create } from "zustand";

export typee Question5Data = {
  shown: number[];
  selected: number[];
  correctCount: number;
};

export type QuizAnswers = {
  wordList?: string[];     
  Question1?: string;
  Question2?: string;
  Question3?: string;
  Question4?: string;
  Question5?: Question5Data;   
};

type Store = {
  answers: QuizAnswers;
  setAnswer: (key: keyof QuizAnswers, value: string | string[]) => void;
  resetQuiz: () => void;
};

export const useQuizStore = create<Store>((set) => ({
  answers: {},
  setAnswer: (key, value) =>
    set((state) => ({
      answers: { ...state.answers, [key]: value },
    })),
  resetQuiz: () => set({ answers: {}, }),
}));
*/