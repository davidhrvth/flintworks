import { Faceted, fmt, Frame, poly, sparkPath, useSvgId, type Concept, type MarkProps, type Pt } from './marks'

// Round 2: the shard family. Everything grows out of R1's 02 Strike and 03 Knapped.

/* Shared blade silhouette — taller and sharper than R1's Knapped. */
const BL = {
  T: [50, 4],
  R1: [76, 36],
  R2: [68, 80],
  B: [50, 96],
  L2: [32, 80],
  L1: [24, 36],
  M: [50, 46],
} as const satisfies Record<string, Pt>

/**
 * Closed outline whose edges are runs of shallow inward scallops — the conchoidal
 * flake scars that make a knapped point read as flint. Points must run clockwise.
 */
function scalloped(pts: Pt[], seg = 14, sag = 1.1) {
  let d = `M${pts[0][0]} ${pts[0][1]}`
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    const n = Math.max(1, Math.round(len / seg))
    const l = len / n
    const r = fmt((l * l) / 4 / (2 * sag) + sag / 2)
    for (let k = 1; k <= n; k++) {
      d += `A${r} ${r} 0 0 0 ${fmt(a[0] + ((b[0] - a[0]) * k) / n)} ${fmt(a[1] + ((b[1] - a[1]) * k) / n)}`
    }
  })
  return `${d}Z`
}

const BLADE_SCALLOPED = scalloped([BL.T, BL.R1, BL.R2, BL.B, BL.L2, BL.L1])

/* ── Knapped II ─────────────────────────────────────────────────────────── */

function KnappedIIMark({ size, p }: MarkProps) {
  const id = useSvgId()
  const { T, R1, R2, B, L2, L1, M } = BL
  const glow = p.mono ? p.accent : `url(#${id})`
  return (
    <Frame size={size}>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={M[0]} y1={M[1]} x2="62" y2="90">
          <stop offset="0" stopColor={p.accent2} />
          <stop offset="1" stopColor={p.accent} />
        </linearGradient>
      </defs>
      <Faceted
        facets={[
          [poly(L1, T, M), p.fg, 1],
          [poly(T, R1, M), p.fg, 0.74],
          [poly(L1, M, L2), p.fg, 0.52],
          [poly(R1, R2, M), p.fg, 0.32],
          [poly(L2, M, B), p.fg, 0.2],
          [poly(M, R2, B), glow, 1],
        ]}
        cuts={[T, R1, R2, B, L2, L1].map((v) => [M, v])}
      />
    </Frame>
  )
}

/* ── Chip ───────────────────────────────────────────────────────────────── */

// One flat silhouette with knapped edges, one flake knocked off the shoulder, one spark where it broke.
function ChipMark({ size, p }: MarkProps) {
  const id = useSvgId()
  return (
    <Frame size={size}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect width="100" height="100" fill="white" />
          <circle cx="78" cy="30" r="12.5" fill="black" />
        </mask>
      </defs>
      <path d={BLADE_SCALLOPED} fill={p.fg} mask={`url(#${id})`} />
      <path d={sparkPath(78, 30, 9, 9, 0.22)} fill={p.accent} />
    </Frame>
  )
}

/* ── Tag ────────────────────────────────────────────────────────────────── */

// Two flint shards knapped into angle brackets, spark between them: <✦>
const BRACKET = {
  A: [30, 16],
  P: [4, 50],
  B: [30, 84],
  Bi: [40, 76],
  Pi: [18, 50],
  Ai: [40, 24],
} as const satisfies Record<string, Pt>

const mirror = ([x, y]: Pt): Pt => [100 - x, y]

function TagMark({ size, p }: MarkProps) {
  const { A, P, B, Bi, Pi, Ai } = BRACKET
  const top = [A, P, Pi, Ai]
  const bottom = [P, B, Bi, Pi]
  return (
    <Frame size={size}>
      <path d={poly(...top)} fill={p.fg} />
      <path d={poly(...bottom)} fill={p.fg} fillOpacity={0.45} />
      <path d={poly(...top.map(mirror))} fill={p.fg} />
      <path d={poly(...bottom.map(mirror))} fill={p.fg} fillOpacity={0.45} />
      <path d={sparkPath(50, 50, 30, 12, 0.25)} fill={p.accent} />
    </Frame>
  )
}

/* ── Strike II ──────────────────────────────────────────────────────────── */

function StrikeIIMark({ size, p }: MarkProps) {
  const top: Pt[] = [[5, 26], [41, 50], [16, 50]]
  const bottom: Pt[] = [[16, 50], [41, 50], [5, 74]]
  return (
    <Frame size={size}>
      <path d={poly(...top)} fill={p.fg} />
      <path d={poly(...bottom)} fill={p.fg} fillOpacity={0.45} />
      <path d={poly(...top.map(mirror))} fill={p.fg} />
      <path d={poly(...bottom.map(mirror))} fill={p.fg} fillOpacity={0.45} />
      <path d={sparkPath(50, 50, 42, 12, 0.26)} fill={p.accent} />
    </Frame>
  )
}

/* ── Hex ────────────────────────────────────────────────────────────────── */

const HEX: Pt[] = Array.from({ length: 6 }, (_, i) => {
  const a = ((-90 + 60 * i) * Math.PI) / 180
  return [Math.round((50 + 46 * Math.cos(a)) * 100) / 100, Math.round((50 + 46 * Math.sin(a)) * 100) / 100] as const
})
const HEX_C: Pt = [50, 50]

// Half stone, half fire: the left faces are cold flint, the right faces catch the spark's light.
function HexMark({ size, p }: MarkProps) {
  const [V0, V1, V2, V3, V4, V5] = HEX
  const deep = p.mono ? p.fg : '#C23A00'
  return (
    <Frame size={size}>
      <Faceted
        facets={[
          [poly(V5, V0, HEX_C), p.fg, 1],
          [poly(V4, V5, HEX_C), p.fg, 0.58],
          [poly(V3, V4, HEX_C), p.fg, 0.28],
          [poly(V0, V1, HEX_C), p.accent2, 1],
          [poly(V1, V2, HEX_C), p.accent, 1],
          [poly(V2, V3, HEX_C), deep, p.mono ? 0.5 : 1],
        ]}
        cuts={HEX.map((v) => [HEX_C, v])}
      />
    </Frame>
  )
}

/* ── Pointer ────────────────────────────────────────────────────────────── */

// A knapped arrowhead is the same shape as a mouse cursor. The spark is the click.
function PointerMark({ size, p }: MarkProps) {
  const T: Pt = [38, 25]
  const W1: Pt = [38, 94]
  const N: Pt = [57, 74]
  const W2: Pt = [85, 72]
  return (
    <Frame size={size}>
      <path d={poly(T, W1, N)} fill={p.fg} />
      <path d={poly(T, N, W2)} fill={p.fg} fillOpacity={0.45} />
      <path d={sparkPath(26, 13, 12, 12, 0.22)} fill={p.accent} />
    </Frame>
  )
}

/* ── Registry ───────────────────────────────────────────────────────────── */

export const ROUND_2: Concept[] = [
  {
    id: 'knapped-2',
    no: '01',
    name: 'Knapped II',
    tag: 'Refined',
    story:
      'Your R1 favourite, sharpened: a taller blade, cleaner cuts, one consistent light source, and the struck facet now glows from flame to ember.',
    Mark: KnappedIIMark,
    wordmark: 'unbounded',
  },
  {
    id: 'chip',
    no: '02',
    name: 'Chip',
    tag: 'Icon',
    story:
      'The Apple move: one flat silhouette, one bite. Scalloped edges like a real knapped point, a flake knocked off the shoulder, and the spark it threw. Works in any single colour.',
    Mark: ChipMark,
    wordmark: 'wide',
  },
  {
    id: 'tag',
    no: '03',
    name: 'Tag',
    tag: 'Code',
    story:
      'The two Strike shards turned outward become angle brackets — <✦>. Flint, spark, and “we write code” in one symmetrical glyph.',
    Mark: TagMark,
    wordmark: 'terminal',
  },
  {
    id: 'strike-2',
    no: '04',
    name: 'Strike II',
    tag: 'Refined',
    story:
      'Your other R1 favourite, scaled up: bigger shards, and a spark with real body so it holds its own at small sizes instead of vanishing into a line.',
    Mark: StrikeIIMark,
    wordmark: 'unbounded-caps',
  },
  {
    id: 'hex',
    no: '05',
    name: 'Hex',
    tag: 'Badge',
    story:
      'Knapped, made perfectly geometric: a hexagon cut into six faces — half cold stone, half catching fire. The most “badge” of the set, and hex is native tech.',
    Mark: HexMark,
    wordmark: 'wide',
  },
  {
    id: 'pointer',
    no: '06',
    name: 'Pointer',
    tag: 'Wildcard',
    story:
      'A knapped arrowhead is the same shape as a mouse cursor — 10,000 years of tools in one glyph, with the spark as the click. Not symmetrical, but hard to forget.',
    Mark: PointerMark,
    wordmark: 'unbounded',
  },
]
