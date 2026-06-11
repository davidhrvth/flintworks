import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ENABLE_MARKETING } from '@/config/features'
import MarketingPageContent from './client'

export const metadata: Metadata = {
  title: 'Marketing & Growth Services',
  description:
    'Brand identity, SEO, paid advertising, social media management, and more — the Flintworks Marketing department is coming soon.',
  openGraph: {
    title: 'Marketing — Flintworks',
    description: 'Full-service marketing coming to Flintworks. Brand identity, SEO, paid ads, and more.',
    url: 'https://flintworks.io/marketing',
    type: 'website',
  },
}

export default function MarketingPage() {
  if (!ENABLE_MARKETING) redirect('/')
  return <MarketingPageContent />
}
