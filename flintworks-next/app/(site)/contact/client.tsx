'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ContactChannels, ContactQuickActions } from '@/components/sections/ContactChannels'
import { ContactForm } from '@/components/sections/ContactForm'
import { EmberParticles } from '@/components/sections/EmberParticles'
import { GradientText } from '@/components/ui/GradientText'

const NEXT_STEPS = ['step1', 'step2', 'step3'] as const

// One ember glow centred on the line where the hero meets the form: the hero
// paints the half above that line, the form area the half below.
const glowAbove = 'radial-gradient(ellipse 760px 320px at 38% 100%, rgba(255,77,0,0.14) 0%, transparent 70%)'
const glowBelow = 'radial-gradient(ellipse 760px 320px at 38% 0%, rgba(255,77,0,0.14) 0%, transparent 70%)'

export default function ContactPageContent() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const [sent, setSent] = useState(false)

  const stagger = (i: number) => ({
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  })

  return (
    <section className="relative pb-20 lg:pb-28">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Hero: embers rise from the top edge of the form */}
      <div className="relative">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{ background: glowAbove }}
        />
        <EmberParticles />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 lg:pb-14">
          <motion.div {...stagger(0)}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ember/30 bg-ember/5 text-ember font-mono text-xs tracking-widest uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
              {t('contact.badge')}
            </span>
          </motion.div>

          <motion.h1
            className="font-display font-bold text-5xl lg:text-7xl text-text-heading leading-tight"
            {...stagger(1)}
          >
            {t('contact.heading')} <GradientText>{t('contact.headingHighlight')}</GradientText>
          </motion.h1>

          <motion.p className="mt-5 text-text-body text-lg max-w-2xl leading-relaxed" {...stagger(2)}>
            {t('contact.subheading')}
          </motion.p>

          <motion.div className="mt-6 lg:hidden" {...stagger(3)}>
            <ContactQuickActions />
          </motion.div>
        </div>
      </div>

      <div className="relative">
        <div
          className="absolute inset-x-0 top-0 h-[420px] pointer-events-none"
          aria-hidden="true"
          style={{ background: glowBelow }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <motion.div className="lg:col-span-7" {...stagger(3)}>
              <div className="relative glass rounded-2xl p-5 sm:p-8 lg:p-10">
                {/* Struck edge: the line the embers come off */}
                <div
                  className="absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-ember to-transparent"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-x-16 -top-3 h-6 bg-ember/25 blur-2xl pointer-events-none"
                  aria-hidden="true"
                />
                <ContactForm onSent={() => setSent(true)} />
              </div>
            </motion.div>

            <motion.aside
              className="lg:col-span-5 lg:top-28 lg:[@media(min-height:800px)]:sticky space-y-8"
              {...stagger(4)}
            >
              <div>
                <h2 className="font-display font-bold text-2xl text-text-heading mb-2">
                  {t('contact.direct.heading')}
                </h2>
                <p className="text-text-body text-sm leading-relaxed mb-5">{t('contact.direct.body')}</p>
                <ContactChannels />
              </div>

              <div className="glass rounded-xl p-6">
                <h2 className="font-mono text-xs font-medium text-text-muted uppercase tracking-wider mb-5">
                  {t('contact.info.next.label')}
                </h2>
                <ol>
                  {NEXT_STEPS.map((step, i) => {
                    const current = sent && i === 0
                    return (
                      <li key={step} className="relative flex gap-4 pb-5 last:pb-0">
                        {i < NEXT_STEPS.length - 1 && (
                          <span
                            className="absolute left-3.5 top-7 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-ember/40 to-border"
                            aria-hidden="true"
                          />
                        )}
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-all duration-500 ${
                            current
                              ? 'border-ember bg-ember text-white animate-pulse-glow'
                              : 'border-ember/30 bg-ember/10 text-ember'
                          }`}
                        >
                          {`0${i + 1}`}
                        </span>
                        <span
                          className={`pt-1 text-sm leading-relaxed transition-colors duration-500 ${
                            current ? 'text-text-heading' : 'text-text-body'
                          }`}
                        >
                          {t(`contact.info.next.${step}`)}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-surface border border-border">
                  <MapPin size={16} className="text-ember" />
                </div>
                <div>
                  <p className="text-sm text-text-body">{t('contact.info.location')}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t('contact.info.locationNote')}</p>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </div>
    </section>
  )
}
