import type { Metadata } from 'next'
import ServicesPageContent from './client'

export const metadata: Metadata = {
  title: 'Services — Web Apps, Mobile Apps & More',
  description:
    'Web apps, business websites, mobile apps, and startup development. See everything Flintworks builds — full-stack software from Budapest.',
  openGraph: {
    title: 'Services — Flintworks',
    description: 'From MVPs to production-scale platforms. Web apps, mobile, websites, and startup development.',
    url: 'https://flintworks.io/services',
    type: 'website',
  },
}

export default ServicesPageContent
