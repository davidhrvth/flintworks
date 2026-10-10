'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  MarketingNotifySubmitError,
  submitMarketingNotify,
} from '@/api/marketingNotify'

interface MarketingNotifyFormProps {
  className?: string
  layout?: 'inline' | 'stacked'
}

export function MarketingNotifyForm({ className = '', layout = 'inline' }: MarketingNotifyFormProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'submitting') return
    const trimmed = email.trim()
    if (!trimmed) return

    setStatus('submitting')
    try {
      await submitMarketingNotify(trimmed)
      setStatus('success')
    } catch (error) {
      console.error(error instanceof MarketingNotifySubmitError ? error.message : error)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-2 text-ember font-semibold text-sm ${className}`}>
        <CheckCircle size={16} className="shrink-0" />
        {t('marketing.notifySuccess')}
      </div>
    )
  }

  const fields = (
    <>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (status === 'error') setStatus('idle')
        }}
        placeholder={t('marketing.notifyPlaceholder')}
        required
        disabled={status === 'submitting'}
        className="flex-1 min-w-0 w-full px-4 py-2.5 rounded-lg bg-background border border-border text-text-heading text-sm placeholder:text-text-muted focus:outline-none focus:border-ember/40 transition-colors disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === 'submitting'}
        className={
          layout === 'inline'
            ? 'shrink-0 px-5 py-2.5 rounded-lg bg-ember text-white text-sm font-semibold hover:bg-flame transition-colors disabled:opacity-60'
            : 'w-full py-2.5 rounded-lg bg-ember text-white text-sm font-semibold hover:bg-flame transition-colors disabled:opacity-60'
        }
      >
        {t('marketing.notifyButton')}
      </button>
    </>
  )

  return (
    <div className={className}>
      <form
        onSubmit={handleSubmit}
        className={layout === 'inline' ? 'flex gap-2' : 'space-y-2'}
      >
        {fields}
      </form>
      {status === 'error' && (
        <p className="mt-2 text-sm text-flame" role="alert">
          {t('marketing.notifyError')}
        </p>
      )}
    </div>
  )
}
