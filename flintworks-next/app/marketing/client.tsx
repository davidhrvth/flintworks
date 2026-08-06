'use client'

import {
  PenTool, Search, Target, Users, Mail, FileText, LineChart, TrendingUp, Megaphone,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmberBadge } from '@/components/ui/EmberBadge'
import { useState } from 'react'
import { MarketingNotifyForm } from '@/components/ui/MarketingNotifyForm'
import { MarketingPricingCard } from '@/components/ui/MarketingPricingCard'
import { CurrencyToggle, type Currency } from '@/components/ui/CurrencyToggle'
import { marketingPricingTiers } from '@/data/pricing'

const marketingSubServices = [
  { id: 'brand-identity', icon: PenTool },
  { id: 'seo', icon: Search },
  { id: 'ppc', icon: Target },
  { id: 'social-media', icon: Users },
  { id: 'email-marketing', icon: Mail },
  { id: 'content-marketing', icon: FileText },
  { id: 'analytics', icon: LineChart },
  { id: 'cro', icon: TrendingUp },
]

export default function MarketingPageContent() {
  const { t } = useTranslation()
  const [currency, setCurrency] = useState<Currency>('EUR')

  return (
    <>
      <section className="pt-32 pb-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-xl bg-ember/10 border border-ember/20">
                <Megaphone size={26} className="text-ember" />
              </div>
              <EmberBadge variant="in-dev">{t('marketing.hero.eyebrow')}</EmberBadge>
            </div>
            <h1 className="font-display font-bold text-5xl lg:text-7xl text-text-heading mb-6 leading-tight">
              {t('marketing.hero.heading')}
            </h1>
            <p className="text-text-body text-xl max-w-2xl leading-relaxed">
              {t('marketing.hero.subheading')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t('marketing.subServicesEyebrow')}
            heading={t('marketing.subServicesHeading')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {marketingSubServices.map((item, i) => {
              const Icon = item.icon
              return (
                <AnimatedSection key={item.id} delay={i * 0.05}>
                  <div className="p-6 rounded-xl bg-surface border border-border hover:border-ember/20 transition-colors duration-200 h-full">
                    <div className="p-2.5 rounded-lg bg-ember/10 border border-ember/20 w-fit mb-4">
                      <Icon size={18} className="text-ember" />
                    </div>
                    <h3 className="font-display font-semibold text-text-heading text-base mb-2 leading-snug">
                      {t(`marketing.subServices.${item.id}.name`)}
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed">
                      {t(`marketing.subServices.${item.id}.description`)}
                    </p>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div
              className="rounded-2xl p-8 lg:p-12 mb-10"
              style={{
                background: 'linear-gradient(135deg, rgba(255,77,0,0.04) 0%, rgba(255,140,66,0.02) 100%)',
                border: '2px dashed rgba(255,77,0,0.22)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember">
                  {t('marketing.pricing.eyebrow')}
                </span>
              </div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-text-heading mb-3">
                {t('marketing.pricing.heading')}
              </h2>
              <p className="text-text-body text-lg max-w-xl leading-relaxed">
                {t('marketing.pricing.subtext')}
              </p>
            </div>
          </AnimatedSection>

          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <CurrencyToggle currency={currency} onChange={setCurrency} />
            <p className="text-text-muted text-xs">{t('pricing.currencyNote')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marketingPricingTiers.map((tierId, i) => (
              <AnimatedSection key={tierId} delay={i * 0.1}>
                <MarketingPricingCard tierId={tierId} currency={currency} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div
              className="relative overflow-hidden rounded-2xl text-center py-20 px-8"
              style={{ background: 'linear-gradient(135deg, rgba(255,77,0,0.12) 0%, rgba(255,140,66,0.06) 100%)' }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
                style={{ background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(255,77,0,0.1) 0%, transparent 70%)' }}
              />
              <div className="relative z-10">
                <h2 className="font-display font-bold text-4xl lg:text-5xl text-text-heading mb-4">
                  {t('marketing.bottomCta.heading')}
                </h2>
                <p className="text-text-body text-lg max-w-xl mx-auto mb-10">
                  {t('marketing.bottomCta.body')}
                </p>
                <MarketingNotifyForm layout="inline" className="max-w-sm mx-auto" />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
