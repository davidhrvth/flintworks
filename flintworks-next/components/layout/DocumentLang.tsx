'use client'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function DocumentLang() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const lang = i18n.language.startsWith('hu') ? 'hu' : 'en'
    document.documentElement.lang = lang
  }, [i18n.language])

  return null
}
