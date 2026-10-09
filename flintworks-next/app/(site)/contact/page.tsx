import type { Metadata } from 'next'
import ContactPageContent from './client'

export const metadata: Metadata = {
  title: 'Contact — Start Your Project',
  description:
    'Start a project with Flintworks. Tell us what you\'re building and we\'ll get back to you within 24 hours. Based in Budapest, working internationally.',
  openGraph: {
    title: 'Contact — Flintworks',
    description: 'Start a project. We\'ll respond within 24 hours.',
    url: 'https://flintworks.hu/contact',
    type: 'website',
  },
}

export default ContactPageContent
