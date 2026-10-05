export interface PricingTier {
  id: string
  /** No public price — the card shows a custom-quote block and a contact CTA */
  quoteOnly?: boolean
}

export const buildPricingTiers: PricingTier[] = [
  { id: 'website' },
  { id: 'web-app', quoteOnly: true },
  { id: 'mobile-app', quoteOnly: true },
]

export const discoveryTierId = 'discovery'

export const marketingPricingTiers = ['starter', 'growth', 'full-service'] as const

export type MarketingPricingTierId = (typeof marketingPricingTiers)[number]
