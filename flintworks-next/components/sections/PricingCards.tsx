'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatedSection } from '../ui/AnimatedSection'
import type { PricingTier } from '@/data/pricing'
import type { Currency } from '../ui/CurrencyToggle'

interface PricingCardsProps {
  tiers: PricingTier[]
  currency: Currency
}

export function PricingCards({ tiers, currency }: PricingCardsProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tiers.map((tier, i) => {
        const base = `pricing.tiers.${tier.id}`
        const features = t(`${base}.features`, { returnObjects: true }) as string[]
        const price = t(currency === 'HUF' ? `${base}.priceHUF` : `${base}.price`)

        return (
          <AnimatedSection key={tier.id} delay={i * 0.1}>
            <div className="relative flex flex-col h-full rounded-xl border border-border glass hover:border-ember/20 p-8 transition-all duration-300">
              <div className="mb-6">
                <h3 className="font-display font-bold text-2xl text-text-heading mb-1">{t(`${base}.name`)}</h3>
                <p className="text-text-muted text-sm">{t(`${base}.description`)}</p>
              </div>

              <div className="mb-6">
                <p className="font-mono text-xs text-text-muted mb-1 tracking-wider">
                  {tier.quoteOnly ? t('pricing.quoteOnly.label') : t('pricing.startingAt')}
                </p>
                {tier.quoteOnly ? (
                  <>
                    <p className="font-display font-bold text-3xl text-text-heading">
                      {t('pricing.quoteOnly.heading')}
                    </p>
                    <p className="mt-2 text-text-muted text-sm">{t('pricing.quoteOnly.body')}</p>
                  </>
                ) : (
                  <p className="font-display font-bold text-4xl text-text-heading">{price}</p>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {Array.isArray(features) && features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check size={14} className="text-ember mt-0.5 shrink-0" />
                    <span className="text-text-body text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className={`block w-full text-center py-3 rounded-lg font-semibold text-sm transition-all duration-150 ${
                  tier.quoteOnly
                    ? 'border border-ember text-ember hover:bg-ember hover:text-white'
                    : 'bg-ember text-white hover:bg-flame'
                }`}
              >
                {t(`${base}.cta`)}
              </Link>
            </div>
          </AnimatedSection>
        )
      })}
    </div>
  )
}
