import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import ml from './locales/ml.json';

const LANGUAGE_STORAGE_KEY = '@app_language';

// Language resources
const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
  ml: { translation: ml },
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

// Function to change language and persist it
export const changeLanguage = async (languageCode: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    await i18n.changeLanguage(languageCode);
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

// Function to load saved language preference
export const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && resources[savedLanguage as keyof typeof resources]) {
      await i18n.changeLanguage(savedLanguage);
      return savedLanguage;
    }
  } catch (error) {
    console.error('Failed to load saved language:', error);
  }
  return 'en'; // default to English
};

export default i18n;

