import { create } from "zustand";

// --- Types ---
export type Question5Data = {
  shown: number[];        // which positions were displayed
  selected: number[];     // which positions user tapped
  correctCount: number;   // scoring
};

export type Question1Data = {
  entered: string;
  correctDate: string;
  isCorrect: boolean;
};

export type QuizAnswers = {
  wordList: string[];
  Question1: Question1Data | null;
  Question2: string[] | null;
  Question3: string | null;
  Question4: string | null;
  Question5: Question5Data;
  reverseRecall?: string | null;
};

type Store = {
  answers: QuizAnswers;
  setAnswer: <K extends keyof QuizAnswers>(
    key: K,
    value: QuizAnswers[K]
  ) => void;
  resetQuiz: () => void;
};


const defaultState: QuizAnswers = {
  wordList: [],
  Question1: null,
  Question2: [],
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
