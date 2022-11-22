import type { LocaleSetType, LocaleType } from './types'
import localeSet from './locale'

let currentLocale: keyof LocaleSetType = 'es'
let localeData: LocaleType = localeSet.es

// eslint-disable-next-line import/prefer-default-export
export const i18nProvider = {
  // required
  translate: (key: keyof LocaleType, options: any) => {
    let words: string = localeData[key] || options.default || '???'
    if (options?.start) {
      words = words.charAt(0).toUpperCase() + words.substring(1)
    }
    if (options?.end) {
      words += '.'
    }
    return words
  },
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
