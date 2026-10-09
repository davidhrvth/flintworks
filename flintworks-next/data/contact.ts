import { Globe, Monitor, Smartphone, Rocket, Compass, MessageCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** What a visitor can pick on the contact form. Sent to the backend as `service`. */
export const contactTopicIds = [
  'business-website',
  'web-app',
  'mobile-app',
  'startup',
  'discovery',
  'other',
] as const

export type ContactTopicId = (typeof contactTopicIds)[number]

export interface ContactTopic {
  id: ContactTopicId
  icon: LucideIcon
}

export const contactTopics: ContactTopic[] = [
  { id: 'business-website', icon: Globe },
  { id: 'web-app', icon: Monitor },
  { id: 'mobile-app', icon: Smartphone },
  { id: 'startup', icon: Rocket },
  { id: 'discovery', icon: Compass },
  { id: 'other', icon: MessageCircle },
]

export function isContactTopicId(value: unknown): value is ContactTopicId {
  return contactTopicIds.includes(value as ContactTopicId)
}

/** Link to the contact form, optionally with a topic already picked. */
export function contactHref(topic?: ContactTopicId): string {
  return topic ? `/contact?service=${topic}` : '/contact'
}
