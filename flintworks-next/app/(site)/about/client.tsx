'use client'

import Link from 'next/link'
import { ArrowRight, Shield, Eye, Zap, Wrench, MapPin, Megaphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { GlowCard } from '@/components/ui/GlowCard'
import { GradientText } from '@/components/ui/GradientText'
import { EmberBadge } from '@/components/ui/EmberBadge'
import { ENABLE_MARKETING } from '@/config/features'

const valueIcons = { craft: Wrench, transparency: Eye, speed: Zap, builders: Shield }
const valueKeys = ['craft', 'transparency', 'speed', 'builders'] as const

const techStack = [
  'React', 'Next.js', 'React Native', 'Node.js', 'TypeScript',
  'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Stripe', 'Vercel', 'Figma',
]

export default function AboutPageContent() {
  const { t } = useTranslation()
  const storyParagraphs = t('about.story.paragraphs', { returnObjects: true }) as string[]

  return (
    <>
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(255,77,0,0.06) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember mb-4 block">
              {t('about.eyebrow')}
            </span>
            <h1 className="font-display font-bold text-5xl lg:text-7xl text-text-heading mb-6 leading-tight">
              {t('about.heading')}{' '}
              <GradientText>{t('about.headingHighlight')}</GradientText>
            </h1>
            <p className="text-text-body text-xl max-w-2xl leading-relaxed">
              {t('about.subheading')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20 lg:py-28 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <SectionHeading
                eyebrow={t('about.story.eyebrow')}
                heading={t('about.story.heading')}
                className="mb-0"
              />
            </AnimatedSection>
            <AnimatedSection delay={0.15} direction="left">
              <div className="space-y-5 text-text-body text-lg leading-relaxed">
                {Array.isArray(storyParagraphs) && storyParagraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {ENABLE_MARKETING && (
        <section className="py-20 lg:py-28 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div
                className="relative overflow-hidden rounded-2xl p-10 lg:p-16"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,77,0,0.05) 0%, rgba(255,140,66,0.02) 60%, transparent 100%)',
                  border: '1.5px solid rgba(255,77,0,0.18)',
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  aria-hidden="true"
                  style={{ background: 'radial-gradient(ellipse 55% 90% at 95% 50%, rgba(255,77,0,0.07) 0%, transparent 70%)' }}
                />
                <div className="relative z-10 max-w-2xl">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="p-2 rounded-lg bg-ember/10 border border-ember/20">
                      <Megaphone size={16} className="text-ember" />
                    </div>
                    <EmberBadge variant="in-dev">{t('marketing.about.visionEyebrow')}</EmberBadge>
                  </div>
                  <p className="text-text-body text-lg leading-relaxed">{t('marketing.about.vision')}</p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      <section className="py-20 lg:py-28 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={t('about.values.eyebrow')} heading={t('about.values.heading')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {valueKeys.map((key, i) => {
              const Icon = valueIcons[key]
              return (
                <AnimatedSection key={key} delay={i * 0.1}>
                  <GlowCard className="p-7">
                    <div className="p-2.5 rounded-lg bg-ember/10 border border-ember/20 w-fit mb-4">
                      <Icon size={20} className="text-ember" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-text-heading mb-2">
                      {t(`about.values.items.${key}.title`)}
                    </h3>
                    <p className="text-text-body text-sm leading-relaxed">
                      {t(`about.values.items.${key}.body`)}
                    </p>
                  </GlowCard>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-2xl bg-surface border border-border p-10 lg:p-16">
              <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
                style={{ background: 'radial-gradient(ellipse 60% 80% at 10% 50%, rgba(255,77,0,0.05) 0%, transparent 70%)' }}
              />
              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember">
                    {t('about.budapest.eyebrow')}
                  </span>
                  <MapPin size={13} className="text-ember" />
                </div>
                <h2 className="font-display font-bold text-3xl lg:text-4xl text-text-heading mb-4">
                  {t('about.budapest.heading')}
                </h2>
                <p className="text-text-body text-lg leading-relaxed">{t('about.budapest.body')}</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20 lg:py-28 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t('about.stack.eyebrow')}
            heading={t('about.stack.heading')}
            subtext={t('about.stack.subtext')}
          />
          <AnimatedSection>
            <div className="flex flex-wrap gap-3">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-lg font-mono text-sm text-text-body bg-surface border border-border hover:border-ember/30 hover:text-text-heading transition-all duration-150"
                >
                  {tech}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-text-heading mb-4">
              {t('about.cta.heading')}
            </h2>
            <p className="text-text-body text-lg mb-8 max-w-lg mx-auto">{t('about.cta.body')}</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-ember text-white font-semibold hover:bg-flame transition-colors group"
            >
              {t('about.cta.button')}
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
