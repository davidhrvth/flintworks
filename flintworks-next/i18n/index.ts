import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import hu from './locales/hu/translation.json'

export const LANG_CHOICE_KEY = 'fw_lang_choice'

if (!i18n.isInitialized) {
  const instance = i18n.use(initReactI18next)

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LanguageDetector = require('i18next-browser-languagedetector').default
    instance.use(LanguageDetector)
  }

  instance.init({
    resources: {
      en: { translation: en },
      hu: { translation: hu },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hu'],
    interpolation: { escapeValue: false },
    // Default language comes from the visitor's IP: nginx sets `fw_geo=HU`
    // for Hungarian IPs (see deploy/nginx/geo-hu.conf). Anything else -> English.
    // Only an explicit pick in the language switcher (stored under
    // `fw_lang_choice`) overrides it; auto-detected values are never cached.
    detection: {
      order: ['localStorage', 'cookie'],
      lookupLocalStorage: LANG_CHOICE_KEY,
      lookupCookie: 'fw_geo',
      caches: [],
      convertDetectedLanguage: (lng: string) =>
        lng.toLowerCase() === 'hu' ? 'hu' : 'en',
    },
  })
}

export default i18n
