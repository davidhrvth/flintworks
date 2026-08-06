'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmberBadge } from './EmberBadge'
import { MarketingNotifyForm } from './MarketingNotifyForm'
import type { Currency } from './CurrencyToggle'

interface MarketingPricingCardProps {
  tierId: string
  currency?: Currency
}

function resolvePrice(
  t: (key: string, opts?: { defaultValue?: string }) => string,
  key: string,
): string {
  const value = t(key, { defaultValue: '' }).trim()
  if (!value || value === key) return ''
  return value
}

function parseAmount(display: string): number | null {
  const digits = display.replace(/[^\d]/g, '')
  if (!digits) return null
  const n = Number(digits)
  return Number.isFinite(n) && n > 0 ? n : null
}

function isNumericDiscount(listPrice: string, price: string): boolean {
  const list = parseAmount(listPrice)
  const sale = parseAmount(price)
  if (list != null && sale != null) return sale < list
  return Boolean(listPrice && price && listPrice !== price)
}

export function MarketingPricingCard({ tierId, currency = 'EUR' }: MarketingPricingCardProps) {
  const { t } = useTranslation()
  const [notifying, setNotifying] = useState(false)

  const priceKey = currency === 'HUF'
    ? `marketing.pricing.tiers.${tierId}.priceHUF`
    : `marketing.pricing.tiers.${tierId}.price`
  const listKey = currency === 'HUF'
    ? `marketing.pricing.tiers.${tierId}.listPriceHUF`
    : `marketing.pricing.tiers.${tierId}.listPrice`
  const price = resolvePrice(t, priceKey)
  const listPrice = resolvePrice(t, listKey)
  const showDiscount = isNumericDiscount(listPrice, price)

  return (
    <div className="relative flex flex-col h-full rounded-xl border border-border glass p-8">
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
        <EmberBadge variant="in-dev">
          {t('marketing.pricing.comingSoonLabel')}
        </EmberBadge>
      </div>

      <div className="mb-6 mt-2">
        <h3 className="font-display font-bold text-2xl text-text-heading mb-1">
          {t(`marketing.pricing.tiers.${tierId}.name`)}
        </h3>
        <p className="text-text-muted text-sm">
          {t('marketing.pricing.bestFor')}: {t(`marketing.pricing.tiers.${tierId}.bestFor`)}
        </p>
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
            <div className="mt-2">
              <EmberBadge variant="surface">{t('pricing.earlyClient')}</EmberBadge>
            </div>
          </>
        )}
        {!showDiscount && (
          <p className="font-mono text-xs text-ember/70 mt-1 uppercase tracking-wider">
            {t('marketing.pricing.comingSoonLabel')}
          </p>
        )}
      </div>

      <div className="flex-1 mb-8">
        <p className="font-mono text-xs font-semibold tracking-[0.15em] uppercase text-text-muted mb-2">
          {t('marketing.pricing.includes')}
        </p>
        <p className="text-text-body text-sm leading-relaxed">
          {t(`marketing.pricing.tiers.${tierId}.includes`)}
        </p>
      </div>

      {notifying ? (
        <MarketingNotifyForm layout="stacked" />
      ) : (
        <button
          onClick={() => setNotifying(true)}
          className="block w-full text-center py-3 rounded-lg font-semibold text-sm border border-ember text-ember hover:bg-ember hover:text-white transition-all duration-150"
        >
          {t('marketing.pricing.getNotified')}
        </button>
      )}
    </div>
  )
}
