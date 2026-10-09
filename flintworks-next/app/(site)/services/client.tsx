'use client'

import Link from 'next/link'
import { Check, ArrowRight, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { GlowCard } from '@/components/ui/GlowCard'
import { contactHref } from '@/data/contact'
import { services } from '@/data/services'

export default function ServicesPageContent() {
  const { t } = useTranslation()
  const mainServices = services.filter((s) => s.id !== 'marketing')

  return (
    <>
      <section className="pt-32 pb-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember mb-4 block">
              {t('services.hero.eyebrow')}
            </span>
            <h1 className="font-display font-bold text-5xl lg:text-7xl text-text-heading mb-6 leading-tight">
              {t('services.hero.heading')}
            </h1>
            <p className="text-text-body text-xl max-w-2xl leading-relaxed">
              {t('services.hero.subheading')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-8 border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-ember shrink-0 mt-0.5" />
              <p className="text-text-body text-sm leading-relaxed">{t('services.localNote')}</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {mainServices.map((service, i) => {
            const Icon = service.icon
            const description = t(`services.items.${service.id}.description`, { returnObjects: true }) as string[]
            const deliverables = t(`services.items.${service.id}.deliverables`, { returnObjects: true }) as string[]
            const useCases = t(`services.items.${service.id}.useCases`, { returnObjects: true }) as string[]

            return (
              <AnimatedSection key={service.id} delay={i * 0.05}>
                <div id={service.id}>
                  <GlowCard className="p-8 lg:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 rounded-xl bg-ember/10 border border-ember/20">
                            <Icon size={26} className="text-ember" />
                          </div>
                        </div>
                        <h2 className="font-display font-bold text-2xl lg:text-3xl text-text-heading mb-3">
                          {t(`services.items.${service.id}.name`)}
                        </h2>
                        <p className="text-ember font-semibold text-sm">
                          {t(`services.items.${service.id}.tagline`)}
                        </p>
                      </div>

                      <div className="lg:col-span-2 space-y-8">
                        <div>
                          {Array.isArray(description) && description.map((para, j) => (
                            <p key={j} className="text-text-body leading-relaxed mb-3 last:mb-0">{para}</p>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <div>
                            <h3 className="font-mono text-xs font-semibold tracking-[0.15em] uppercase text-text-muted mb-3">
                              {t('services.deliverables')}
                            </h3>
                            <ul className="space-y-2">
                              {Array.isArray(deliverables) && deliverables.map((item) => (
                                <li key={item} className="flex items-start gap-2.5">
                                  <Check size={13} className="text-ember mt-0.5 shrink-0" />
                                  <span className="text-text-body text-sm">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-mono text-xs font-semibold tracking-[0.15em] uppercase text-text-muted mb-3">
                              {t('services.useCases')}
                            </h3>
                            <ul className="space-y-2">
                              {Array.isArray(useCases) && useCases.map((item) => (
                                <li key={item} className="flex items-start gap-2.5">
                                  <ArrowRight size={13} className="text-ember/60 mt-0.5 shrink-0" />
                                  <span className="text-text-body text-sm">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <Link
                          href={contactHref(service.contactTopic)}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-ember text-ember font-semibold text-sm hover:bg-ember hover:text-white transition-all duration-150 group"
                        >
                          {t('services.startWith', { name: t(`services.items.${service.id}.name`) })}
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </GlowCard>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-text-heading mb-4">
              {t('services.cta.heading')}
            </h2>
            <p className="text-text-body text-lg mb-8 max-w-xl mx-auto">{t('services.cta.body')}</p>
            <Link
              href={contactHref('other')}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-ember text-white font-semibold hover:bg-flame transition-colors group"
            >
              {t('services.cta.button')}
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
