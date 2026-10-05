'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Check, Copy, RotateCcw } from 'lucide-react'
import { BADGE_CSS, badgeHtml, badgeSnippet, type BadgeLabel, type BadgeOptions, type BadgeTheme } from './badge'
import { AnimatedLockup, ANIM_CSS, ANIM_VARIANTS, FINAL_CONCEPT, type AnimVariant } from './final-mark'
import { PALETTES, type ThemeKey } from './marks'
import type { Round } from './rounds'
import { copyText, Eyebrow, OgCard, RoundIntro, SectionTitle, Stage, THEMES, Toolbar, voteGlyph, VoteButtons, type Vote } from './ui'
import { Lockup, WORDMARKS } from './wordmarks'

type NameStyle = 'wide' | 'terminal'

type FinalFeedback = {
  votes: Record<string, Vote>
  notes: string
  badge: BadgeOptions
}

const DEFAULT_FEEDBACK: FinalFeedback = {
  votes: {},
  notes: '',
  badge: { theme: 'dark', wordmark: 'wide', label: 'name', project: 'northside-coffee' },
}

// Rendered only on the client (never during SSR), so reading storage here is safe.
function load(key: string): FinalFeedback {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...DEFAULT_FEEDBACK, ...JSON.parse(raw) } : DEFAULT_FEEDBACK
  } catch {
    return DEFAULT_FEEDBACK
  }
}

const NAME_STYLES: NameStyle[] = ['wide', 'terminal']
const BADGE_THEMES: { key: BadgeTheme; label: string }[] = [
  { key: 'dark', label: 'Dark' },
  { key: 'light', label: 'Light' },
  { key: 'ghost', label: 'Ghost' },
]
const BADGE_LABELS: { key: BadgeLabel; label: string }[] = [
  { key: 'name', label: 'Name only' },
  { key: 'quote', label: 'Name + get a quote' },
]

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { key: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-muted">{label}</span>
      <div className="flex rounded-lg border border-border p-0.5 w-fit" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={value === o.key}
            onClick={() => onChange(o.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              value === o.key ? 'bg-surface text-text-heading' : 'text-text-muted hover:text-text-heading'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Badge({ o, open = false }: { o: BadgeOptions; open?: boolean }) {
  // Markup comes from our own generator; the only user input (project) is slugged to [a-z0-9-].
  return <span className="inline-flex" dangerouslySetInnerHTML={{ __html: badgeHtml(o, open) }} />
}

function ClientFooter({ dark, brand, legal, children }: { dark: boolean; brand: string; legal: string; children: ReactNode }) {
  const text = dark ? '#9AA3AD' : '#55514B'
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: dark ? '#101418' : '#F7F4EF', color: text }}>
      <div className="px-6 pt-8 pb-6 grid sm:grid-cols-[1.4fr_1fr_1fr] gap-6 text-sm">
        <div>
          <div className="font-semibold text-base" style={{ color: dark ? '#E8ECEF' : '#1E1B18' }}>
            {brand}
          </div>
          <p className="mt-2 text-xs leading-relaxed max-w-[16rem]">A client site you shipped. The badge sits where a credit line normally would.</p>
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <span>Shop</span>
          <span>About</span>
          <span>Journal</span>
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <span>Contact</span>
          <span>Instagram</span>
          <span>Newsletter</span>
        </div>
      </div>
      <div className="px-6 py-4 flex items-center justify-between gap-4 text-xs" style={{ borderTop: `1px solid ${dark ? '#1E252C' : '#E6E0D6'}` }}>
        <span className="min-w-0 truncate">{legal}</span>
        <span className="shrink-0">{children}</span>
      </div>
    </div>
  )
}

export function FinalRound({ round, theme, onTheme, onRound }: { round: Round; theme: ThemeKey; onTheme: (t: ThemeKey) => void; onRound: (id: string) => void }) {
  const [fb, setFb] = useState<FinalFeedback>(() => load(round.storageKey))
  const [plays, setPlays] = useState<Record<AnimVariant, number>>({ knap: 0, strike: 0, sweep: 0 })
  const [copied, setCopied] = useState<'feedback' | 'snippet' | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(round.storageKey, JSON.stringify(fb))
    } catch {
      // Private mode / blocked storage — feedback still works for this visit.
    }
  }, [fb, round.storageKey])

  const p = PALETTES[theme]
  const c = FINAL_CONCEPT
  const badge = fb.badge
  const name = badge.wordmark
  const vote = (key: string) => fb.votes[key] ?? null
  const setVote = (key: string, v: Vote) => setFb((prev) => ({ ...prev, votes: { ...prev.votes, [key]: v } }))
  const setBadge = (patch: Partial<BadgeOptions>) => setFb((prev) => ({ ...prev, badge: { ...prev.badge, ...patch } }))
  const replay = (k: AnimVariant) => setPlays((prev) => ({ ...prev, [k]: prev[k] + 1 }))
  const loved = Object.values(fb.votes).filter((v) => v === 'love').length
  const snippet = badgeSnippet(badge)

  async function copy(kind: 'feedback' | 'snippet', text: string) {
    if (await copyText(text)) {
      setCopied(kind)
      setTimeout(() => setCopied(null), 1800)
    }
  }

  function feedbackText() {
    const line = (key: string, label: string) => (vote(key) ? `${voteGlyph(vote(key))} ${label}` : null)
    const group = (title: string, items: (string | null)[]) => {
      const kept = items.filter(Boolean)
      return kept.length ? [`${title}: ${kept.join(' · ')}`] : []
    }
    return [
      `Flintworks logo lab — round ${round.id}`,
      '',
      ...group('Name', NAME_STYLES.map((k) => line(`wm-${k}`, `${WORDMARKS[k].letter} ${WORDMARKS[k].name}`))),
      ...group('Animation', ANIM_VARIANTS.map((a) => line(`anim-${a.key}`, a.name))),
      ...group('Badge label', BADGE_LABELS.map((l) => line(`badge-${l.key}`, l.label))),
      `Badge I set up: ${badge.theme} · ${WORDMARKS[badge.wordmark].letter} · ${badge.label}`,
      ...(fb.notes.trim() ? ['', `Notes: ${fb.notes.trim()}`] : []),
    ].join('\n')
  }

  const nameOptions = NAME_STYLES.map((k) => ({ key: k, label: `${WORDMARKS[k].letter} · ${WORDMARKS[k].name}` }))

  return (
    <>
      <style>{ANIM_CSS + BADGE_CSS}</style>
      <Toolbar round={round} onRound={onRound} theme={theme} onTheme={onTheme} onCopy={() => copy('feedback', feedbackText())} copied={copied === 'feedback'} loved={loved} />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <RoundIntro round={round} />
      </section>

      {/* A vs F */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <SectionTitle eyebrow="01 · The name" title="A or F, side by side.">
          Same mark, same surfaces. Look at them at the size people will actually see them — the header and the link preview — not just the big version.
        </SectionTitle>
        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          {NAME_STYLES.map((k) => (
            <article key={k} className={`rounded-2xl border bg-surface p-5 flex flex-col gap-3 ${vote(`wm-${k}`) === 'love' ? 'border-ember/60 ember-glow' : 'border-border'}`}>
              <header className="flex items-start justify-between gap-4">
                <div>
                  <Eyebrow>{WORDMARKS[k].letter}</Eyebrow>
                  <h3 className="font-display font-bold text-2xl text-text-heading mt-1">{WORDMARKS[k].name}</h3>
                </div>
                <VoteButtons vote={vote(`wm-${k}`)} onVote={(v) => setVote(`wm-${k}`, v)} />
              </header>
              <Stage p={p} className="grid place-items-center py-12 px-4 overflow-hidden">
                <Lockup concept={c} wordmark={k} height={52} p={p} />
              </Stage>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.filter((t) => t.key !== theme).map((t) => (
                  <Stage key={t.key} p={PALETTES[t.key]} className="grid place-items-center py-6 px-2 overflow-hidden">
                    <Lockup concept={c} wordmark={k} height={24} p={PALETTES[t.key]} />
                  </Stage>
                ))}
              </div>
              <div className="rounded-xl border border-border overflow-hidden" style={{ background: '#0A0A0B' }}>
                <div className="flex items-center justify-between gap-4 px-5 h-14">
                  <Lockup concept={c} wordmark={k} height={24} p={PALETTES.dark} />
                  <span className="px-3 py-1.5 rounded-md text-xs font-semibold bg-ember text-white">Start a Project</span>
                </div>
              </div>
              <OgCard c={c} wm={k} />
            </article>
          ))}
        </div>
      </section>

      {/* Animation */}
      <section className="border-t border-border bg-surface/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <SectionTitle eyebrow="02 · Logo animation" title="How it arrives.">
            For the site’s first load, video intros and socials. Each one ends on the exact static logo, so it can sit anywhere the logo sits. Built from plain SVG + CSS keyframes — no animation library needed.
          </SectionTitle>
          <div className="flex flex-wrap items-end gap-4 mb-8">
            <Segmented label="Name style" value={name} options={nameOptions} onChange={(w) => setBadge({ wordmark: w })} />
            <button
              type="button"
              onClick={() => setPlays((prev) => ({ knap: prev.knap + 1, strike: prev.strike + 1, sweep: prev.sweep + 1 }))}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-text-heading hover:border-ember/50 hover:bg-ember/5 transition-colors"
            >
              <RotateCcw size={13} /> Replay all
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {ANIM_VARIANTS.map((a) => (
              <div
                key={a.key}
                className={`rounded-2xl border bg-surface p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center gap-4 ${vote(`anim-${a.key}`) === 'love' ? 'border-ember/60' : 'border-border'}`}
              >
                <Stage p={p} className="lg:w-[60%] shrink-0 grid place-items-center px-6 py-14 overflow-hidden">
                  <AnimatedLockup variant={a.key} wordmark={name} height={64} p={p} playKey={plays[a.key]} />
                </Stage>
                <div className="flex-1 min-w-0 px-1">
                  <div className="font-display font-bold text-xl text-text-heading">{a.name}</div>
                  <p className="text-sm text-text-body mt-1 leading-relaxed">{a.note}</p>
                </div>
                <div className="flex lg:flex-col items-center gap-2 px-1">
                  <VoteButtons vote={vote(`anim-${a.key}`)} onVote={(v) => setVote(`anim-${a.key}`, v)} />
                  <button
                    type="button"
                    onClick={() => replay(a.key)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text-muted hover:text-text-heading transition-colors"
                  >
                    <RotateCcw size={12} /> Replay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Badge */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <SectionTitle eyebrow="03 · Client-site badge" title="Built by Flintworks.">
            Every site you ship becomes a lead source. Collapsed it’s just the mark; hover it and it spells out the name and points to your quote page. It’s one
            HTML + CSS snippet — no JavaScript, no fonts, no external requests — so it works on anything, from a static page to a React app.
          </SectionTitle>

          <div className="flex flex-wrap items-end gap-5 mb-8">
            <Segmented label="Name style" value={name} options={nameOptions} onChange={(w) => setBadge({ wordmark: w })} />
            <Segmented label="Badge theme" value={badge.theme} options={BADGE_THEMES} onChange={(t) => setBadge({ theme: t })} />
            <Segmented label="Label" value={badge.label} options={BADGE_LABELS} onChange={(l) => setBadge({ label: l })} />
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-muted">Project (for analytics)</span>
              <input
                value={badge.project}
                onChange={(e) => setBadge({ project: e.target.value })}
                className="h-[34px] w-48 rounded-lg bg-background border border-border px-3 text-xs font-mono text-text-heading focus:outline-none focus:border-ember/50"
              />
            </label>
          </div>

          <p className="font-mono text-xs text-ember mb-3">↓ Hover the badges (or tab to them)</p>
          <div className="grid lg:grid-cols-2 gap-4">
            <ClientFooter dark={false} brand="Northside Coffee" legal="© 2026 Northside Coffee Roasters · Privacy · Imprint">
              <Badge o={badge} />
            </ClientFooter>
            <ClientFooter dark brand="Atlas Freight" legal="© 2026 Atlas Freight Kft. · Terms · Privacy">
              <Badge o={badge} />
            </ClientFooter>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <Eyebrow>Every theme, collapsed → open</Eyebrow>
              <span className="font-mono text-[10px] text-text-muted">Phones have no hover, so there it shows open by default.</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {BADGE_THEMES.map((t) => {
                const dark = t.key !== 'light'
                return (
                  <div key={t.key} className="rounded-xl p-5 flex flex-col items-start gap-3" style={{ background: dark ? '#15181C' : '#F2EEE8', color: dark ? '#DDE3E8' : '#2A2622' }}>
                    <span className="font-mono text-[10px] uppercase tracking-wider opacity-60">{t.label}</span>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge o={{ ...badge, theme: t.key }} />
                      <span className="opacity-40 text-xs">→</span>
                      <Badge o={{ ...badge, theme: t.key }} open />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-muted">Which label?</span>
              {BADGE_LABELS.map((l) => (
                <div key={l.key} className="flex items-center gap-2 text-sm text-text-body">
                  <VoteButtons size={30} vote={vote(`badge-${l.key}`)} onVote={(v) => setVote(`badge-${l.key}`, v)} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-surface overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-border">
              <div className="flex items-baseline gap-3">
                <Eyebrow>The snippet</Eyebrow>
                <span className="font-mono text-[10px] text-text-muted">{(new Blob([snippet]).size / 1024).toFixed(1)} KB · paste before &lt;/footer&gt;</span>
              </div>
              <button
                type="button"
                onClick={() => copy('snippet', snippet)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-ember text-white hover:bg-flame transition-colors"
              >
                {copied === 'snippet' ? <Check size={13} /> : <Copy size={13} />}
                {copied === 'snippet' ? 'Copied' : 'Copy snippet'}
              </button>
            </div>
            <pre className="max-h-64 overflow-auto p-5 text-[11px] leading-relaxed font-mono text-text-muted whitespace-pre-wrap break-all">{snippet}</pre>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="border-t border-border bg-surface/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <SectionTitle eyebrow="Anything else" title="Last calls.">
            Once you’ve picked A or F and an animation, I’ll export the final kit: SVG + PNG logos, favicons, the animation as a drop-in component, and the badge.
          </SectionTitle>
          <textarea
            value={fb.notes}
            onChange={(e) => setFb((prev) => ({ ...prev, notes: e.target.value }))}
            rows={4}
            placeholder="e.g. F everywhere except the business card. Knap is the one, but faster…"
            className="w-full resize-y rounded-xl bg-background border border-border px-4 py-3 text-text-heading placeholder:text-text-muted/70 focus:outline-none focus:border-ember/50"
          />
          <button
            type="button"
            onClick={() => copy('feedback', feedbackText())}
            className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold bg-ember text-white hover:bg-flame transition-colors"
          >
            {copied === 'feedback' ? <Check size={16} /> : <Copy size={16} />}
            {copied === 'feedback' ? 'Copied — paste it to Claude' : 'Copy all feedback'}
          </button>
        </div>
      </section>
    </>
  )
}
