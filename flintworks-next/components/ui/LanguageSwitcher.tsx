'use client'

import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language.startsWith('hu') ? 'hu' : 'en'

  const setLanguage = (lang: 'en' | 'hu') => {
    i18n.changeLanguage(lang)
  }

  return (
    <div
      className="inline-flex items-center rounded-full border border-border bg-surface p-0.5 text-xs font-mono font-semibold tracking-wider"
      role="group"
      aria-label="Language"
    >
      {(['en', 'hu'] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          className={`px-2.5 py-1 rounded-full uppercase transition-colors duration-150 ${
            current === lang
              ? 'bg-ember text-white'
              : 'text-text-muted hover:text-text-heading'
          }`}
          aria-pressed={current === lang}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}
