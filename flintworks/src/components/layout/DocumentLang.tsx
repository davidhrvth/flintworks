import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

export function DocumentLang() {
  const { i18n } = useTranslation()
  const lang = i18n.language.startsWith('hu') ? 'hu' : 'en'

  return <Helmet htmlAttributes={{ lang }} />
}
