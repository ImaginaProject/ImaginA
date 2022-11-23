import type { AvailableLocale, LocaleType } from './types'
import localeSet from './locale'

let currentLocale: AvailableLocale = 'es'
let localeData: LocaleType = localeSet.es

// eslint-disable-next-line import/prefer-default-export
export const i18nProvider = {
  // required
  translate: (key: keyof LocaleType, options: any) => {
    let words: string = localeData[key] || options.default || localeSet.es[key] || '???'
    if (options?.start) {
      words = words.charAt(0).toUpperCase() + words.substring(1)
    }
    if (options?.end) {
      words += '.'
    }
    return words
  },
  changeLocale: async (_locale: string) => {
    const locale = _locale as AvailableLocale
    currentLocale = locale
    localeData = localeSet[currentLocale]
    console.info('change locale to', locale)
  },
  getLocale: () => currentLocale.toString(),
  // optional
  getLocales: () => [
    { locale: 'es', name: 'Español' },
    { locale: 'en', name: 'English' },
  ],
}
