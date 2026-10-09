import type { ReactNode } from 'react'
import { Check, Copy, Heart, X } from 'lucide-react'
import { PALETTES, type Concept, type Palette, type ThemeKey } from './marks'
import { ROUNDS, type Round } from './rounds'
import { Lockup, type WordmarkKey } from './wordmarks'

export type Vote = 'love' | 'nope' | null

export const THEMES: { key: ThemeKey; label: string }[] = [
  { key: 'dark', label: 'Dark' },
  { key: 'light', label: 'Light' },
  { key: 'ember', label: 'One-colour' },
]

export const voteGlyph = (v: Vote) => (v === 'love' ? '♥' : v === 'nope' ? '✕' : '·')

/** Clipboard with a prompt() fallback for browsers that block it. Resolves true when copied. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    window.prompt('Copy this:', text)
    return false
  }
}

/* ── Small pieces ───────────────────────────────────────────────────────── */

export function VoteButtons({ vote, onVote, size = 36 }: { vote: Vote; onVote: (v: Vote) => void; size?: number }) {
  const base = 'rounded-full grid place-items-center border transition-colors duration-150'
  return (
    <div className="flex gap-1.5 shrink-0">
      <button
        type="button"
        aria-label="Love it"
        aria-pressed={vote === 'love'}
        onClick={() => onVote(vote === 'love' ? null : 'love')}
        style={{ width: size, height: size }}
        className={`${base} ${vote === 'love' ? 'bg-ember border-ember text-white' : 'border-border text-text-muted hover:text-ember hover:border-ember/50'}`}
      >
        <Heart size={size * 0.44} fill={vote === 'love' ? 'currentColor' : 'none'} />
      </button>
      <button
        type="button"
        aria-label="Not for me"
        aria-pressed={vote === 'nope'}
        onClick={() => onVote(vote === 'nope' ? null : 'nope')}
        style={{ width: size, height: size }}
        className={`${base} ${vote === 'nope' ? 'bg-text-heading/10 border-text-muted text-text-heading' : 'border-border text-text-muted hover:text-text-heading hover:border-text-muted'}`}
      >
        <X size={size * 0.44} />
      </button>
    </div>
  )
}

export function Stage({ p, className = '', children }: { p: Palette; className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-xl transition-colors duration-300 ${className}`} style={{ background: p.bg, boxShadow: `inset 0 0 0 1px ${p.fg}14` }}>
      {children}
    </div>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-ember">{children}</div>
}

export function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl mb-10">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display font-bold text-3xl sm:text-4xl text-text-heading mt-3 tracking-tight">{title}</h2>
      {children && <p className="mt-3 text-text-body leading-relaxed">{children}</p>}
    </div>
  )
}

export function ConceptPicker({ concepts, activeId, onPick }: { concepts: Concept[]; activeId: string; onPick: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {concepts.map((c) => {
        const active = c.id === activeId
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onPick(c.id)}
            aria-pressed={active}
            className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-lg border text-sm transition-colors ${
              active ? 'border-ember bg-ember/10 text-text-heading' : 'border-border text-text-muted hover:text-text-heading hover:border-text-muted'
            }`}
          >
            <span className="grid place-items-center w-7 h-7 rounded-md bg-background">
              <c.Mark size={20} p={PALETTES.dark} />
            </span>
            <span className="font-mono text-xs">{c.no}</span>
            <span className="hidden sm:inline">{c.name}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ── Page chrome ────────────────────────────────────────────────────────── */

export function Toolbar({
  round,
  onRound,
  theme,
  onTheme,
  onCopy,
  copied,
  loved,
}: {
  round: Round
  onRound: (id: string) => void
  theme: ThemeKey
  onTheme: (t: ThemeKey) => void
  onCopy: () => void
  copied: boolean
  loved: number
}) {
  return (
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-display font-bold tracking-widest text-text-heading text-sm hidden sm:inline">LOGO LAB</span>
              <div className="flex rounded-lg border border-border p-0.5" role="radiogroup" aria-label="Round">
                {ROUNDS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={r.id === round.id}
                    onClick={() => onRound(r.id)}
                    className={`px-2 py-1 rounded-md font-mono text-[11px] transition-colors ${
                      r.id === round.id ? 'bg-ember/15 text-ember' : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    R{r.id}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex rounded-lg border border-border p-0.5" role="radiogroup" aria-label="Background">
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="radio"
                    aria-checked={theme === t.key}
                    onClick={() => onTheme(t.key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      theme === t.key ? 'bg-surface text-text-heading' : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: PALETTES[t.key].bg, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)' }} />
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold bg-ember text-white hover:bg-flame transition-colors"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy feedback'}</span>
                {loved > 0 && <span className="font-mono text-[11px] bg-white/20 rounded px-1.5">♥ {loved}</span>}
              </button>
            </div>
          </div>
        </div>
  )
}

export function RoundIntro({ round }: { round: Round }) {
  const titleWords = round.title.split(' ')
  return (
    <>
        <Eyebrow>Flintworks · Logo Lab · Round {round.id}</Eyebrow>
        <h1 className="font-display font-bold text-text-heading tracking-tight leading-[0.95] mt-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
          {titleWords.slice(0, -1).join(' ')} <span className="text-ember-gradient">{titleWords.at(-1)}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed">
          {round.intro} Hit{' '}
          <Heart size={15} className="inline text-ember -mt-0.5" /> on what pulls you, <X size={15} className="inline -mt-0.5" /> on what doesn’t, and
          jot a few words on <em>why</em>. Then <span className="text-text-heading font-semibold">Copy feedback</span> and paste it back to me.
        </p>

        {round.heard && (
          <div className="mt-10 rounded-2xl border border-border bg-surface/60 divide-y divide-border/70">
            <div className="px-5 py-3 font-mono text-[11px] tracking-[0.2em] uppercase text-text-muted">What I heard → what changed</div>
            {round.heard.map((h) => (
              <div key={h.said} className="px-5 py-3 grid sm:grid-cols-[minmax(0,15rem)_1fr] gap-1 sm:gap-6 text-sm">
                <span className="text-text-heading font-medium">{h.said}</span>
                <span className="text-text-body">{h.did}</span>
              </div>
            ))}
          </div>
        )}
    </>
  )
}

/* ── In-context mockups ─────────────────────────────────────────────────── */

export function ContextCard({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <figure className={`rounded-2xl border border-border bg-surface p-4 flex flex-col ${className}`}>
      <div className="flex-1 flex">{children}</div>
      <figcaption className="font-mono text-[11px] tracking-wider uppercase text-text-muted mt-3">{label}</figcaption>
    </figure>
  )
}

export function NavbarMock({ c, wm }: { c: Concept; wm?: WordmarkKey }) {
  const p = PALETTES.dark
  return (
    <div className="w-full rounded-xl overflow-hidden border border-border" style={{ background: p.bg }}>
      <div className="flex items-center justify-between gap-6 px-5 sm:px-7 h-16 border-b border-border/60">
        <Lockup concept={c} wordmark={wm} height={26} p={p} />
        <div className="hidden lg:flex items-center gap-6 text-sm text-text-muted">
          <span>Services</span>
          <span>Pricing</span>
          <span>Work</span>
          <span>Studio</span>
          <span>About</span>
        </div>
        <span className="hidden sm:inline-flex px-4 py-2 rounded-md text-sm font-semibold bg-ember text-white">Start a Project</span>
      </div>
      <div
        className="relative px-6 py-16 sm:py-20 text-center"
        style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 100%, rgba(255,77,0,0.12) 0%, transparent 70%)' }}
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ember/30 bg-ember/5 text-ember font-mono text-[10px] tracking-widest uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-ember" />
          The Spark for Your Business
        </span>
        <div className="font-display font-bold leading-[0.95] tracking-tight text-4xl sm:text-6xl">
          <span className="text-text-heading block">We Forge</span>
          <span className="text-ember-gradient block">The Future</span>
        </div>
      </div>
    </div>
  )
}

export function TabStrip({ c, dark }: { c: Concept; dark: boolean }) {
  const p = dark ? PALETTES.dark : PALETTES.light
  const strip = dark ? '#1C1C20' : '#DEE1E6'
  const tab = dark ? '#2E2E34' : '#FFFFFF'
  const text = dark ? '#E4E4EA' : '#1F1F23'
  return (
    <div className="rounded-lg overflow-hidden" style={{ background: strip }}>
      <div className="flex items-end gap-1 px-2 pt-2">
        <div className="flex items-center gap-2 h-9 px-3 rounded-t-lg w-60 max-w-full" style={{ background: tab }}>
          <c.Mark size={16} p={p} />
          <span className="text-xs truncate flex-1" style={{ color: text }}>
            Flintworks — Software Agency
          </span>
          <X size={12} color={text} />
        </div>
        <div className="flex items-center gap-2 h-8 px-3 opacity-50 w-32">
          <span className="w-3 h-3 rounded-sm" style={{ background: text, opacity: 0.35 }} />
          <span className="text-xs truncate" style={{ color: text }}>
            Inbox
          </span>
        </div>
      </div>
      <div className="px-3 py-2" style={{ background: tab }}>
        <div className="rounded-full px-3 py-1 text-xs" style={{ background: strip, color: text }}>
          flintworks.hu
        </div>
      </div>
    </div>
  )
}

export function AppIcon({ c, p, bg, size = 88 }: { c: Concept; p: Palette; bg: string; size?: number }) {
  return (
    <div
      className="grid place-items-center overflow-hidden shrink-0"
      style={{ width: size, height: size, borderRadius: size * 0.225, background: bg, boxShadow: '0 8px 24px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.06)' }}
    >
      {/* Tile marks fill the icon edge-to-edge (their tile spans 88% of the viewBox). */}
      <c.Mark size={c.tile ? size / 0.88 : size * 0.62} p={p} />
    </div>
  )
}

export function BusinessCards({ c, wm }: { c: Concept; wm?: WordmarkKey }) {
  const w = 300
  const h = Math.round(w / 1.545)
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center w-full">
      <div className="grid place-items-center rounded-md" style={{ width: w, height: h, background: '#0A0A0B', boxShadow: '0 16px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)' }}>
        <c.Mark size={78} p={PALETTES.dark} />
      </div>
      <div className="flex flex-col justify-between rounded-md p-6" style={{ width: w, height: h, background: '#F3F0EA', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
        <Lockup concept={c} wordmark={wm} height={24} p={PALETTES.light} />
        <div className="text-[#0A0A0B]">
          <div className="font-display font-bold text-sm">Your Name</div>
          <div className="text-[11px] opacity-60">Founder</div>
          <div className="font-mono text-[10px] mt-3 opacity-70">hello@flintworks.hu · flintworks.hu · Budapest</div>
        </div>
      </div>
    </div>
  )
}

export function Sticker({ c }: { c: Concept }) {
  return (
    <div
      className="relative w-full rounded-2xl grid place-items-center py-12"
      style={{ background: 'linear-gradient(145deg, #2A2A30 0%, #1A1A1E 100%)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)' }}
    >
      <div style={{ filter: 'url(#ll-sticker)', transform: 'rotate(-8deg)' }}>
        <c.Mark size={112} p={PALETTES.light} />
      </div>
    </div>
  )
}

export function OgCard({ c, wm }: { c: Concept; wm?: WordmarkKey }) {
  return (
    <div
      className="relative w-full rounded-xl overflow-hidden grid place-items-center"
      style={{ aspectRatio: '1200 / 630', background: 'radial-gradient(ellipse 60% 80% at 50% 110%, rgba(255,77,0,0.22) 0%, transparent 70%), #0A0A0B' }}
    >
      <div className="flex flex-col items-center gap-5">
        <Lockup concept={c} wordmark={wm} height={48} p={PALETTES.dark} />
        <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-text-muted">We forge the future</span>
      </div>
      <span className="absolute left-5 bottom-4 font-mono text-[10px] text-text-muted">flintworks.hu</span>
    </div>
  )
}

export function StickerFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="ll-sticker" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="soft" />
        <feComponentTransfer in="soft" result="edge">
          <feFuncA type="linear" slope="30" intercept="-1.2" />
        </feComponentTransfer>
        <feFlood floodColor="#FFFFFF" />
        <feComposite in2="edge" operator="in" result="paper" />
        <feGaussianBlur in="edge" stdDeviation="4" result="blur" />
        <feOffset in="blur" dy="5" result="drop" />
        <feFlood floodColor="#000000" floodOpacity="0.5" />
        <feComposite in2="drop" operator="in" result="shadow" />
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="paper" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </svg>
  )
}
