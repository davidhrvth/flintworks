import { Monitor, Globe, Smartphone, Rocket, BarChart2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Service {
  id: string
  icon: LucideIcon
  comingSoon?: boolean
}

export const services: Service[] = [
  { id: 'web-apps', icon: Monitor },
  { id: 'business-websites', icon: Globe },
  { id: 'mobile-apps', icon: Smartphone },
  { id: 'startup-development', icon: Rocket },
  { id: 'marketing', icon: BarChart2, comingSoon: true },
]
