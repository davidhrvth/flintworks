'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Send, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { submitContactForm, type ContactFormData } from '@/api/contact'

const inputClass =
  'w-full px-4 py-3 rounded-lg bg-surface border border-border text-text-heading placeholder-text-muted text-sm focus:outline-none focus:border-ember/50 focus:ring-1 focus:ring-ember/30 transition-all duration-150'
const labelClass = 'block font-mono text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider'

export function ContactForm() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const [form, setForm] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    service: '',
    budget: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const serviceOptions = [
    { value: '', label: t('form.services.placeholder') },
    { value: 'web-app', label: t('form.services.webApp') },
    { value: 'business-website', label: t('form.services.businessWebsite') },
    { value: 'mobile-app', label: t('form.services.mobileApp') },
    { value: 'startup', label: t('form.services.startup') },
    { value: 'other', label: t('form.services.other') },
  ]

  const budgetOptions = [
    { value: '', label: t('form.budgets.placeholder') },
    { value: 'under-5k', label: t('form.budgets.under5k') },
    { value: '5k-15k', label: t('form.budgets.5kTo15k') },
    { value: '15k-50k', label: t('form.budgets.15kTo50k') },
    { value: 'over-50k', label: t('form.budgets.over50k') },
    { value: 'unknown', label: t('form.budgets.unknown') },
  ]

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.service || !form.message) {
      setError(t('form.validation'))
      return
    }
    setSubmitting(true)
    try {
      await submitContactForm(form)
      setSuccess(true)
    } catch {
      setError(t('form.error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center text-center py-16 gap-6"
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-ember/30"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
          <div className="relative w-16 h-16 rounded-full bg-ember/10 border border-ember/30 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-ember" />
          </div>
        </div>
        <div>
          <h3 className="font-display font-bold text-2xl text-text-heading mb-2">{t('form.success.heading')}</h3>
          <p className="text-text-body">{t('form.success.body')}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className={labelClass}>
            {t('form.name')} <span className="text-ember">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder={t('form.namePlaceholder')}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            {t('form.email')} <span className="text-ember">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t('form.emailPlaceholder')}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="company" className={labelClass}>
          {t('form.company')} <span className="text-text-muted font-normal normal-case">{t('form.companyOptional')}</span>
        </label>
        <input
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          value={form.company}
          onChange={handleChange}
          placeholder={t('form.companyPlaceholder')}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="service" className={labelClass}>
            {t('form.service')} <span className="text-ember">*</span>
          </label>
          <select
            id="service"
            name="service"
            value={form.service}
            onChange={handleChange}
            className={inputClass}
            required
          >
            {serviceOptions.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={!opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="budget" className={labelClass}>
            {t('form.budget')}
          </label>
          <select
            id="budget"
            name="budget"
            value={form.budget}
            onChange={handleChange}
            className={inputClass}
          >
            {budgetOptions.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={!opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          {t('form.message')} <span className="text-ember">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder={t('form.messagePlaceholder')}
          className={`${inputClass} resize-none`}
          required
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-lg bg-ember text-white font-semibold text-sm hover:bg-flame disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 group"
      >
        {submitting ? (
          <>
            <motion.div
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            {t('form.sending')}
          </>
        ) : (
          <>
            <Send size={15} />
            {t('form.sendIt')}
          </>
        )}
      </button>
    </form>
  )
}
