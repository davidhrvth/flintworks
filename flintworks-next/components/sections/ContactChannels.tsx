'use client'

import { useState } from 'react'
import { ArrowUpRight, CalendarClock, Check, Copy, Mail, MessageCircle, Phone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BOOKING_URL, CONTACT_EMAIL, CONTACT_PHONE, contactLinks } from '@/config/contact'

interface Channel {
  id: string
  icon: LucideIcon
  /** Small caption in the full list */
  label: string
  /** Main line in the full list */
  value: string
  /** Text on the compact pill */
  short: string
  href: string
  external?: boolean
  copyValue?: string
  featured?: boolean
}

function useChannels(): Channel[] {
  const { t } = useTranslation()

  return [
    ...(BOOKING_URL
      ? [
          {
            id: 'booking',
            icon: CalendarClock,
            label: t('contact.channels.booking'),
            value: t('contact.channels.bookingNote'),
            short: t('contact.channels.booking'),
            href: BOOKING_URL,
            external: true,
            featured: true,
          },
        ]
      : []),
    {
      id: 'phone',
      icon: Phone,
      label: t('contact.channels.phone'),
      value: CONTACT_PHONE,
      short: t('contact.channels.call'),
      href: contactLinks.phone,
      copyValue: CONTACT_PHONE,
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      value: t('contact.channels.whatsappNote'),
      short: 'WhatsApp',
      href: contactLinks.whatsapp,
      external: true,
    },
    {
      id: 'email',
      icon: Mail,
      label: t('contact.channels.email'),
      value: CONTACT_EMAIL,
      short: t('contact.channels.email'),
      href: contactLinks.email,
      copyValue: CONTACT_EMAIL,
    },
  ]
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard blocked: the value is still on screen to select by hand
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={t('contact.channels.copy', { label })}
        className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-mono text-[10px] font-medium uppercase tracking-wider transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 ${
          copied ? 'text-ember' : 'text-text-muted hover:text-text-heading hover:bg-white/5'
        }`}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied && <span aria-hidden="true">{t('contact.channels.copied')}</span>}
      </button>
      <span role="status" className="sr-only">
        {copied ? t('contact.channels.copied') : ''}
      </span>
    </>
  )
}

/** Every direct way to reach Flintworks, one tappable row each. */
export function ContactChannels() {
  const channels = useChannels()

  return (
    <ul className="space-y-2.5">
      {channels.map(({ id, icon: Icon, label, value, href, external, copyValue, featured }) => (
        <li
          key={id}
          className={`group flex items-center gap-1 rounded-xl border p-1.5 transition-all duration-200 ${
            featured
              ? 'border-ember/40 bg-ember/[0.07] hover:border-ember/70 ember-glow-hover'
              : 'border-border bg-surface/60 hover:border-ember/30'
          }`}
        >
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/60"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                featured ? 'border-ember bg-ember text-white' : 'border-ember/20 bg-ember/10 text-ember'
              }`}
            >
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-[10px] font-medium uppercase tracking-wider text-text-muted">
                {label}
              </span>
              <span className="block truncate text-sm text-text-heading group-hover:text-ember transition-colors duration-150">
                {value}
              </span>
            </span>
            {external && (
              <ArrowUpRight
                size={16}
                className="mr-1.5 shrink-0 text-text-muted group-hover:text-ember transition-colors duration-150"
                aria-hidden="true"
              />
            )}
          </a>
          {copyValue && <CopyButton value={copyValue} label={label} />}
        </li>
      ))}
    </ul>
  )
}

/** The same channels as compact pills, for small screens where the full list sits below the form. */
export function ContactQuickActions() {
  const channels = useChannels()

  return (
    <ul className="flex flex-wrap gap-2">
      {channels.map(({ id, icon: Icon, short, href, external, featured }) => (
        <li key={id}>
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm font-medium text-text-heading transition-all duration-150 ${
              featured
                ? 'border-ember/50 bg-ember/10 hover:bg-ember/20'
                : 'border-border bg-surface/80 hover:border-ember/40 hover:bg-ember/5'
            }`}
          >
            <Icon size={15} className="text-ember" />
            {short}
          </a>
        </li>
      ))}
    </ul>
  )
}
