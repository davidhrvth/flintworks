'use client'

import Link from 'next/link'
import { ArrowRight, Smartphone, Monitor, Flame } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { GlowCard } from '@/components/ui/GlowCard'
import { EmberBadge } from '@/components/ui/EmberBadge'

const studioProjectMeta = [
  { id: 'studio-web', icon: Monitor, tags: ['React', 'TypeScript', 'Supabase'] },
  { id: 'studio-mobile', icon: Smartphone, tags: ['React Native', 'Expo', 'Node.js'] },
]

export default function StudioPageContent() {
  const { t } = useTranslation()
  const paragraphs = t('studio.philosophy.paragraphs', { returnObjects: true }) as string[]

  return (
    <>
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(255,77,0,0.07) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember mb-4 block">
              {t('studio.eyebrow')}
            </span>
            <h1 className="font-display font-bold text-5xl lg:text-7xl text-text-heading mb-6 leading-tight">
              {t('studio.heading')}
            </h1>
            <p className="text-text-body text-xl max-w-2xl leading-relaxed mb-4">
              {t('studio.subheading')}
            </p>
            <p className="text-text-muted text-lg max-w-2xl leading-relaxed">
              {t('studio.subheading2')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t('studio.inProgress.eyebrow')}
            heading={t('studio.inProgress.heading')}
            subtext={t('studio.inProgress.subtext')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studioProjectMeta.map((project, i) => {
              const Icon = project.icon
              return (
                <AnimatedSection key={project.id} delay={i * 0.1}>
                  <GlowCard className="p-8 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 rounded-xl bg-ember/10 border border-ember/20">
                        <Icon size={24} className="text-ember" />
                      </div>
                      <EmberBadge variant="in-dev">
                        <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
                        {t('studio.inDev')}
                      </EmberBadge>
                    </div>

                    <div className="mb-2">
                      <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                        {t(`studio.projects.${project.id}.platform`)}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-2xl text-text-heading mb-3">
                      {t(`studio.projects.${project.id}.name`)}
                    </h3>
                    <p className="text-text-body leading-relaxed flex-1 mb-6">
                      {t(`studio.projects.${project.id}.description`)}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded text-xs font-mono text-text-muted bg-background border border-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-ember hover:text-flame transition-colors group"
                    >
                      {t('studio.followBuild')}
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </GlowCard>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-lg bg-ember/10 border border-ember/20">
                  <Flame size={20} className="text-ember" />
                </div>
                <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember">
                  {t('studio.philosophy.eyebrow')}
                </span>
              </div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-text-heading mb-6">
                {t('studio.philosophy.heading')}
              </h2>
              <div className="space-y-4 text-text-body text-lg leading-relaxed">
                {Array.isArray(paragraphs) && paragraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  )
}
