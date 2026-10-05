'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { Logo } from '../ui/Logo'
import { ENABLE_MARKETING } from '@/config/features'

function SoonBadge({ label }: { label: string }) {
  return (
    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-ember/15 text-ember border border-ember/30 font-mono leading-none align-middle">
      {label}
    </span>
  )
}

export function Navbar() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  const navLinks = [
    { labelKey: 'nav.services', href: '/services' },
    ...(ENABLE_MARKETING ? [{ labelKey: 'marketing.nav', href: '/marketing', soon: true }] : []),
    { labelKey: 'nav.pricing', href: '/pricing' },
    { labelKey: 'nav.work', href: '/work' },
    { labelKey: 'nav.studio', href: '/studio' },
    { labelKey: 'nav.about', href: '/about' },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMobile = () => setMobileOpen(false)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'backdrop-blur-xl bg-background/80 border-b border-border/50'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-18">
          <Link
            href="/"
            className="flex items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            aria-label="Flintworks home"
          >
            <Logo height={30} animated />
          </Link>

          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === link.href.split('#')[0] && !link.soon
                      ? 'text-text-heading'
                      : 'text-text-muted hover:text-text-heading'
                  }`}
                >
                  {t(link.labelKey)}
                  {link.soon && <SoonBadge label={t('marketing.navSoon')} />}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold bg-ember text-white hover:bg-flame transition-colors duration-150"
            >
              {t('nav.startProject')}
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-text-muted hover:text-text-heading transition-colors"
            aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col pt-20 px-6 pb-8"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="flex flex-col gap-1 flex-1">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMobile}
                    className={`flex items-center py-3 text-2xl font-display font-bold border-b border-border/30 transition-colors ${
                      pathname === link.href.split('#')[0] && !link.soon
                        ? 'text-ember'
                        : 'text-text-heading hover:text-ember'
                    }`}
                  >
                    {t(link.labelKey)}
                    {link.soon && (
                      <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold bg-ember/15 text-ember border border-ember/30 font-mono">
                        {t('marketing.navSoon')}
                      </span>
                    )}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div
              className="space-y-3"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-center">
                <LanguageSwitcher />
              </div>
              <Link
                href="/contact"
                onClick={closeMobile}
                className="block w-full text-center py-4 rounded-xl text-lg font-bold bg-ember text-white hover:bg-flame transition-colors"
              >
                {t('nav.startProject')}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
