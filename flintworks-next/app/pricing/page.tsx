import type { Metadata } from 'next'
import PricingPageContent from './client'

export const metadata: Metadata = {
  title: 'Pricing — Transparent Software Development Rates',
  description:
    'Simple, transparent pricing for web apps, business websites, mobile apps, and startup development. Fixed packages with no surprises. Based in Budapest.',
  openGraph: {
    title: 'Pricing — Flintworks',
    description: 'Fixed packages for web, mobile, and startup development. No hidden fees.',
    url: 'https://flintworks.io/pricing',
    type: 'website',
  },
}

export default PricingPageContent
