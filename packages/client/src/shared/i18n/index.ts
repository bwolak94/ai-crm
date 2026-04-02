import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import enContacts from './locales/en/contacts.json';
import plCommon from './locales/pl/common.json';
import plContacts from './locales/pl/contacts.json';

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('ai-crm-lang') : null;

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      contacts: enContacts,
    },
    pl: {
      common: plCommon,
      contacts: plContacts,
    },
  },
  lng: savedLang || 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
