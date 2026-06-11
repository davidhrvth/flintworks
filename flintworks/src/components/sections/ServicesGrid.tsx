import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatedSection } from '../ui/AnimatedSection'
import { GlowCard } from '../ui/GlowCard'
import { EmberBadge } from '../ui/EmberBadge'
import { SectionHeading } from '../ui/SectionHeading'
import { services } from '../../data/services'

export function ServicesGrid() {
  const { t } = useTranslation()

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('services.grid.eyebrow')}
          heading={t('services.grid.heading')}
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <AnimatedSection key={service.id} delay={i * 0.07}>
                <GlowCard
                  className={`p-6 h-full flex flex-col ${service.comingSoon ? 'opacity-60' : ''}`}
                  glowOnHover={!service.comingSoon}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-lg bg-ember/10 border border-ember/20">
                      <Icon size={22} className="text-ember" />
                    </div>
                    {service.comingSoon && (
                      <EmberBadge variant="coming-soon">{t('services.comingSoon')}</EmberBadge>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-lg text-text-heading mb-2">
                    {t(`services.items.${service.id}.name`)}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed flex-1">
                    {t(`services.items.${service.id}.tagline`)}
                  </p>
                  {!service.comingSoon && (
                    <Link
                      to={`/services#${service.id}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ember hover:text-flame transition-colors group"
                    >
                      {t('services.learnMore')}
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                </GlowCard>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
