import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface MarketingNotifyFormProps {
  className?: string
  layout?: 'inline' | 'stacked'
}

export function MarketingNotifyForm({ className = '', layout = 'inline' }: MarketingNotifyFormProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    // TODO: wire up to your email list provider
    const existing: string[] = JSON.parse(localStorage.getItem('flintworks_marketing_notify') || '[]')
    localStorage.setItem('flintworks_marketing_notify', JSON.stringify([...existing, email.trim()]))

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className={`flex items-center gap-2 text-ember font-semibold text-sm ${className}`}>
        <CheckCircle size={16} className="shrink-0" />
        {t('marketing.notifySuccess')}
      </div>
    )
  }

  if (layout === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('marketing.notifyPlaceholder')}
          required
          className="flex-1 min-w-0 px-4 py-2.5 rounded-lg bg-background border border-border text-text-heading text-sm placeholder:text-text-muted focus:outline-none focus:border-ember/40 transition-colors"
        />
        <button
          type="submit"
          className="shrink-0 px-5 py-2.5 rounded-lg bg-ember text-white text-sm font-semibold hover:bg-flame transition-colors"
        >
          {t('marketing.notifyButton')}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('marketing.notifyPlaceholder')}
        required
        className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-text-heading text-sm placeholder:text-text-muted focus:outline-none focus:border-ember/40 transition-colors"
      />
      <button
        type="submit"
        className="w-full py-2.5 rounded-lg bg-ember text-white text-sm font-semibold hover:bg-flame transition-colors"
      >
        {t('marketing.notifyButton')}
      </button>
    </form>
  )
}
