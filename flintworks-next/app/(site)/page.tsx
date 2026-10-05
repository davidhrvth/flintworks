import type { Metadata } from 'next'
import HomePageContent from './client'

export const metadata: Metadata = {
  title: 'Flintworks — Software Agency Budapest',
  description:
    'Budapest-based software agency forging web apps, mobile products, and digital platforms for businesses that mean business — in Hungary and beyond.',
  openGraph: {
    title: 'Flintworks — The Spark for Your Business',
    description: 'The spark for your business. We build what others can\'t.',
    url: 'https://flintworks.io',
    siteName: 'Flintworks',
    locale: 'en_US',
    alternateLocale: 'hu_HU',
    type: 'website',
  },
  alternates: {
    languages: {
      en: 'https://flintworks.io',
      hu: 'https://flintworks.io',
    },
  },
}

export default HomePageContent
