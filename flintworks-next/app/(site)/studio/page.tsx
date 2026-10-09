import type { Metadata } from 'next'
import StudioPageContent from './client'

export const metadata: Metadata = {
  title: 'Studio — In-House Products by Flintworks',
  description:
    'The Flintworks Studio — our in-house product arm building apps and tools we actually want to use. See what we\'re building.',
  openGraph: {
    title: 'Studio — Flintworks',
    description: 'We don\'t just build for clients — we build our own products too.',
    url: 'https://flintworks.hu/studio',
    type: 'website',
  },
}

export default StudioPageContent
