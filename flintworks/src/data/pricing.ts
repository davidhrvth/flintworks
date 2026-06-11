export interface PricingTier {
  id: string
  popular?: boolean
  custom?: boolean
}

export const webPricingTiers: PricingTier[] = [
  { id: 'starter' },
  { id: 'growth', popular: true },
  { id: 'scale', custom: true },
]

export const mobilePricingTiers: PricingTier[] = [
  { id: 'mobile-mvp' },
  { id: 'custom-mobile', custom: true },
]
