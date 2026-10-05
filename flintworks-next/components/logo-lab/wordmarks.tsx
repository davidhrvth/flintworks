import type { ComponentType, CSSProperties } from 'react'
import { GLYPHS } from './glyphs'
import { sparkPath, type Concept, type Palette } from './marks'

export type WordmarkKey = 'wide' | 'dot' | 'unbounded' | 'split' | 'editorial' | 'terminal' | 'unbounded-caps' | 'tag'

type RenderProps = { fontSize: number; p: Palette }

type Wordmark = {
  letter: string
  name: string
  note: string
  /** Font size as a fraction of the mark height, tuned per face so lockups sit optically level. */
  scale: number
  Render: ComponentType<RenderProps>
}

const SYNE = 'var(--font-syne), sans-serif'
const base = { lineHeight: 1, whiteSpace: 'nowrap' } as const

/**
 * The name drawn from outlined glyphs (see glyphs.ts) — identical to the typeset version,
 * but font-independent and animatable per letter via `letterClass` + the `--j` index.
 */
export function GlyphWordmark({
  k,
  fontSize,
  p,
  letterClass,
  cursorClass = 'll-cursor',
}: {
  k: 'wide' | 'terminal'
  fontSize: number
  p: Palette
  letterClass?: string
  cursorClass?: string
}) {
  const g = GLYPHS[k]
  const cursor = k === 'terminal'
  const [x0, y0, x1, y1] = g.bbox
  const right = cursor ? g.width + 600 : x1
  const top = cursor ? Math.min(y0, -760) : y0
  const bottom = cursor ? Math.max(y1, 60) : y1
  const w = right - x0
  const h = bottom - top
  return (
    <svg
      viewBox={`${x0} ${top} ${w} ${h}`}
      width={(w * fontSize) / 1000}
      height={(h * fontSize) / 1000}
      overflow="visible"
      role="img"
      aria-label="Flintworks"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {g.letters.map((l, j) => (
        <path key={j} d={l.d} fill={p.fg} className={letterClass} style={{ '--j': j } as CSSProperties} />
      ))}
      {cursor && <rect className={cursorClass} x={g.width + 80} y={-760} width={520} height={820} fill={p.accent} />}
    </svg>
  )
}

function Wide({ fontSize, p }: RenderProps) {
  return <GlyphWordmark k="wide" fontSize={fontSize} p={p} />
}

function SparkDot({ fontSize, p }: RenderProps) {
  return (
    <span style={{ ...base, fontFamily: SYNE, fontWeight: 800, fontSize, letterSpacing: '-0.035em', color: p.fg }}>
      fl
      <span style={{ position: 'relative', display: 'inline-block' }}>
        ı
        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          style={{ position: 'absolute', left: '50%', top: '-0.08em', width: '0.4em', height: '0.4em', transform: 'translateX(-50%)', overflow: 'visible' }}
        >
          <path d={sparkPath(50, 50, 50, 50, 0.22)} fill={p.accent} />
        </svg>
      </span>
      ntworks
    </span>
  )
}

function Geometric({ fontSize, p }: RenderProps) {
  return (
    <span style={{ ...base, fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 600, fontSize, letterSpacing: '-0.02em', color: p.fg }}>
      flintworks
    </span>
  )
}

function Split({ fontSize, p }: RenderProps) {
  return (
    <span style={{ ...base, fontFamily: SYNE, fontSize, letterSpacing: '0.06em', marginRight: '-0.06em', color: p.fg }}>
      <span style={{ fontWeight: 800 }}>FLINT</span>
      <span style={{ fontWeight: 400, opacity: 0.55 }}>WORKS</span>
    </span>
  )
}

function Editorial({ fontSize, p }: RenderProps) {
  return (
    <span style={{ ...base, fontFamily: 'var(--font-instrument), serif', fontSize, letterSpacing: '-0.01em', color: p.fg }}>
      Flint<span style={{ fontStyle: 'italic', color: p.accent }}>works</span>
    </span>
  )
}

function Terminal({ fontSize, p }: RenderProps) {
  return <GlyphWordmark k="terminal" fontSize={fontSize} p={p} />
}

function GeometricCaps({ fontSize, p }: RenderProps) {
  return (
    <span style={{ ...base, fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 700, fontSize, letterSpacing: '0.05em', marginRight: '-0.05em', color: p.fg }}>
      FLINTWORKS
    </span>
  )
}

function Tag({ fontSize, p }: RenderProps) {
  return (
    <span style={{ ...base, fontFamily: 'var(--font-jetbrains), monospace', fontWeight: 500, fontSize, letterSpacing: '-0.02em', color: p.fg }}>
      <span style={{ color: p.accent }}>&lt;</span>
      flintworks
      <span style={{ color: p.accent }}> /&gt;</span>
    </span>
  )
}

export const WORDMARKS: Record<WordmarkKey, Wordmark> = {
  wide: { letter: 'A', name: 'Syne Wide', note: 'What the site uses today, tracked out. Calm, architectural, quietly expensive.', scale: 0.56, Render: Wide },
  dot: { letter: 'B', name: 'Spark Dot', note: 'Lowercase, heavy, tight — the i-dot is the spark. Friendly but sharp.', scale: 0.78, Render: SparkDot },
  unbounded: { letter: 'C', name: 'Unbounded', note: 'Extra-wide geometric. Loud, modern, startup-ready.', scale: 0.6, Render: Geometric },
  split: { letter: 'D', name: 'Split Weight', note: 'FLINT heavy, WORKS light. The name explains itself.', scale: 0.6, Render: Split },
  editorial: { letter: 'E', name: 'Editorial', note: 'A serif with an italic twist. Unexpected for a dev shop — that’s the point.', scale: 0.92, Render: Editorial },
  terminal: { letter: 'F', name: 'Terminal', note: 'Monospace with a live cursor. Says “we write code” before anything else.', scale: 0.62, Render: Terminal },
  'unbounded-caps': { letter: 'G', name: 'Unbounded Caps', note: 'C’s louder sibling: all caps, heavier, a touch of tracking. Reads like a product, not a studio.', scale: 0.48, Render: GeometricCaps },
  tag: { letter: 'H', name: 'Tag', note: 'F’s sibling: the name as a component — <flintworks />. Nerdy on purpose.', scale: 0.56, Render: Tag },
}

export function Wordmark({ k, height, p }: { k: WordmarkKey; height: number; p: Palette }) {
  const { Render, scale } = WORDMARKS[k]
  return <Render fontSize={Math.round(height * scale)} p={p} />
}

export function Lockup({ concept, wordmark, height, p }: { concept: Concept; wordmark?: WordmarkKey; height: number; p: Palette }) {
  const { Mark } = concept
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(height * 0.34) }}>
      <Mark size={height} p={p} />
      <Wordmark k={wordmark ?? concept.wordmark} height={height} p={p} />
    </span>
  )
}
