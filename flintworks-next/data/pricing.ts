export interface PricingTier {
  id: string
  popular?: boolean
  custom?: boolean
}

export const webPricingTiers: PricingTier[] = [
  { id: 'refresh' },
  { id: 'landing' },
  { id: 'starter' },
  { id: 'growth', popular: true },
  { id: 'scale', custom: true },
  { id: 'discovery' },
]

export const mobilePricingTiers: PricingTier[] = [
  { id: 'mobile-mvp' },
  { id: 'custom-mobile', custom: true },
]

export const marketingPricingTiers = ['starter', 'growth', 'full-service'] as const

export type MarketingPricingTierId = (typeof marketingPricingTiers)[number]
