'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatedSection } from '../ui/AnimatedSection'
import { EmberBadge } from '../ui/EmberBadge'
import type { PricingTier } from '@/data/pricing'
import type { Currency } from '../ui/CurrencyToggle'

interface PricingCardsProps {
  tiers: PricingTier[]
  currency: Currency
}

function resolvePrice(
  t: (key: string, opts?: { defaultValue?: string }) => string,
  key: string,
): string {
  const value = t(key, { defaultValue: '' }).trim()
  if (!value || value === key) return ''
  return value
}

/** Extract leading numeric amount from display strings like "€3,900" or "1 500 000 Ft". */
function parseAmount(display: string): number | null {
  const digits = display.replace(/[^\d]/g, '')
  if (!digits) return null
  const n = Number(digits)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** True when off ≈ Phase-1 Starter band (~80%), so we can show savePercent honestly. */
function roughlyEightyPercentOff(listPrice: string, price: string): boolean {
  const list = parseAmount(listPrice)
  const sale = parseAmount(price)
  if (!list || !sale || sale >= list) return false
  const off = 1 - sale / list
  return off >= 0.72 && off <= 0.85
}

function isNumericDiscount(listPrice: string, price: string): boolean {
  const list = parseAmount(listPrice)
  const sale = parseAmount(price)
  if (list != null && sale != null) return sale < list
  return Boolean(listPrice && price && listPrice !== price)
}

export function PricingCards({ tiers, currency }: PricingCardsProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tiers.map((tier, i) => {
        const name = t(`pricing.tiers.${tier.id}.name`)
        const description = t(`pricing.tiers.${tier.id}.description`)
        const priceKey = currency === 'HUF'
          ? `pricing.tiers.${tier.id}.priceHUF`
          : `pricing.tiers.${tier.id}.price`
        const listKey = currency === 'HUF'
          ? `pricing.tiers.${tier.id}.listPriceHUF`
          : `pricing.tiers.${tier.id}.listPrice`
        const price = resolvePrice(t, priceKey)
        const listPrice = resolvePrice(t, listKey)
        const showDiscount = isNumericDiscount(listPrice, price)
        const showSavePercent = showDiscount && roughlyEightyPercentOff(listPrice, price)
        const features = t(`pricing.tiers.${tier.id}.features`, { returnObjects: true }) as string[]
        const cta = t(`pricing.tiers.${tier.id}.cta`)

        return (
          <AnimatedSection key={tier.id} delay={i * 0.1}>
            <div
              className={`relative flex flex-col h-full rounded-xl border p-8 transition-all duration-300 ${
                tier.popular
                  ? 'border-ember/40 bg-ember/5 ember-glow'
                  : 'border-border glass hover:border-ember/20'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <EmberBadge variant="ember">{t('pricing.mostPopular')}</EmberBadge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display font-bold text-2xl text-text-heading mb-1">{name}</h3>
                <p className="text-text-muted text-sm">{description}</p>
              </div>

              <div className="mb-6">
                <p className="font-mono text-xs text-text-muted mb-1 tracking-wider">
                  {t('pricing.startingAt')}
                </p>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {showDiscount && (
                    <span
                      className="font-display text-lg text-text-muted/80 line-through decoration-text-muted"
                      aria-hidden="true"
                    >
                      {listPrice}
                    </span>
                  )}
                  <span className="font-display font-bold text-4xl text-text-heading">
                    {price || '—'}
                  </span>
                </div>
                {showDiscount && (
                  <>
                    <span className="sr-only">
                      {t('pricing.listPriceA11y', { listPrice, price })}
                    </span>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <EmberBadge variant="surface">{t('pricing.earlyClient')}</EmberBadge>
                      {showSavePercent && (
                        <span className="font-mono text-xs font-medium text-ember tracking-wide">
                          {t('pricing.savePercent')}
                        </span>
                      )}
                    </div>
                  </>
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
                  tier.popular
                    ? 'bg-ember text-white hover:bg-flame'
                    : tier.custom
                    ? 'border border-ember text-ember hover:bg-ember hover:text-white'
                    : 'border border-border text-text-heading hover:border-ember/40 hover:bg-ember/5'
                }`}
              >
                {cta}
              </Link>
            </div>
          </AnimatedSection>
        )
      })}
    </div>
  )
}
