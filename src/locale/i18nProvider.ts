import type { LocaleSetType, LocaleType } from './types'
import localeSet from './locale'

let currentLocale: keyof LocaleSetType = 'es'
let localeData: LocaleType = localeSet.es

// eslint-disable-next-line import/prefer-default-export
export const i18nProvider = {
  // required
  translate: (key: keyof LocaleType, options: any) => (
    localeData[key] || options.default || '???'
  ),
  changeLocale: async (locale: keyof LocaleSetType) => {
    console.info('cahnge locale to', locale)
    currentLocale = locale
    localeData = localeSet[currentLocale]
  },
  getLocale: () => currentLocale.toString(),
  // optional
  getLocales: () => [
    { locale: 'es', name: 'Español' },
    { locale: 'en', name: 'English' },
  ],
}
