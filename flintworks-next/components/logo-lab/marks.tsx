import { useId, type ComponentType, type ReactNode } from 'react'
import { fmt, sparkPath } from './geometry'
import type { WordmarkKey } from './wordmarks'

export { fmt, sparkPath }

export type Palette = {
  bg: string
  fg: string
  accent: string
  accent2: string
  mono: boolean
}

export const PALETTES = {
  dark: { bg: '#0A0A0B', fg: '#F0F0F5', accent: '#FF4D00', accent2: '#FF8C42', mono: false },
  light: { bg: '#F3F0EA', fg: '#0A0A0B', accent: '#FF4D00', accent2: '#FF8C42', mono: false },
  ember: { bg: '#FF4D00', fg: '#0A0A0B', accent: '#0A0A0B', accent2: '#0A0A0B', mono: true },
} satisfies Record<string, Palette>

export type ThemeKey = keyof typeof PALETTES

export type MarkProps = { size: number; p: Palette }

export type Concept = {
  id: string
  no: string
  name: string
  tag: string
  story: string
  Mark: ComponentType<MarkProps>
  wordmark: WordmarkKey
  /** Mark is its own filled tile — contexts should let it fill the container instead of nesting it. */
  tile?: boolean
}

export const INK = '#0A0A0B'


// SVG ids end up inside url(#…), so strip the punctuation React puts in useId values.
export function useSvgId() {
  return `ll${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
}

export type Pt = readonly [number, number]
export const poly = (...pts: Pt[]) => `M${pts.map(([x, y]) => `${x} ${y}`).join('L')}Z`

/** Annular sector between radii r0 < r1, angles a0 < a1 in degrees (SVG, y-down). */
function sector(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const pt = (r: number, a: number) =>
    `${fmt(cx + r * Math.cos((a * Math.PI) / 180))} ${fmt(cy + r * Math.sin((a * Math.PI) / 180))}`
  return `M${pt(r1, a0)}A${r1} ${r1} 0 0 1 ${pt(r1, a1)}L${pt(r0, a1)}A${r0} ${r0} 0 0 0 ${pt(r0, a0)}Z`
}

export function Frame({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {children}
    </svg>
  )
}

/** Facets separated by knife-cut gaps (masked, so the gaps show whatever sits behind the mark). */
export function Faceted({
  facets,
  cuts,
  gap = 2.4,
}: {
  facets: [d: string, fill: string, opacity: number][]
  cuts: [Pt, Pt][]
  gap?: number
}) {
  const id = useSvgId()
  return (
    <>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect width="100" height="100" fill="white" />
          {cuts.map(([a, b]) => (
            <line key={`${a}-${b}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="black" strokeWidth={gap} strokeLinecap="round" />
          ))}
        </mask>
      </defs>
      <g mask={`url(#${id})`}>
        {facets.map(([d, fill, o]) => (
          <path key={d} d={d} fill={fill} fillOpacity={o} />
        ))}
      </g>
    </>
  )
}

/* ── 01 Csiholó ─────────────────────────────────────────────────────────── */

// Lyre-shaped fire steel: flat striking edge, sides flaring up and curling inward.
const CSIHOLO_PATH = (() => {
  const cx = 22
  const cy = 54
  const r0 = 11
  const sweep = Math.PI * 2 * 0.8
  const pitch = 6.5 / sweep
  const steps = 80
  const pts: Pt[] = []
  for (let i = steps; i >= 0; i--) {
    const th = Math.PI + (sweep * i) / steps
    const r = r0 - pitch * (th - Math.PI)
    pts.push([fmt(cx + r * Math.cos(th)), fmt(cy + r * Math.sin(th))])
  }
  const left = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('')
  const right = [...pts].reverse().map(([x, y]) => `L${fmt(100 - x)} ${y}`).join('')
  return `${left}C11 70 18 82 32 82L68 82C82 82 89 70 89 54${right}`
})()

// The spark rises tall out of the striking edge, so the curls read as arms cradling it.
function CsiholoMark({ size, p }: MarkProps) {
  return (
    <Frame size={size}>
      <path d={CSIHOLO_PATH} stroke={p.fg} strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={sparkPath(50, 46, 32, 9, 0.2)} fill={p.accent} />
    </Frame>
  )
}

/* ── 02 Strike ──────────────────────────────────────────────────────────── */

function StrikeMark({ size, p }: MarkProps) {
  return (
    <Frame size={size}>
      <path d="M6 24L40 50L19 48Z" fill={p.fg} />
      <path d="M19 48L40 50L10 70Z" fill={p.fg} fillOpacity={0.45} />
      <path d="M94 24L60 50L81 48Z" fill={p.fg} />
      <path d="M81 48L60 50L90 70Z" fill={p.fg} fillOpacity={0.45} />
      <path d={sparkPath(50, 50, 42, 10, 0.26)} fill={p.accent} />
    </Frame>
  )
}

/* ── 03 Knapped ─────────────────────────────────────────────────────────── */

const KN = {
  T: [50, 5],
  R1: [77, 31],
  R2: [71, 71],
  B: [50, 95],
  L2: [29, 71],
  L1: [23, 31],
  M: [50, 47],
} as const satisfies Record<string, Pt>

function KnappedMark({ size, p }: MarkProps) {
  const { T, R1, R2, B, L2, L1, M } = KN
  return (
    <Frame size={size}>
      <Faceted
        facets={[
          [poly(L1, T, M), p.fg, 1],
          [poly(T, R1, M), p.fg, 0.72],
          [poly(L1, M, L2), p.fg, 0.56],
          [poly(R1, R2, M), p.fg, 0.36],
          [poly(L2, M, B), p.fg, 0.24],
          [poly(M, R2, B), p.accent, 1],
        ]}
        cuts={[T, R1, R2, B, L2, L1].map((v) => [M, v])}
      />
    </Frame>
  )
}

/* ── 04 Seal ────────────────────────────────────────────────────────────── */

function SealMark({ size, p }: MarkProps) {
  const id = useSvgId()
  // The text ring turns to mush below ~80px, so small sizes get the stripped-back seal.
  if (size < 80) {
    return (
      <Frame size={size}>
        <circle cx="50" cy="50" r="44" stroke={p.fg} strokeWidth="7" />
        <path d={sparkPath(50, 50, 29, 29, 0.2)} fill={p.accent} />
      </Frame>
    )
  }
  const type = { fontFamily: 'var(--font-syne), sans-serif', fontWeight: 700 }
  return (
    <Frame size={size}>
      <defs>
        <path id={`${id}t`} d="M14 50A36 36 0 0 1 86 50" />
        <path id={`${id}b`} d="M8.6 50A41.4 41.4 0 0 0 91.4 50" />
      </defs>
      <circle cx="50" cy="50" r="47" stroke={p.fg} strokeWidth="2.2" />
      <circle cx="50" cy="50" r="31" stroke={p.fg} strokeWidth="1.4" />
      <text style={type} fontSize="8.4" letterSpacing="2.6" fill={p.fg} textAnchor="middle">
        <textPath href={`#${id}t`} startOffset="50%">FLINTWORKS</textPath>
      </text>
      <text style={type} fontSize="5.6" letterSpacing="2.4" fill={p.fg} textAnchor="middle">
        <textPath href={`#${id}b`} startOffset="50%">BUDAPEST · MMXXVI</textPath>
      </text>
      <path d={sparkPath(11, 50, 3.4, 3.4, 0.2)} fill={p.accent} />
      <path d={sparkPath(89, 50, 3.4, 3.4, 0.2)} fill={p.accent} />
      <path d={sparkPath(50, 50, 21, 21, 0.18)} fill={p.accent} />
    </Frame>
  )
}

/* ── 05 Quadrant ────────────────────────────────────────────────────────── */

// Four quarter-discs anchored in the corners; the spark is the space left between them.
const QUADRANT_FANS = [
  'M8 8L47 8A39 39 0 0 1 8 47Z',
  'M92 8L92 47A39 39 0 0 1 53 8Z',
  'M92 92L53 92A39 39 0 0 1 92 53Z',
  'M8 92L8 53A39 39 0 0 1 47 92Z',
]
const QUADRANT_SPARK = 'M50 8A42 42 0 0 0 92 50A42 42 0 0 0 50 92A42 42 0 0 0 8 50A42 42 0 0 0 50 8Z'

function QuadrantMark({ size, p }: MarkProps) {
  return (
    <Frame size={size}>
      {QUADRANT_FANS.map((d) => (
        <path key={d} d={d} fill={p.fg} />
      ))}
      <path d={QUADRANT_SPARK} fill={p.accent} />
    </Frame>
  )
}

/* ── 06 Keystone ────────────────────────────────────────────────────────── */

function KeystoneMark({ size, p }: MarkProps) {
  const id = useSvgId()
  const cx = 50
  const cy = 50
  const blocks = 5
  const step = 180 / blocks
  const joints = Array.from({ length: blocks - 1 }, (_, i) => ((180 + step * (i + 1)) * Math.PI) / 180)
  return (
    <Frame size={size}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect width="100" height="100" fill="white" />
          {joints.map((a) => (
            <line
              key={a}
              x1={fmt(cx + 14 * Math.cos(a))}
              y1={fmt(cy + 14 * Math.sin(a))}
              x2={fmt(cx + 48 * Math.cos(a))}
              y2={fmt(cy + 48 * Math.sin(a))}
              stroke="black"
              strokeWidth={3.2}
            />
          ))}
        </mask>
      </defs>
      <g mask={`url(#${id})`}>
        <path d={sector(cx, cy, 20, 36, 180, 360)} fill={p.fg} />
        <path d={sector(cx, cy, 17, 42, 270 - step / 2, 270 + step / 2)} fill={p.accent} />
      </g>
      <rect x="14" y={cy + 3} width="16" height="37" fill={p.fg} />
      <rect x="70" y={cy + 3} width="16" height="37" fill={p.fg} />
    </Frame>
  )
}

/* ── 07 Monogram ────────────────────────────────────────────────────────── */

function MonogramMark({ size, p }: MarkProps) {
  const tile = p.mono ? p.fg : p.accent
  const glyph = p.mono ? p.bg : INK
  return (
    <Frame size={size}>
      <rect x="6" y="6" width="88" height="88" rx="22" fill={tile} />
      <path d="M29 24H72V37H43V76H29Z" fill={glyph} />
      <path d={sparkPath(59, 53, 12, 12, 0.2)} fill={glyph} />
    </Frame>
  )
}

/* ── 08 Strata ──────────────────────────────────────────────────────────── */

const STRATA_LINES = Array.from({ length: 9 }, (_, i) => 50 + 10 * (i - 4))

function StrataMark({ size, p }: MarkProps) {
  const id = useSvgId()
  const fill = p.mono ? p.fg : `url(#${id}g)`
  return (
    <Frame size={size}>
      <defs>
        <clipPath id={`${id}c`}>
          <path d={sparkPath(50, 50, 46, 46, 0.6)} />
        </clipPath>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1="0" y1="5" x2="0" y2="95">
          <stop offset="0" stopColor={p.accent2} />
          <stop offset="1" stopColor={p.accent} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        {STRATA_LINES.map((y) => (
          <rect key={y} x="0" y={y - 3.25} width="100" height="6.5" fill={fill} />
        ))}
      </g>
    </Frame>
  )
}

/* ── Registry ───────────────────────────────────────────────────────────── */

export const ROUND_1: Concept[] = [
  {
    id: 'csiholo',
    no: '01',
    name: 'Csiholó',
    tag: 'Heritage',
    story:
      'The lyre-shaped fire steel Hungarians carried for a thousand years to strike sparks from flint. A Budapest agency with a story nobody else can tell — and the spark sits exactly where steel meets stone.',
    Mark: CsiholoMark,
    wordmark: 'editorial',
  },
  {
    id: 'strike',
    no: '02',
    name: 'Strike',
    tag: 'Moment',
    story:
      'Two flint shards, one spark — the instant something catches. You bring the idea, we bring the edge. Reads as tension and energy, even at favicon size.',
    Mark: StrikeMark,
    wordmark: 'split',
  },
  {
    id: 'knapped',
    no: '03',
    name: 'Knapped',
    tag: 'Craft',
    story:
      'A hand-knapped flint, faceted like a cut stone, with one face still glowing from the strike. Dimensional, premium, a little precious — the “we sweat the details” option.',
    Mark: KnappedMark,
    wordmark: 'unbounded',
  },
  {
    id: 'seal',
    no: '04',
    name: 'Seal',
    tag: 'Badge',
    story:
      'The classic maker’s seal: name on the ring, spark at the heart. Feels established from day one. Drops the text ring below 80px so it stays crisp as a favicon.',
    Mark: SealMark,
    wordmark: 'wide',
  },
  {
    id: 'quadrant',
    no: '05',
    name: 'Quadrant',
    tag: 'System',
    story:
      'Four building blocks — the spark is the space they leave between them. Every curve is one quarter circle, so it holds up from a 16px tab to the side of a building.',
    Mark: QuadrantMark,
    wordmark: 'dot',
  },
  {
    id: 'keystone',
    no: '06',
    name: 'Keystone',
    tag: 'Structure',
    story:
      'A Roman arch where the ember keystone holds everything up. That’s the pitch: the piece that makes the whole thing stand. Architectural, calm, confident.',
    Mark: KeystoneMark,
    wordmark: 'wide',
  },
  {
    id: 'monogram',
    no: '07',
    name: 'Monogram',
    tag: 'Letter',
    story:
      'An F whose middle arm has been struck into a spark. The most direct option — instantly “Flintworks”, built for app icons and social avatars.',
    Mark: MonogramMark,
    wordmark: 'split',
    tile: true,
  },
  {
    id: 'strata',
    no: '08',
    name: 'Strata',
    tag: 'Signal',
    story:
      'The spark rebuilt from scanlines, cooling from flame to ember. Retro-futurist, techy, loud in the best way. The wildcard.',
    Mark: StrataMark,
    wordmark: 'terminal',
  },
]
