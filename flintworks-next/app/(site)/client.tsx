'use client'

import type { ComponentType } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Clock, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { HeroSection } from '@/components/sections/HeroSection'
import { ServicesGrid } from '@/components/sections/ServicesGrid'
import { PortfolioGrid } from '@/components/sections/PortfolioGrid'
import { StressMesh } from '@/components/sections/StressMesh'
import { DeliveryTracker } from '@/components/sections/DeliveryTracker'
import { GrowthCurve } from '@/components/sections/GrowthCurve'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { GradientText } from '@/components/ui/GradientText'
import { EmberBadge } from '@/components/ui/EmberBadge'
import { MarketingNotifyForm } from '@/components/ui/MarketingNotifyForm'
import { ENABLE_MARKETING } from '@/config/features'

const ticker = [
  'Next.js', 'React', 'React Native', 'Node.js', 'TypeScript', 'Tailwind',
  'Supabase', 'Stripe', 'iOS', 'Android', 'Web Apps', 'Platforms', 'Startups',
]

const valuePropIcons = [Zap, Clock, TrendingUp]
const valuePropNums = ['01', '02', '03'] as const
const valuePropVisuals: Record<(typeof valuePropNums)[number], ComponentType> = {
  '01': StressMesh,
  '02': DeliveryTracker,
  '03': GrowthCurve,
}

export default function HomePageContent() {
  const { t } = useTranslation()

  return (
    <>
      <HeroSection />

      {/* Marquee ticker */}
      <div className="border-y border-border overflow-hidden py-3 bg-surface">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...ticker, ...ticker].map((item, i) => (
            <span key={i} className="font-mono text-xs text-text-muted tracking-widest uppercase px-6">
              {item}
              <span className="text-ember ml-6">·</span>
            </span>
          ))}
        </motion.div>
      </div>

      <ServicesGrid />

      {ENABLE_MARKETING && (
        <section className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <AnimatedSection>
              <div
                className="relative overflow-hidden rounded-2xl p-10 lg:p-16"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,77,0,0.08) 0%, rgba(255,140,66,0.03) 60%, transparent 100%)',
                  border: '1.5px solid rgba(255,77,0,0.2)',
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  aria-hidden="true"
                  style={{ background: 'radial-gradient(ellipse 55% 90% at 5% 50%, rgba(255,77,0,0.09) 0%, transparent 70%)' }}
                />
                <div className="relative z-10 max-w-2xl">
                  <EmberBadge variant="in-dev" className="mb-6">
                    {t('marketing.badge')}
                  </EmberBadge>
                  <h2 className="font-display font-bold text-3xl lg:text-5xl text-text-heading mb-5 leading-tight">
                    {t('marketing.home.heading')}
                  </h2>
                  <p className="text-text-body text-lg leading-relaxed mb-8 max-w-xl">
                    {t('marketing.home.subtext')}
                  </p>
                  <MarketingNotifyForm layout="inline" className="max-w-sm" />
                </div>
                <div
                  className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none hidden lg:block"
                  aria-hidden="true"
                  style={{ background: 'radial-gradient(ellipse 80% 80% at 80% 50%, rgba(255,77,0,0.07) 0%, transparent 70%)' }}
                />
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Why Flintworks */}
      <section className="py-24 lg:py-32 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t('home.whyFlintworks.eyebrow')}
            heading={t('home.whyFlintworks.heading')}
          />
          <div className="space-y-16 mt-16">
            {valuePropNums.map((num, i) => {
              const Icon = valuePropIcons[i]
              const Visual = valuePropVisuals[num]
              return (
                <AnimatedSection key={num} delay={i * 0.1}>
                  <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                    <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                      <div className="flex items-center gap-4 mb-4">
                        <span
                          className="font-display font-bold text-7xl lg:text-8xl select-none pointer-events-none"
                          style={{ color: 'rgba(255,77,0,0.06)' }}
                          aria-hidden="true"
                        >
                          {num}
                        </span>
                        <div className="p-2.5 rounded-lg bg-ember/10 border border-ember/20">
                          <Icon size={20} className="text-ember" />
                        </div>
                      </div>
                      <h3 className="font-display font-bold text-3xl lg:text-4xl text-text-heading mb-4">
                        {t(`home.whyFlintworks.items.${num}.title`)}
                      </h3>
                      <p className="text-text-body text-lg leading-relaxed max-w-lg">
                        {t(`home.whyFlintworks.items.${num}.body`)}
                      </p>
                    </div>
                    <div
                      className={`relative overflow-hidden glass rounded-xl border border-border/50 h-48 lg:h-56 ${i % 2 === 1 ? 'lg:order-1' : ''}`}
                      aria-hidden="true"
                    >
                      <Visual />
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* Portfolio teaser */}
      <section className="py-24 lg:py-32 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <SectionHeading
              eyebrow={t('home.recentWork.eyebrow')}
              heading={t('home.recentWork.heading')}
              className="mb-0"
            />
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-ember font-semibold text-sm hover:text-flame transition-colors group shrink-0"
            >
              {t('home.recentWork.viewAll')}
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <PortfolioGrid limit={2} />
        </div>
      </section>

      {/* Studio teaser */}
      <section className="py-24 lg:py-32 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-2xl bg-surface border border-border p-10 lg:p-16">
              <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
                style={{ background: 'radial-gradient(ellipse 60% 80% at 90% 50%, rgba(255,77,0,0.06) 0%, transparent 70%)' }}
              />
              <div className="relative z-10 max-w-2xl">
                <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember mb-4 block">
                  {t('home.studio.eyebrow')}
                </span>
                <h2 className="font-display font-bold text-3xl lg:text-4xl text-text-heading mb-4">
                  {t('home.studio.heading')}
                </h2>
                <p className="text-text-body text-lg leading-relaxed mb-8">
                  {t('home.studio.body')}
                </p>
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-2 font-semibold text-ember hover:text-flame transition-colors group"
                >
                  {t('home.studio.cta')}
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div
              className="relative overflow-hidden rounded-2xl text-center py-20 px-8 ember-glow"
              style={{ background: 'linear-gradient(135deg, rgba(255,77,0,0.15) 0%, rgba(255,140,66,0.08) 100%)' }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
                style={{ background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(255,77,0,0.12) 0%, transparent 70%)' }}
              />
              <div className="relative z-10">
                <h2 className="font-display font-bold text-4xl lg:text-5xl text-text-heading mb-4">
                  {t('home.bottomCta.heading')}{' '}
                  <GradientText>{t('home.bottomCta.highlight')}</GradientText>
                </h2>
                <p className="text-text-body text-lg max-w-xl mx-auto mb-10">
                  {t('home.bottomCta.body')}
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-ember text-white font-bold text-lg hover:bg-flame transition-all duration-150 group"
                >
                  {t('home.bottomCta.cta')}
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
