import { Helmet } from 'react-helmet-async'
import { PortfolioGrid } from '../components/sections/PortfolioGrid'
import { AnimatedSection } from '../components/ui/AnimatedSection'
import { SectionHeading } from '../components/ui/SectionHeading'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Work() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('meta.work.title')}</title>
        <meta name="description" content={t('meta.work.description')} />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember mb-4 block">
              {t('work.eyebrow')}
            </span>
            <h1 className="font-display font-bold text-5xl lg:text-7xl text-text-heading mb-6 leading-tight">
              {t('work.heading')}
            </h1>
            <p className="text-text-body text-xl max-w-2xl leading-relaxed">
              {t('work.subheading')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Project grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PortfolioGrid />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <SectionHeading
              heading={t('work.cta.heading')}
              subtext={t('work.cta.subtext')}
              align="center"
            />
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-ember text-white font-semibold hover:bg-flame transition-colors group"
            >
              {t('work.cta.button')}
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
