import type { ContactTopicId } from './contact'

export interface PricingTier {
  id: string
  /** Topic picked on the contact form when the card's CTA is followed */
  contactTopic: ContactTopicId
  /** No public price — the card shows a custom-quote block and a contact CTA */
  quoteOnly?: boolean
}

export const buildPricingTiers: PricingTier[] = [
  { id: 'website', contactTopic: 'business-website' },
  { id: 'web-app', contactTopic: 'web-app', quoteOnly: true },
  { id: 'mobile-app', contactTopic: 'mobile-app', quoteOnly: true },
]

export const discoveryTierId = 'discovery'

export const marketingPricingTiers = ['starter', 'growth', 'full-service'] as const

export type MarketingPricingTierId = (typeof marketingPricingTiers)[number]
