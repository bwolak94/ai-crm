import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import enContacts from './locales/en/contacts.json';
import enPipeline from './locales/en/pipeline.json';
import enAi from './locales/en/ai.json';
import enChat from './locales/en/chat.json';
import enAnalytics from './locales/en/analytics.json';
import enActivities from './locales/en/activities.json';
import enSettings from './locales/en/settings.json';
import plCommon from './locales/pl/common.json';
import plContacts from './locales/pl/contacts.json';
import plPipeline from './locales/pl/pipeline.json';
import plAi from './locales/pl/ai.json';
import plChat from './locales/pl/chat.json';
import plAnalytics from './locales/pl/analytics.json';
import plActivities from './locales/pl/activities.json';
import plSettings from './locales/pl/settings.json';

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('ai-crm-lang') : null;

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      contacts: enContacts,
      pipeline: enPipeline,
      ai: enAi,
      chat: enChat,
      analytics: enAnalytics,
      activities: enActivities,
      settings: enSettings,
    },
    pl: {
      common: plCommon,
      contacts: plContacts,
      pipeline: plPipeline,
      ai: plAi,
      chat: plChat,
      analytics: plAnalytics,
      activities: plActivities,
      settings: plSettings,
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
