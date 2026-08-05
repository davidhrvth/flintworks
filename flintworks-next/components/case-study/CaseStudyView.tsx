'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  MapPin,
  Sparkles,
  Users,
  Layers,
  Music2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmberBadge } from '@/components/ui/EmberBadge'
import type { CaseStudy } from '@/data/case-studies'

const featureIcons = [MapPin, Sparkles, Music2, Users, Layers]

interface CaseStudyViewProps {
  study: CaseStudy
}

export function CaseStudyView({ study }: CaseStudyViewProps) {
  const { t } = useTranslation()
  const base = `caseStudy.projects.${study.id}`

  const architecture = t(`${base}.architecture`, { returnObjects: true }) as string[]
  const solution = t(`${base}.solution`, { returnObjects: true }) as string[]
  const features = t(`${base}.features`, { returnObjects: true }) as string[]

  const monthLabel = study.launchMonthKey
    ? t(`caseStudy.launchMonths.${study.launchMonthKey}`)
    : undefined

  const statusLabel =
    study.status === 'pre-launch'
      ? monthLabel
        ? t('caseStudy.status.preLaunch', { month: monthLabel })
        : t('caseStudy.status.preLaunch', { month: t(`${base}.timeline`) })
      : t('caseStudy.status.launched')

  const showMetricsComingSoon =
    study.status === 'pre-launch' && (!study.metrics || study.metrics.length === 0)
  const showRealMetrics = Boolean(study.metrics && study.metrics.length > 0)
  const showStoreCtas = Boolean(study.appStoreUrl || study.playStoreUrl)
  const showDemo = Boolean(study.demoVideoUrl)
  const showScreenshots = Boolean(study.screenshots && study.screenshots.length > 0)
  const quoteText = study.hasQuote ? t(`${base}.quote`, { defaultValue: '' }) : ''
  const showQuote = Boolean(study.hasQuote && quoteText)

  const backHref = study.entryPoint === 'studio' ? '/studio' : '/work'
  const backLabel =
    study.entryPoint === 'studio' ? t('caseStudy.backToStudio') : t('nav.work')

  return (
    <>
      {/* Hero — dense, full-bleed visual plane */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 70% 90% at 85% 20%, rgba(255,77,0,0.14) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 10% 80%, rgba(255,140,66,0.06) 0%, transparent 50%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-ember transition-colors mb-8"
            >
              <ArrowLeft size={14} />
              {backLabel}
            </Link>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6">
              <AnimatedSection delay={0.05}>
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember">
                    {t(`${base}.platform`)}
                  </span>
                  <EmberBadge variant={study.status === 'pre-launch' ? 'coming-soon' : 'ember'}>
                    {statusLabel}
                  </EmberBadge>
                </div>

                <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-text-heading leading-[0.95] mb-5">
                  {t(`${base}.name`)}
                </h1>
                <p className="text-xl sm:text-2xl text-text-body leading-relaxed max-w-xl mb-6">
                  {t(`${base}.oneLiner`)}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-text-muted font-mono">
                  <span>{t(`${base}.role`)}</span>
                  <span className="hidden sm:inline text-border">|</span>
                  <span>{t(`${base}.timeline`)}</span>
                </div>

                {(showStoreCtas || showDemo) && (
                  <div className="flex flex-wrap gap-3 mt-8">
                    {study.appStoreUrl && (
                      <a
                        href={study.appStoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ember text-white text-sm font-semibold hover:bg-flame transition-colors"
                      >
                        {t('caseStudy.appStore')}
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {study.playStoreUrl && (
                      <a
                        href={study.playStoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-text-heading text-sm font-semibold hover:border-ember/40 transition-colors"
                      >
                        {t('caseStudy.playStore')}
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {study.demoVideoUrl && (
                      <a
                        href={study.demoVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-text-heading text-sm font-semibold hover:border-ember/40 transition-colors"
                      >
                        {t('caseStudy.watchDemo')}
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                )}
              </AnimatedSection>
            </div>

            {study.heroImage && (
              <div className="lg:col-span-6">
                <AnimatedSection delay={0.12} direction="right">
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-surface shadow-[0_0_60px_-20px_rgba(255,77,0,0.35)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={study.heroImage}
                      alt={t(`${base}.name`)}
                      className="w-full h-auto object-cover aspect-[16/10]"
                    />
                  </div>
                </AnimatedSection>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Problem + Approach */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <AnimatedSection>
              <p className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember mb-3">
                {t('caseStudy.sections.problem')}
              </p>
              <p className="text-text-body text-lg leading-relaxed">{t(`${base}.problem`)}</p>
            </AnimatedSection>
            <AnimatedSection delay={0.08}>
              <p className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember mb-3">
                {t('caseStudy.sections.approach')}
              </p>
              <p className="text-text-body text-lg leading-relaxed">{t(`${base}.approach`)}</p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-20 lg:py-28 border-t border-border bg-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading heading={t('caseStudy.sections.architecture')} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(architecture) &&
              architecture.map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.05}>
                  <div className="h-full p-5 rounded-xl border border-border bg-background/80 hover:border-ember/25 transition-colors">
                    <div className="flex gap-4">
                      <span className="font-mono text-xs text-ember mt-1 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-text-body leading-relaxed">{item}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
          </div>
        </div>
      </section>

      {/* Challenge callout + solution */}
      <section className="py-20 lg:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="relative rounded-2xl border border-ember/25 bg-gradient-to-br from-ember/10 via-surface to-background p-8 lg:p-12 overflow-hidden mb-14">
              <div
                className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-ember/10 blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <p className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember mb-4">
                {t('caseStudy.sections.challenge')}
              </p>
              <p className="relative font-display text-2xl lg:text-3xl text-text-heading leading-snug max-w-4xl">
                {t(`${base}.challenge`)}
              </p>
            </div>
          </AnimatedSection>

          <SectionHeading heading={t('caseStudy.sections.solution')} />
          <AnimatedSection>
            <ol className="space-y-4 max-w-3xl">
              {Array.isArray(solution) &&
                solution.map((step, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ember/10 border border-ember/25 font-mono text-sm text-ember">
                      {i + 1}
                    </span>
                    <p className="text-text-body text-lg leading-relaxed pt-0.5">{step}</p>
                  </li>
                ))}
            </ol>
          </AnimatedSection>
        </div>
      </section>

      {/* Features — rhythm of icon blocks */}
      <section className="py-20 lg:py-28 border-t border-border bg-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading heading={t('caseStudy.sections.features')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.isArray(features) &&
              features.map((feature, i) => {
                const Icon = featureIcons[i % featureIcons.length]
                return (
                  <AnimatedSection key={i} delay={i * 0.05}>
                    <div className="h-full p-6 rounded-xl border border-border bg-background hover:border-ember/30 transition-all duration-300 group">
                      <div className="mb-4 p-2.5 w-fit rounded-lg bg-ember/10 border border-ember/20 group-hover:bg-ember/15 transition-colors">
                        <Icon size={20} className="text-ember" />
                      </div>
                      <p className="text-text-heading font-medium leading-snug">{feature}</p>
                    </div>
                  </AnimatedSection>
                )
              })}
          </div>
        </div>
      </section>

      {/* Tech stack grouped */}
      <section className="py-20 lg:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading heading={t('caseStudy.sections.techStack')} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {study.techGroups.map((group, i) => (
              <AnimatedSection key={group.id} delay={i * 0.06}>
                <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
                  <h3 className="font-mono text-xs tracking-[0.15em] uppercase text-ember mb-4">
                    {t(`caseStudy.techLayers.${group.id}`)}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded text-xs font-mono text-text-body bg-background border border-border"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics */}
      {(showMetricsComingSoon || showRealMetrics) && (
        <section className="py-20 lg:py-28 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading heading={t('caseStudy.sections.metrics')} />
            {showMetricsComingSoon && (
              <AnimatedSection>
                <div className="rounded-xl border border-dashed border-border bg-surface/30 px-8 py-12 text-center">
                  <EmberBadge variant="coming-soon" className="mb-4">
                    {statusLabel}
                  </EmberBadge>
                  <p className="text-text-muted text-lg">{t('caseStudy.metricsComingSoon')}</p>
                </div>
              </AnimatedSection>
            )}
            {showRealMetrics && study.metrics && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {study.metrics.map((metric) => (
                  <AnimatedSection key={metric.labelKey}>
                    <div className="p-6 rounded-xl border border-border bg-surface/50 text-center">
                      <p className="font-display text-3xl text-text-heading mb-2">{metric.value}</p>
                      <p className="text-sm text-text-muted">{t(metric.labelKey)}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Screenshots */}
      {showScreenshots && study.screenshots && (
        <section className="py-20 lg:py-28 border-t border-border bg-surface/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading heading={t('caseStudy.sections.screenshots')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {study.screenshots.map((src, i) => (
                <AnimatedSection key={src} delay={i * 0.08}>
                  <div className="rounded-xl overflow-hidden border border-border bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={t('caseStudy.screenshotAlt', {
                        name: t(`${base}.name`),
                        n: i + 1,
                      })}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quote — only when real */}
      {showQuote && (
        <section className="py-20 lg:py-28 border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <blockquote className="font-display text-2xl lg:text-3xl text-text-heading leading-snug mb-4">
                &ldquo;{quoteText}&rdquo;
              </blockquote>
              <cite className="text-text-muted not-italic font-mono text-sm">
                {t(`${base}.quoteAuthor`)}
              </cite>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Back / related CTA */}
      <section className="py-20 lg:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl border border-border bg-surface/50 p-8 lg:p-10">
              <div>
                <p className="font-display text-2xl text-text-heading mb-2">
                  {t('caseStudy.relatedCta')}
                </p>
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-ember transition-colors"
                >
                  <ArrowLeft size={14} />
                  {backLabel}
                </Link>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-ember text-white text-sm font-semibold hover:bg-flame transition-colors"
              >
                {t('caseStudy.relatedCtaButton')}
                <ArrowRight size={14} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
