import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import hu from './locales/hu/translation.json'

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
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })
}

export default i18n
