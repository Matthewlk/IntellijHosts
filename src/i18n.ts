import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationEN from './locales/en.json';
import translationZH from './locales/zh.json';
import translationDE from './locales/de.json';
import translationFR from './locales/fr.json';

const resources = {
  en: { translation: translationEN },
  zh: { translation: translationZH },
  de: { translation: translationDE },
  fr: { translation: translationFR },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator', 'localStorage'],
      caches: ['localStorage'],
    },
  });

export default i18n;