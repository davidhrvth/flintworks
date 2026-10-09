import type { Metadata } from 'next'
import AboutPageContent from './client'

export const metadata: Metadata = {
  title: 'About — Budapest Software Agency',
  description:
    'Flintworks is a Budapest-based software development agency built on craft, transparency, and delivering software that actually works — on time, on budget, built to last.',
  openGraph: {
    title: 'About — Flintworks',
    description: 'Senior-level software agency from Budapest. Built different.',
    url: 'https://flintworks.hu/about',
    type: 'website',
  },
}

export default AboutPageContent
