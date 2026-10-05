'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EmberParticles } from './EmberParticles'
import { GradientText } from '../ui/GradientText'

export function HeroSection() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()

  const stagger = (i: number) => ({
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  })

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(255,77,0,0.08) 0%, transparent 70%)',
        }}
      />

      <EmberParticles />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
        <motion.div {...stagger(0)}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ember/30 bg-ember/5 text-ember font-mono text-xs tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
            {t('hero.badge')}
          </span>
        </motion.div>

        <motion.h1
          className="font-display font-bold leading-[0.95] tracking-tight"
          style={{ fontSize: 'clamp(3rem, 9vw, 6rem)' }}
          {...stagger(1)}
        >
          <span className="text-text-heading block">{t('hero.line1')}</span>
          <GradientText className="block">{t('hero.line2')}</GradientText>
        </motion.h1>

        <motion.p
          className="mt-8 text-text-body text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
          {...stagger(2)}
        >
          {t('hero.subheadline')}
        </motion.p>

        <motion.div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4" {...stagger(3)}>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-ember text-white font-semibold hover:bg-flame transition-all duration-150 text-base group"
          >
            {t('hero.seeOurWork')}
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-border text-text-heading font-semibold hover:border-ember/40 hover:bg-ember/5 transition-all duration-150 text-base"
          >
            {t('hero.getQuote')}
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  )
}
