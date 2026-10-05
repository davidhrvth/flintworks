'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Heart } from 'lucide-react'
import { FinalRound } from '@/components/logo-lab/final-round'
import { PALETTES, type Concept, type Palette, type ThemeKey } from '@/components/logo-lab/marks'
import { ROUNDS, type Round } from '@/components/logo-lab/rounds'
import {
  AppIcon,
  BusinessCards,
  ConceptPicker,
  ContextCard,
  copyText,
  Eyebrow,
  NavbarMock,
  OgCard,
  RoundIntro,
  SectionTitle,
  Stage,
  Sticker,
  StickerFilter,
  TabStrip,
  THEMES,
  Toolbar,
  voteGlyph,
  VoteButtons,
  type Vote,
} from '@/components/logo-lab/ui'
import { Lockup, Wordmark, WORDMARKS, type WordmarkKey } from '@/components/logo-lab/wordmarks'
type Feedback = {
  concepts: Record<string, { vote: Vote; note: string }>
  wordmarks: Partial<Record<WordmarkKey, Vote>>
  general: string
}

const EMPTY_FEEDBACK: Feedback = { concepts: {}, wordmarks: {}, general: '' }

// Rendered only on the client (never during SSR), so reading storage here is safe.
function loadFeedback(key: string): Feedback {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...EMPTY_FEEDBACK, ...JSON.parse(raw) } : EMPTY_FEEDBACK
  } catch {
    return EMPTY_FEEDBACK
  }
}

const LADDER = [64, 40, 24, 16]

const COUNT_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight']

// Tailwind needs literal class names, so map concept counts to them.
const SHEET_COLS: Record<number, string> = {
  6: 'grid-cols-3 lg:grid-cols-6',
  8: 'grid-cols-4 lg:grid-cols-8',
}

function buildFeedbackText(round: Round, fb: Feedback, theme: ThemeKey, preview: string) {
  const lines = [`Flintworks logo lab — round ${round.id}`, '']
  const concepts = round.concepts.filter((c) => fb.concepts[c.id]?.vote || fb.concepts[c.id]?.note.trim())
  if (concepts.length) {
    lines.push('Directions:')
    for (const c of concepts) {
      const { vote, note } = fb.concepts[c.id]
      lines.push(`${voteGlyph(vote)} ${c.no} ${c.name}${note.trim() ? ` — ${note.trim()}` : ''}`)
    }
    lines.push('')
  }
  const wordmarks = round.wordmarks.filter((k) => fb.wordmarks[k])
  if (wordmarks.length) {
    lines.push('Wordmarks:')
    for (const k of wordmarks) lines.push(`${voteGlyph(fb.wordmarks[k] ?? null)} ${WORDMARKS[k].letter} ${WORDMARKS[k].name}`)
    lines.push('')
  }
  lines.push(`Last previewed live: ${preview}`, `Background I was looking at: ${theme}`)
  if (fb.general.trim()) lines.push('', `Notes: ${fb.general.trim()}`)
  return lines.join('\n')
}

/* ── Concept card ───────────────────────────────────────────────────────── */

function ConceptCard({
  c,
  p,
  vote,
  note,
  onVote,
  onNote,
  onPreview,
}: {
  c: Concept
  p: Palette
  vote: Vote
  note: string
  onVote: (v: Vote) => void
  onNote: (n: string) => void
  onPreview: () => void
}) {
  return (
    <article
      id={`concept-${c.id}`}
      className={`scroll-mt-28 rounded-2xl border bg-surface transition-all duration-200 ${
        vote === 'love' ? 'border-ember/60 ember-glow' : 'border-border'
      } ${vote === 'nope' ? 'opacity-45 hover:opacity-80' : ''}`}
    >
      <header className="flex items-start justify-between gap-4 p-5 pb-4">
        <div>
          <Eyebrow>
            {c.no} · {c.tag}
          </Eyebrow>
          <h3 className="font-display font-bold text-2xl text-text-heading mt-1">{c.name}</h3>
        </div>
        <VoteButtons vote={vote} onVote={onVote} />
      </header>

      <div className="px-5">
        <Stage p={p}>
          <div className="flex items-center justify-center pt-10 pb-8">
            <c.Mark size={184} p={p} />
          </div>
          <div className="flex items-end justify-center gap-7 pb-7">
            {LADDER.map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <c.Mark size={s} p={p} />
                <span className="font-mono text-[10px]" style={{ color: p.fg, opacity: 0.4 }}>
                  {s}px
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-center px-4 py-8 overflow-hidden" style={{ borderTop: `1px solid ${p.fg}14` }}>
            <Lockup concept={c} height={36} p={p} />
          </div>
        </Stage>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {THEMES.map((t) => (
            <div key={t.key} className="relative rounded-lg grid place-items-center py-4" style={{ background: PALETTES[t.key].bg, boxShadow: `inset 0 0 0 1px ${PALETTES[t.key].fg}14` }}>
              <c.Mark size={44} p={PALETTES[t.key]} />
              <span className="absolute left-2 bottom-1.5 font-mono text-[9px] uppercase tracking-wider" style={{ color: PALETTES[t.key].fg, opacity: 0.45 }}>
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="px-5 pt-5 text-sm leading-relaxed text-text-body">{c.story}</p>

      <div className="p-5 flex flex-col sm:flex-row gap-3">
        <textarea
          value={note}
          onChange={(e) => onNote(e.target.value)}
          rows={2}
          placeholder="Gut reaction? (“too cold”, “love the spiral”, “feels cheap”…)"
          className="flex-1 resize-none rounded-lg bg-background border border-border px-3 py-2 text-sm text-text-heading placeholder:text-text-muted/70 focus:outline-none focus:border-ember/50"
        />
        <button
          type="button"
          onClick={onPreview}
          className="shrink-0 self-stretch sm:self-auto px-4 py-2 rounded-lg border border-border text-sm font-semibold text-text-heading hover:border-ember/50 hover:bg-ember/5 transition-colors"
        >
          See it live ↓
        </button>
      </div>
    </article>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function LogoLab() {
  const latest = ROUNDS[ROUNDS.length - 1]
  const [roundId, setRoundId] = useState(latest.id)
  const [theme, setTheme] = useState<ThemeKey>('dark')
  const round = ROUNDS.find((r) => r.id === roundId) ?? latest

  const switchRound = (id: string) => {
    setRoundId(id)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="min-h-screen bg-background text-text-body">
      <style>{`@keyframes ll-blink{50%{opacity:0}}.ll-cursor{animation:ll-blink 1.1s steps(1) infinite}`}</style>
      <StickerFilter />
      {/* Keyed so each round starts fresh with its own saved feedback. */}
      {round.kind === 'final' ? (
        <FinalRound key={round.id} round={round} theme={theme} onTheme={setTheme} onRound={switchRound} />
      ) : (
        <RoundView key={round.id} round={round} theme={theme} onTheme={setTheme} onRound={switchRound} />
      )}
    </div>
  )
}

function RoundView({ round, theme, onTheme, onRound }: { round: Round; theme: ThemeKey; onTheme: (t: ThemeKey) => void; onRound: (id: string) => void }) {
  const { concepts } = round
  const [activeId, setActiveId] = useState(concepts[0].id)
  const [wmOverride, setWmOverride] = useState<WordmarkKey | null>(null)
  const [fb, setFb] = useState<Feedback>(() => loadFeedback(round.storageKey))
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(round.storageKey, JSON.stringify(fb))
    } catch {
      // Private mode / blocked storage — feedback still works for this visit.
    }
  }, [fb, round.storageKey])

  const p = PALETTES[theme]
  const active = concepts.find((c) => c.id === activeId) ?? concepts[0]
  const activeWm = wmOverride ?? active.wordmark
  const loved = concepts.filter((c) => fb.concepts[c.id]?.vote === 'love').length

  const conceptFb = (id: string) => fb.concepts[id] ?? { vote: null, note: '' }
  const patchConcept = (id: string, patch: Partial<{ vote: Vote; note: string }>) =>
    setFb((prev) => ({ ...prev, concepts: { ...prev.concepts, [id]: { ...(prev.concepts[id] ?? { vote: null, note: '' }), ...patch } } }))

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  async function copyFeedback() {
    const text = buildFeedbackText(round, fb, theme, `${active.no} ${active.name} + ${WORDMARKS[activeWm].letter} ${WORDMARKS[activeWm].name}`)
    if (await copyText(text)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <>
      <Toolbar round={round} onRound={onRound} theme={theme} onTheme={onTheme} onCopy={copyFeedback} copied={copied} loved={loved} />

      {/* Intro + contact sheet */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <RoundIntro round={round} />

        <div className={`mt-12 grid ${SHEET_COLS[concepts.length] ?? SHEET_COLS[8]} gap-2 sm:gap-3`}>
          {concepts.map((c) => {
            const v = conceptFb(c.id).vote
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => scrollTo(`concept-${c.id}`)}
                className={`group relative rounded-xl aspect-square grid place-items-center transition-all duration-200 hover:-translate-y-0.5 ${v === 'nope' ? 'opacity-40' : ''}`}
                style={{ background: p.bg, boxShadow: `inset 0 0 0 1px ${v === 'love' ? '#FF4D00' : `${p.fg}14`}` }}
                aria-label={`Jump to ${c.name}`}
              >
                <c.Mark size={56} p={p} />
                <span className="absolute left-2 top-1.5 font-mono text-[10px]" style={{ color: p.fg, opacity: 0.45 }}>
                  {c.no}
                </span>
                {v === 'love' && <Heart size={12} className="absolute right-2 top-2 text-ember" fill="currentColor" />}
              </button>
            )
          })}
        </div>
      </section>

      {/* Directions */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          {concepts.map((c) => {
            const { vote, note } = conceptFb(c.id)
            return (
              <ConceptCard
                key={c.id}
                c={c}
                p={p}
                vote={vote}
                note={note}
                onVote={(v) => patchConcept(c.id, { vote: v })}
                onNote={(n) => patchConcept(c.id, { note: n })}
                onPreview={() => {
                  setActiveId(c.id)
                  scrollTo('live')
                }}
              />
            )
          })}
        </div>
      </section>

      {/* In context */}
      <section id="live" className="scroll-mt-20 border-t border-border bg-surface/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <SectionTitle eyebrow="See it live" title="Out in the wild.">
            A logo lives on real surfaces, not on a white canvas. Pick a direction and see it where people will actually meet it.
          </SectionTitle>

          <ConceptPicker concepts={concepts} activeId={active.id} onPick={setActiveId} />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-6 gap-4">
            <ContextCard label="Site header" className="lg:col-span-6">
              <NavbarMock c={active} wm={activeWm} />
            </ContextCard>

            <ContextCard label="Link preview · LinkedIn / Slack" className="lg:col-span-3">
              <OgCard c={active} wm={activeWm} />
            </ContextCard>

            <ContextCard label="Browser tab · 16px favicon" className="lg:col-span-3">
              <div className="w-full flex flex-col gap-3 justify-center">
                <TabStrip c={active} dark />
                <TabStrip c={active} dark={false} />
              </div>
            </ContextCard>

            <ContextCard label="App icon · avatar" className="lg:col-span-2">
              <div className="w-full flex flex-col items-center justify-center gap-6 py-4">
                <div className="flex gap-4">
                  <AppIcon c={active} p={PALETTES.dark} bg="#0A0A0B" />
                  <AppIcon c={active} p={PALETTES.ember} bg="#FF4D00" />
                  <AppIcon c={active} p={PALETTES.light} bg="#F3F0EA" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center rounded-full overflow-hidden" style={{ width: 64, height: 64, background: '#0A0A0B', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
                    <active.Mark size={active.tile ? 64 / 0.88 : 38} p={PALETTES.dark} />
                  </div>
                  <div className="text-sm">
                    <div className="text-text-heading font-semibold">Flintworks</div>
                    <div className="text-text-muted text-xs">Software agency · Budapest</div>
                  </div>
                </div>
              </div>
            </ContextCard>

            <ContextCard label="Business card · front & back" className="lg:col-span-4">
              <div className="w-full grid place-items-center py-4">
                <BusinessCards c={active} wm={activeWm} />
              </div>
            </ContextCard>

            <ContextCard label="Die-cut sticker" className="lg:col-span-6">
              <Sticker c={active} />
            </ContextCard>
          </div>
        </div>
      </section>

      {/* Wordmarks */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <SectionTitle eyebrow="The long logo" title={`${COUNT_WORDS[round.wordmarks.length]} ways to write the name.`}>
            The mark and the name are two separate decisions. Here’s the selected mark with {round.wordmarks.length} typographic treatments — vote on the type on its own merits,
            and click <span className="text-text-heading font-medium">Use this</span> to swap it into the previews above.
          </SectionTitle>

          <ConceptPicker concepts={concepts} activeId={active.id} onPick={setActiveId} />

          <div className="mt-8 flex flex-col gap-3">
            {round.wordmarks.map((k) => {
              const wm = WORDMARKS[k]
              const vote = fb.wordmarks[k] ?? null
              const inUse = activeWm === k
              return (
                <div
                  key={k}
                  className={`rounded-2xl border bg-surface p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center gap-4 transition-all ${
                    vote === 'love' ? 'border-ember/60' : 'border-border'
                  } ${vote === 'nope' ? 'opacity-45 hover:opacity-80' : ''}`}
                >
                  <Stage p={p} className="lg:w-[58%] shrink-0 flex items-center justify-center px-6 py-9 overflow-hidden">
                    <Lockup concept={active} wordmark={k} height={44} p={p} />
                  </Stage>
                  <div className="flex-1 min-w-0 px-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-xs text-ember">{wm.letter}</span>
                      <span className="font-display font-bold text-lg text-text-heading">{wm.name}</span>
                      {k === active.wordmark && <span className="font-mono text-[10px] text-text-muted">· default for {active.name}</span>}
                    </div>
                    <p className="text-sm text-text-body mt-1 leading-relaxed">{wm.note}</p>
                    <div className="mt-2 opacity-60">
                      <Wordmark k={k} height={22} p={PALETTES.dark} />
                    </div>
                  </div>
                  <div className="flex lg:flex-col items-center gap-2 px-1">
                    <VoteButtons vote={vote} onVote={(v) => setFb((prev) => ({ ...prev, wordmarks: { ...prev.wordmarks, [k]: v } }))} />
                    <button
                      type="button"
                      onClick={() => setWmOverride(k)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        inUse ? 'border-ember text-ember bg-ember/10' : 'border-border text-text-muted hover:text-text-heading'
                      }`}
                    >
                      {inUse ? 'In use' : 'Use this'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* General notes */}
      <section className="border-t border-border bg-surface/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <SectionTitle eyebrow="Anything else" title="Help me aim round two.">
            Logos you’ve always loved (any industry), colours you want to try, three words for how Flintworks should feel — anything helps. Even “none of these,
            but 03 was the least wrong” is gold.
          </SectionTitle>
          <textarea
            value={fb.general}
            onChange={(e) => setFb((prev) => ({ ...prev, general: e.target.value }))}
            rows={5}
            placeholder="e.g. I love the Stripe and Linear logos. Should feel sharp, warm, a bit dangerous…"
            className="w-full resize-y rounded-xl bg-background border border-border px-4 py-3 text-text-heading placeholder:text-text-muted/70 focus:outline-none focus:border-ember/50"
          />
          <button
            type="button"
            onClick={copyFeedback}
            className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold bg-ember text-white hover:bg-flame transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied — paste it to Claude' : 'Copy all feedback'}
          </button>
        </div>
      </section>
    </>
  )
}
