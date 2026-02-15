import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bg from './bg.json';
import en from './en.json';

const LANGUAGE_KEY = '@kintales/language';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLang) {
        callback(savedLang);
        return;
      }

      const locale = Localization.getLocales()[0]?.languageCode;
      const lang = locale === 'bg' ? 'bg' : 'en';
      callback(lang);
    } catch {
      callback('bg');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lang) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      bg: { translation: bg },
      en: { translation: en },
    },
    fallbackLng: 'bg',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
