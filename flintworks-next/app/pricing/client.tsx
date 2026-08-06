'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Info, Megaphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { PricingCards } from '@/components/sections/PricingCards'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { GlowCard } from '@/components/ui/GlowCard'
import { MarketingPricingCard } from '@/components/ui/MarketingPricingCard'
import { ENABLE_MARKETING } from '@/config/features'
import { CurrencyToggle, type Currency } from '@/components/ui/CurrencyToggle'
import { webPricingTiers, mobilePricingTiers, marketingPricingTiers } from '@/data/pricing'

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="font-display font-semibold text-text-heading group-hover:text-ember transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-text-muted"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-text-body leading-relaxed pb-5">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PricingPageContent() {
  const { t } = useTranslation()
  const [currency, setCurrency] = useState<Currency>('EUR')
  const faqItems = t('pricing.faqItems', { returnObjects: true }) as Array<{ question: string; answer: string }>

  return (
    <>
      <section className="pt-32 pb-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember mb-4 block">
              {t('pricing.eyebrow')}
            </span>
            <h1 className="font-display font-bold text-5xl lg:text-7xl text-text-heading mb-6 leading-tight">
              {t('pricing.hero.heading')}
            </h1>
            <p className="text-text-body text-xl max-w-2xl mx-auto leading-relaxed">
              {t('pricing.hero.subheading')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <CurrencyToggle currency={currency} onChange={setCurrency} />
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Info size={12} className="text-ember shrink-0" />
            <span>{t('pricing.currencyNote')}</span>
          </div>
        </div>
        <p className="text-text-muted text-sm max-w-3xl leading-relaxed">
          {t('pricing.earlyPackagingNote')}
        </p>
      </div>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t('pricing.web.eyebrow')}
            heading={t('pricing.web.heading')}
            subtext={t('pricing.web.subtext')}
            align="center"
          />
          <PricingCards tiers={webPricingTiers} currency={currency} />
        </div>
      </section>

      <section className="py-20 lg:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t('pricing.mobile.eyebrow')}
            heading={t('pricing.mobile.heading')}
            subtext={t('pricing.mobile.subtext')}
            align="center"
          />
          <div className="max-w-3xl mx-auto">
            <PricingCards tiers={mobilePricingTiers} currency={currency} />
          </div>
        </div>
      </section>

      {ENABLE_MARKETING && (
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
                  <div className="p-2.5 rounded-lg bg-ember/10 border border-ember/20">
                    <Megaphone size={20} className="text-ember" />
                  </div>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketingPricingTiers.map((tierId, i) => (
                <AnimatedSection key={tierId} delay={i * 0.1}>
                  <MarketingPricingCard tierId={tierId} currency={currency} />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <GlowCard className="p-10 lg:p-14 text-center">
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-text-heading mb-4">
                {t('pricing.custom.heading')}
              </h2>
              <p className="text-text-body text-lg max-w-xl mx-auto mb-8">{t('pricing.custom.body')}</p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-ember text-white font-semibold hover:bg-flame transition-colors group"
              >
                {t('pricing.custom.cta')}
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </GlowCard>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t('pricing.faq.eyebrow')}
            heading={t('pricing.faq.heading')}
            align="center"
          />
          <AnimatedSection>
            {Array.isArray(faqItems) && faqItems.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
