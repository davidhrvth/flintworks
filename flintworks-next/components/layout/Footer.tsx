'use client'

import Link from 'next/link'
import { MessageCircle, Mail, MapPin, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo } from '../ui/Logo'
import { CONTACT_EMAIL, CONTACT_PHONE, contactLinks } from '@/config/contact'

const socialLinks = [
  { icon: Mail, label: 'Email', href: contactLinks.email },
  { icon: Phone, label: 'Phone', href: contactLinks.phone },
  { icon: MessageCircle, label: 'WhatsApp', href: contactLinks.whatsapp },
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
      { label: CONTACT_EMAIL, href: contactLinks.email },
      { label: CONTACT_PHONE, href: contactLinks.phone },
    ],
  }

  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center mb-5">
              <Logo height={30} animated />
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
