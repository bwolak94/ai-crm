import 'react-i18next';
import enCommon from './locales/en/common.json';
import enContacts from './locales/en/contacts.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof enCommon;
      contacts: typeof enContacts;
    };
  }
}
