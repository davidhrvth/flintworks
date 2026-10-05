'use client'

import { Mail, Code2, Briefcase, MessageCircle, Clock, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { ContactForm } from '@/components/sections/ContactForm'
import { GradientText } from '@/components/ui/GradientText'

const socialLinks = [
  { icon: Code2, label: 'GitHub', href: 'https://github.com' },
  { icon: Briefcase, label: 'LinkedIn', href: 'https://linkedin.com' },
  { icon: MessageCircle, label: 'Twitter / X', href: 'https://x.com' },
]

export default function ContactPageContent() {
  const { t } = useTranslation()

  return (
    <section className="pt-32 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-12">
          <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember mb-4 block">
            {t('contact.eyebrow')}
          </span>
          <h1 className="font-display font-bold text-5xl lg:text-7xl text-text-heading leading-tight">
            {t('contact.heading')}{' '}
            <GradientText>{t('contact.headingHighlight')}</GradientText>
          </h1>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
          <AnimatedSection className="lg:col-span-3" delay={0.1}>
            <div className="glass rounded-xl border border-white/5 p-8 lg:p-10">
              <ContactForm />
            </div>
          </AnimatedSection>

          <AnimatedSection className="lg:col-span-2" delay={0.2} direction="left">
            <div className="space-y-8">
              <div>
                <h2 className="font-display font-bold text-2xl text-text-heading mb-3">
                  {t('contact.info.heading')}
                </h2>
                <p className="text-text-body leading-relaxed">{t('contact.info.body')}</p>
              </div>

              <div className="border-t border-border pt-8 space-y-4">
                <a
                  href="mailto:hello@flintworks.io"
                  className="flex items-center gap-3 text-text-body hover:text-ember transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-surface border border-border group-hover:border-ember/30 transition-colors">
                    <Mail size={16} className="text-ember" />
                  </div>
                  <span className="font-mono text-sm">hello@flintworks.io</span>
                </a>

                <div className="flex items-center gap-3 text-text-muted">
                  <div className="p-2 rounded-lg bg-surface border border-border">
                    <MapPin size={16} className="text-ember" />
                  </div>
                  <div>
                    <span className="text-sm text-text-body">{t('contact.info.location')}</span>
                    <p className="text-xs text-text-muted mt-0.5">{t('contact.info.locationNote')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-text-muted">
                  <div className="p-2 rounded-lg bg-surface border border-border">
                    <Clock size={16} className="text-text-muted" />
                  </div>
                  <span className="text-sm">{t('contact.info.response')}</span>
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <p className="font-mono text-xs font-medium text-text-muted uppercase tracking-wider mb-4">
                  {t('contact.info.findUs')}
                </p>
                <div className="flex items-center gap-4">
                  {socialLinks.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="p-2.5 rounded-lg bg-surface border border-border text-text-muted hover:text-ember hover:border-ember/30 transition-all duration-150"
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <div className="glass rounded-xl p-6 border border-border/50">
                  <p className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
                    {t('contact.info.next.label')}
                  </p>
                  <ol className="space-y-2 text-text-body text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-ember font-mono font-bold shrink-0">01</span>
                      {t('contact.info.next.step1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ember font-mono font-bold shrink-0">02</span>
                      {t('contact.info.next.step2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ember font-mono font-bold shrink-0">03</span>
                      {t('contact.info.next.step3')}
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
