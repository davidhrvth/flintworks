'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmberBadge } from './EmberBadge'
import { MarketingNotifyForm } from './MarketingNotifyForm'

interface MarketingPricingCardProps {
  tierId: string
}

export function MarketingPricingCard({ tierId }: MarketingPricingCardProps) {
  const { t } = useTranslation()
  const [notifying, setNotifying] = useState(false)

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
        <p className="font-display font-bold text-3xl text-text-heading">
          {t('marketing.pricing.comingSoonLabel')}
        </p>
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
