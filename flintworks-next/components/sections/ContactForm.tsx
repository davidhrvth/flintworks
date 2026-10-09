'use client'

import {
  Suspense,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, CheckCircle2, Clock, Flame } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { submitContactForm, ContactSubmitError } from '@/api/contact'
import { CONTACT_EMAIL } from '@/config/contact'
import { contactTopics, isContactTopicId, type ContactTopicId } from '@/data/contact'

// text-base below sm: iOS zooms the page when a focused input is under 16px
const inputClass =
  'w-full px-4 py-3 rounded-lg bg-surface border border-border text-text-heading placeholder-text-muted text-base sm:text-sm focus:outline-none focus:border-ember/50 focus:ring-1 focus:ring-ember/30 transition-all duration-150'
const invalidClass = 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/30'
const labelClass = 'block font-mono text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider'

interface FormValues {
  topic: ContactTopicId | ''
  message: string
  name: string
  email: string
  company: string
}

const EMPTY: FormValues = { topic: '', message: '', name: '', email: '', company: '' }

type Field = 'topic' | 'message' | 'name' | 'email'
const FIELD_ORDER: Field[] = ['topic', 'message', 'name', 'email']

type Status = 'idle' | 'submitting' | 'success' | 'error'
type Failure = 'rejected' | 'rateLimited' | 'server'

// Same rule and limits the backend applies, so a field is flagged here instead of
// the whole submission bouncing.
const EMAIL_PATTERN = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i
const NAME_MAX = 200
const EMAIL_MAX = 320
const MESSAGE_MAX = 5000

function findProblems(values: FormValues): Partial<Record<Field, string>> {
  const problems: Partial<Record<Field, string>> = {}
  if (!values.topic) problems.topic = 'form.errors.topic'
  if (!values.message.trim()) problems.message = 'form.errors.message'
  if (!values.name.trim()) problems.name = 'form.errors.name'
  if (!values.email.trim()) problems.email = 'form.errors.emailMissing'
  else if (!EMAIL_PATTERN.test(values.email.trim())) problems.email = 'form.errors.emailInvalid'
  return problems
}

// The draft lives in sessionStorage so a half-written message survives a detour
// to another page (pricing, services) or a reload, and is gone when the tab closes.
const DRAFT_KEY = 'fw_contact_draft'
const subscribeToNothing = () => () => {}

function readDraftJson(): string | null {
  try {
    return window.sessionStorage.getItem(DRAFT_KEY)
  } catch {
    return null
  }
}

function parseDraft(json: string | null): FormValues | null {
  if (!json) return null
  try {
    const saved = JSON.parse(json) as Record<string, unknown>
    const text = (key: string) => (typeof saved[key] === 'string' ? (saved[key] as string) : '')
    return {
      topic: isContactTopicId(saved.topic) ? saved.topic : '',
      message: text('message'),
      name: text('name'),
      email: text('email'),
      company: text('company'),
    }
  } catch {
    return null
  }
}

function writeDraft(values: FormValues | null) {
  try {
    if (values) window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values))
    else window.sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // storage unavailable (private mode, quota): the form still works without a draft
  }
}

/** Picks the topic named in `/contact?service=...`, the way pricing and services link here. */
function TopicFromUrl({ onTopic }: { onTopic: (topic: ContactTopicId) => void }) {
  const requested = useSearchParams().get('service')
  const pick = useEffectEvent(onTopic)

  useEffect(() => {
    if (!isContactTopicId(requested)) return
    pick(requested)
    // The pick now lives in the form and its draft. Drop it from the URL so coming
    // back to this history entry can't override whatever was chosen afterwards.
    const url = new URL(window.location.href)
    url.searchParams.delete('service')
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
  }, [requested])

  return null
}

type StepState = 'done' | 'active' | 'pending'

const stepNodeStyles: Record<StepState, string> = {
  done: 'border-ember bg-ember text-white',
  active: 'border-ember/60 bg-ember/10 text-ember shadow-[0_0_18px_rgba(255,77,0,0.35)]',
  pending: 'border-border bg-surface text-text-muted',
}

interface StepProps {
  number: string
  title: string
  titleId: string
  state: StepState
  last?: boolean
  children: ReactNode
}

function Step({ number, title, titleId, state, last = false, children }: StepProps) {
  return (
    <section aria-labelledby={titleId} className={`relative sm:pl-14 ${last ? '' : 'pb-10'}`}>
      {!last && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-4 top-8 hidden w-px -translate-x-1/2 bg-border sm:block"
        >
          <span
            className={`absolute inset-0 origin-top bg-gradient-to-b from-ember to-flame transition-transform duration-500 ${
              state === 'done' ? 'scale-y-100' : 'scale-y-0'
            }`}
          />
        </span>
      )}
      <div className="mb-5 flex items-center gap-3 sm:-ml-14 sm:gap-6">
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-bold transition-all duration-300 ${stepNodeStyles[state]}`}
        >
          {state === 'done' ? <Check size={14} strokeWidth={3} /> : number}
        </span>
        <h2 id={titleId} className="font-display font-bold text-xl text-text-heading">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1.5 text-xs text-red-400">
      {message}
    </p>
  )
}

interface ContactFormProps {
  /** Called once a message has been accepted by the backend. */
  onSent?: () => void
}

export function ContactForm({ onSent }: ContactFormProps) {
  const { t, i18n } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const successHeadingRef = useRef<HTMLHeadingElement>(null)

  const draftJson = useSyncExternalStore(subscribeToNothing, readDraftJson, () => null)
  const draft = useMemo(() => parseDraft(draftJson), [draftJson])
  const [edits, setEdits] = useState<FormValues | null>(null)
  const values = edits ?? draft ?? EMPTY

  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [attempted, setAttempted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [failure, setFailure] = useState<Failure | null>(null)
  const [sent, setSent] = useState<Pick<FormValues, 'name' | 'email' | 'company'> | null>(null)

  const update = (patch: Partial<FormValues>) => {
    const next = { ...(edits ?? parseDraft(readDraftJson()) ?? EMPTY), ...patch }
    setEdits(next)
    writeDraft(next)
    if (status === 'error') setStatus('idle')
  }

  const markTouched = (field: Field) => setTouched((prev) => ({ ...prev, [field]: true }))

  const problems = findProblems(values)
  const errorFor = (field: Field) => {
    const key = attempted || touched[field] ? problems[field] : undefined
    return key ? t(key) : undefined
  }

  const stepDone = [!problems.topic, !problems.message, !problems.name && !problems.email]
  const activeStep = stepDone.indexOf(false)
  const stepState = (index: number): StepState =>
    stepDone[index] ? 'done' : index === activeStep ? 'active' : 'pending'

  const isHu = i18n.language.startsWith('hu')
  const priceOf = (tier: string) => t(`pricing.tiers.${tier}.${isHu ? 'priceHUF' : 'price'}`)
  const topicHint = (topic: ContactTopicId) =>
    t(`form.topics.${topic}.hint`, {
      price: priceOf(topic === 'discovery' ? 'discovery' : 'website'),
    })

  useEffect(() => {
    if (status !== 'success') return
    const root = rootRef.current
    // The confirmation is far shorter than the form, so on a phone it can end up
    // above the viewport. Bring it back and hand focus to it.
    if (root && root.getBoundingClientRect().top < 96) {
      root.scrollIntoView({ block: 'start', behavior: shouldReduceMotion ? 'instant' : 'smooth' })
    }
    successHeadingRef.current?.focus({ preventScroll: true })
  }, [status, shouldReduceMotion])

  const focusField = (field: Field) => {
    const target = document.getElementById(field === 'topic' ? `topic-${contactTopics[0].id}` : field)
    target?.scrollIntoView({ block: 'center', behavior: shouldReduceMotion ? 'instant' : 'smooth' })
    target?.focus({ preventScroll: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'submitting') return

    const firstProblem = FIELD_ORDER.find((field) => problems[field])
    if (firstProblem) {
      setAttempted(true)
      focusField(firstProblem)
      return
    }

    const name = values.name.trim()
    const email = values.email.trim()
    const company = values.company.trim()

    setStatus('submitting')
    setFailure(null)
    try {
      await submitContactForm({
        name,
        email,
        company: company || undefined,
        service: values.topic,
        message: values.message.trim(),
      })
      setSent({ name, email, company })
      writeDraft(null)
      setEdits(null)
      setTouched({})
      setAttempted(false)
      setStatus('success')
      onSent?.()
    } catch (error) {
      const code = error instanceof ContactSubmitError ? error.status : 0
      setFailure(code === 400 ? 'rejected' : code === 429 ? 'rateLimited' : 'server')
      setStatus('error')
    }
  }

  const sendAnother = () => {
    if (sent) update({ ...EMPTY, ...sent })
    setStatus('idle')
  }

  // Fallback for when the backend can't take the message: the same text, ready to
  // send from the visitor's own mail client. Long bodies get cut by some clients.
  const mailtoHref = () => {
    const topicLabel = values.topic ? t(`form.topics.${values.topic}.label`) : ''
    const subject = [topicLabel, values.name.trim()].filter(Boolean).join(' - ')
    const signature = [values.name.trim(), values.company.trim()].filter(Boolean).join(', ')
    const body = [values.message.trim().slice(0, 1500), signature].filter(Boolean).join('\n\n')
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  if (status === 'success' && sent) {
    return (
      <div ref={rootRef} className="scroll-mt-28">
        <motion.div
          role="status"
          className="flex flex-col items-center justify-center text-center py-10 sm:py-14 gap-6"
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
            <h2
              ref={successHeadingRef}
              tabIndex={-1}
              className="font-display font-bold text-2xl sm:text-3xl text-text-heading mb-2 focus:outline-none"
            >
              {t('form.success.heading')}
            </h2>
            <p className="text-text-body">{t('form.success.body', { name: sent.name })}</p>
            <p className="mt-1 text-sm text-text-muted break-words">
              {t('form.success.confirmation', { email: sent.email })}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-ember text-white font-semibold text-sm hover:bg-flame transition-colors group"
            >
              {t('form.success.seeWork')}
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button
              type="button"
              onClick={sendAnother}
              className="inline-flex items-center px-6 py-3 rounded-lg border border-border text-text-heading font-semibold text-sm hover:border-ember/40 hover:bg-ember/5 transition-all duration-150"
            >
              {t('form.success.again')}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const topicError = errorFor('topic')
  const messageError = errorFor('message')
  const nameError = errorFor('name')
  const emailError = errorFor('email')
  const submitting = status === 'submitting'

  return (
    <div ref={rootRef} className="scroll-mt-28">
      <form onSubmit={handleSubmit} noValidate>
        <Suspense fallback={null}>
          <TopicFromUrl onTopic={(topic) => update({ topic })} />
        </Suspense>

        <Step number="01" title={t('form.steps.topic')} titleId="contact-step-topic" state={stepState(0)}>
          <div
            role="radiogroup"
            aria-labelledby="contact-step-topic"
            aria-required="true"
            aria-invalid={topicError ? true : undefined}
            aria-describedby={topicError ? 'topic-error' : undefined}
            className="grid grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {contactTopics.map(({ id, icon: Icon }) => {
              const checked = values.topic === id
              return (
                <label key={id} className="relative cursor-pointer">
                  <input
                    type="radio"
                    id={`topic-${id}`}
                    name="service"
                    value={id}
                    checked={checked}
                    onChange={() => update({ topic: id })}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex h-full flex-col gap-3 rounded-xl border p-4 transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-ember/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background ${
                      checked
                        ? 'border-ember/70 bg-ember/[0.07] shadow-[0_0_30px_rgba(255,77,0,0.2),0_0_60px_rgba(255,77,0,0.08)]'
                        : 'border-border bg-surface/70 hover:-translate-y-0.5 hover:border-ember/30'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-200 ${
                          checked ? 'border-ember bg-ember text-white' : 'border-ember/20 bg-ember/10 text-ember'
                        }`}
                      >
                        <Icon size={18} />
                      </span>
                      {checked && (
                        <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-ember text-white">
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full bg-ember/60 animate-spark-burst"
                          />
                          <Check size={12} strokeWidth={3} className="relative" />
                        </span>
                      )}
                    </span>
                    <span>
                      <span className="block font-display font-semibold text-[15px] text-text-heading leading-snug break-words">
                        {t(`form.topics.${id}.label`)}
                      </span>
                      <span className="mt-1 block text-xs text-text-muted leading-snug">
                        {t(`form.topics.${id}.description`)}
                      </span>
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
          <FieldError id="topic-error" message={topicError} />

          <AnimatePresence initial={false}>
            {values.topic && (
              <motion.div
                className="overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' }}
              >
                <p
                  aria-live="polite"
                  className="mt-3 flex items-start gap-2.5 rounded-lg border border-ember/20 bg-ember/5 px-4 py-3 text-sm text-text-body leading-relaxed"
                >
                  <Flame size={15} className="text-ember mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{topicHint(values.topic)}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Step>

        <Step number="02" title={t('form.steps.message')} titleId="contact-step-message" state={stepState(1)}>
          <textarea
            id="message"
            name="message"
            rows={5}
            maxLength={MESSAGE_MAX}
            value={values.message}
            onChange={(e) => update({ message: e.target.value })}
            onBlur={() => markTouched('message')}
            placeholder={t(values.topic ? `form.topics.${values.topic}.placeholder` : 'form.messagePlaceholder')}
            aria-labelledby="contact-step-message"
            aria-describedby={messageError ? 'message-error message-help' : 'message-help'}
            aria-invalid={messageError ? true : undefined}
            className={`${inputClass} min-h-32 resize-y leading-relaxed ${messageError ? invalidClass : ''}`}
            required
          />
          <FieldError id="message-error" message={messageError} />
          <p id="message-help" className="mt-2 text-xs text-text-muted leading-relaxed">
            {t('form.messageHelp')}
          </p>
        </Step>

        <Step number="03" title={t('form.steps.details')} titleId="contact-step-details" state={stepState(2)} last>
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
                maxLength={NAME_MAX}
                value={values.name}
                onChange={(e) => update({ name: e.target.value })}
                onBlur={() => markTouched('name')}
                placeholder={t('form.namePlaceholder')}
                aria-describedby={nameError ? 'name-error' : undefined}
                aria-invalid={nameError ? true : undefined}
                className={`${inputClass} ${nameError ? invalidClass : ''}`}
                required
              />
              <FieldError id="name-error" message={nameError} />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                {t('form.email')} <span className="text-ember">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={EMAIL_MAX}
                value={values.email}
                onChange={(e) => update({ email: e.target.value })}
                onBlur={() => markTouched('email')}
                placeholder={t('form.emailPlaceholder')}
                aria-describedby={emailError ? 'email-error' : undefined}
                aria-invalid={emailError ? true : undefined}
                className={`${inputClass} ${emailError ? invalidClass : ''}`}
                required
              />
              <FieldError id="email-error" message={emailError} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="company" className={labelClass}>
                {t('form.company')}{' '}
                <span className="text-text-muted font-normal normal-case">{t('form.companyOptional')}</span>
              </label>
              <input
                id="company"
                name="company"
                type="text"
                autoComplete="organization"
                maxLength={NAME_MAX}
                value={values.company}
                onChange={(e) => update({ company: e.target.value })}
                placeholder={t('form.companyPlaceholder')}
                className={inputClass}
              />
            </div>
          </div>

          {attempted && activeStep !== -1 && (
            <p role="alert" className="mt-5 text-sm text-red-400">
              {t('form.errors.summary')}
            </p>
          )}

          {status === 'error' && failure && (
            <div
              role="alert"
              className="mt-5 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"
            >
              <p>{t(`form.errors.${failure}`)}</p>
              <a
                href={mailtoHref()}
                className="mt-2 inline-flex items-center gap-1.5 font-semibold text-text-heading underline underline-offset-4 decoration-ember hover:text-ember transition-colors"
              >
                {t('form.emailInstead')}
                <ArrowRight size={13} />
              </a>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-ember text-white font-semibold text-sm hover:bg-flame disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 group"
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
                  {t('form.send')}
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
            <p className="flex items-center gap-2 text-xs text-text-muted">
              <Clock size={13} className="shrink-0" />
              {t('contact.info.response')}
            </p>
          </div>
        </Step>
      </form>
    </div>
  )
}
