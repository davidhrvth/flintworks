import type { Metadata } from 'next'
import WorkPageContent from './client'

export const metadata: Metadata = {
  title: 'Work — Portfolio & Case Studies',
  description:
    'Case studies and portfolio from Flintworks — web apps, mobile apps, business websites, and startup MVPs built for clients across Hungary and internationally.',
  openGraph: {
    title: 'Work — Flintworks',
    description: 'Products, platforms, and websites we\'ve built. See our portfolio.',
    url: 'https://flintworks.io/work',
    type: 'website',
  },
}

export default WorkPageContent
