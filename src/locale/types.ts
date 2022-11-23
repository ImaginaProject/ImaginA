export type AvailableLocale = 'en' | 'es' | 'fr'

export type LocaleType = {
  [key: string]: string,
}

export type LocaleSetType = {
  // eslint-disable-next-line no-unused-vars
  [key in AvailableLocale]: LocaleType;
}
