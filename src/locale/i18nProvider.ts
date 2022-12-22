import { resolveBrowserLocale } from 'react-admin'
// eslint-disable-next-line import/no-extraneous-dependencies
import polyglotI18nProvider from 'ra-i18n-polyglot'
// eslint-disable-next-line import/no-extraneous-dependencies
import en from 'ra-language-english'
// import fr from 'ra-language-french'
import customES from './custom-ra-es'
import localeSet from './locale'

const translations = {
  en: {
    ...en,
    ...localeSet.en,
  },
  es: {
    ...customES,
    ...localeSet.es,
  },
}

// eslint-disable-next-line import/prefer-default-export
export const i18nProvider = polyglotI18nProvider(
  // @ts-expect-error
  (locale) => (translations[locale] ? translations[locale] : translations.en),
  resolveBrowserLocale('es'),
  [
    { locale: 'en', name: 'English' },
    { locale: 'es', name: 'Español' },
  ],
)
