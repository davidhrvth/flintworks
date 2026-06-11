'use client'

import Link from 'next/link'
import { Code2, Briefcase, MessageCircle, Mail, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 2L11.5 8.5L18 10L11.5 11.5L10 18L8.5 11.5L2 10L8.5 8.5L10 2Z" fill="#FF4D00" />
    </svg>
  )
}

const socialLinks = [
  { icon: Code2, label: 'GitHub', href: 'https://github.com' },
  { icon: Briefcase, label: 'LinkedIn', href: 'https://linkedin.com' },
  { icon: MessageCircle, label: 'Twitter / X', href: 'https://x.com' },
  { icon: Mail, label: 'Email', href: 'mailto:hello@flintworks.io' },
]

export function Footer() {
  const { t } = useTranslation()

  const footerLinks = {
    [t('footer.sections.services')]: [
      { label: t('footer.links.webApps'), href: '/services#web-apps' },
      { label: t('footer.links.websites'), href: '/services#business-websites' },
      { label: t('footer.links.mobileApps'), href: '/services#mobile-apps' },
      { label: t('footer.links.startups'), href: '/services#startup-development' },
    ],
    [t('footer.sections.company')]: [
      { label: t('footer.links.work'), href: '/work' },
      { label: t('footer.links.studio'), href: '/studio' },
      { label: t('footer.links.about'), href: '/about' },
      { label: t('footer.links.pricing'), href: '/pricing' },
    ],
    [t('footer.sections.connect')]: [
      { label: t('footer.links.contact'), href: '/contact' },
      { label: 'hello@flintworks.io', href: 'mailto:hello@flintworks.io' },
    ],
  }

  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <SparkIcon />
              <span className="font-display font-bold text-base tracking-widest text-text-heading">
                FLINTWORKS
              </span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-1 max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-1.5 text-text-muted text-sm mb-6">
              <MapPin size={13} className="text-ember shrink-0" />
              <span>{t('footer.location')}</span>
            </div>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="text-text-muted hover:text-ember transition-colors duration-150"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-mono text-xs font-semibold tracking-[0.15em] uppercase text-text-muted mb-4">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith('/') ? (
                      <Link
                        href={href}
                        className="text-sm text-text-body hover:text-text-heading transition-colors duration-150"
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        className="text-sm text-text-body hover:text-text-heading transition-colors duration-150"
                      >
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-xs">{t('footer.copyright')}</p>
          <p className="text-text-muted text-xs font-mono">{t('footer.tagline')}</p>
        </div>
      </div>
    </footer>
  )
}
