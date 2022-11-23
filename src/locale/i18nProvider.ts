import type { AvailableLocale, LocaleType } from './types'
import localeSet from './locale'

type OptionsType = {
  exclamation?: boolean,
  question?: boolean,
  start?: boolean,
  end?: boolean,
  default?: string,
}

let currentLocale: AvailableLocale = 'es'
let localeData: LocaleType = localeSet.es

// eslint-disable-next-line import/prefer-default-export
export const i18nProvider = {
  // required
  translate: (key: keyof LocaleType, options?: OptionsType) => {
    let words: string = localeData[key] || options?.default || localeSet.es[key] || '???'
    if (options?.start) {
      words = words.charAt(0).toUpperCase() + words.substring(1)
    }
    if (options?.end) {
      words += '.'
    }
    if (options?.exclamation) {
      if (currentLocale === 'es') {
        words = `¡${words}`
      }
      words = `${words}!`
    }
    if (options?.question) {
      if (currentLocale === 'es') {
        words = `¿${words}`
      }
      words = `${words}?`
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
