import { Monitor, Globe, Smartphone, Rocket, BarChart2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ContactTopicId } from './contact'

export interface Service {
  id: string
  icon: LucideIcon
  /** Topic picked on the contact form when the service's CTA is followed */
  contactTopic?: ContactTopicId
  comingSoon?: boolean
}

export const services: Service[] = [
  { id: 'web-apps', icon: Monitor, contactTopic: 'web-app' },
  { id: 'business-websites', icon: Globe, contactTopic: 'business-website' },
  { id: 'mobile-apps', icon: Smartphone, contactTopic: 'mobile-app' },
  { id: 'startup-development', icon: Rocket, contactTopic: 'startup' },
  { id: 'marketing', icon: BarChart2, comingSoon: true },
]
