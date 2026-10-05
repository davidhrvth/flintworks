// Final Knapped geometry (100×100 viewBox). The knife-cut gaps between facets are real
// geometry — each facet is inset along its inner edges — so the mark needs no masks or ids.
// That keeps exported SVGs clean and lets every facet animate independently.

type Pt = readonly [number, number]

const V = {
  T: [50, 4],
  R1: [76, 36],
  R2: [68, 80],
  B: [50, 96],
  L2: [32, 80],
  L1: [24, 36],
  M: [50, 46],
} as const satisfies Record<string, Pt>

const GAP = 2.4

const r2 = (n: number) => Math.round(n * 100) / 100

/** Line a→b shifted by `dist` toward point `toward`. */
function shifted(a: Pt, b: Pt, toward: Pt, dist: number): [Pt, Pt] {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy)
  let nx = -dy / len
  let ny = dx / len
  if ((toward[0] - a[0]) * nx + (toward[1] - a[1]) * ny < 0) {
    nx = -nx
    ny = -ny
  }
  return [
    [a[0] + nx * dist, a[1] + ny * dist],
    [b[0] + nx * dist, b[1] + ny * dist],
  ]
}

function intersect([p1, p2]: [Pt, Pt], [p3, p4]: [Pt, Pt]): Pt {
  const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0])
  const a = p1[0] * p2[1] - p1[1] * p2[0]
  const b = p3[0] * p4[1] - p3[1] * p4[0]
  return [r2((a * (p3[0] - p4[0]) - (p1[0] - p2[0]) * b) / d), r2((a * (p3[1] - p4[1]) - (p1[1] - p2[1]) * b) / d)]
}

/** Triangle M-A-B with the two inner edges (M-A, M-B) pulled in by half the gap; outer edge A-B untouched. */
function insetFacet(a: Pt, b: Pt): Pt[] {
  const { M } = V
  const ma = shifted(M, a, b, GAP / 2)
  const mb = shifted(M, b, a, GAP / 2)
  return [intersect(ma, mb), intersect(ma, [a, b]), intersect(mb, [a, b])]
}

export type Facet = {
  id: string
  d: string
  /** Opacity of the ink colour; ignored for the ember facet. */
  tone: number
  ember: boolean
  /** Unit vector from the centre through the facet — the direction it flies in from. */
  out: Pt
}

// Clockwise from top-left. Light comes from the top-left; the lower-right face is the struck, glowing one.
const LAYOUT: [id: string, a: Pt, b: Pt, tone: number, ember?: true][] = [
  ['ul', V.L1, V.T, 1],
  ['ur', V.T, V.R1, 0.74],
  ['mr', V.R1, V.R2, 0.32],
  ['lr', V.R2, V.B, 1, true],
  ['ll', V.B, V.L2, 0.2],
  ['ml', V.L2, V.L1, 0.52],
]

export const FACETS: Facet[] = LAYOUT.map(([id, a, b, tone, ember]) => {
  const pts = insetFacet(a, b)
  const cx = (V.M[0] + a[0] + b[0]) / 3 - V.M[0]
  const cy = (V.M[1] + a[1] + b[1]) / 3 - V.M[1]
  const len = Math.hypot(cx, cy)
  return {
    id,
    d: `M${pts.map(([x, y]) => `${x} ${y}`).join('L')}Z`,
    tone,
    ember: !!ember,
    out: [r2(cx / len), r2(cy / len)],
  }
})

export const OUTLINE = `M${[V.T, V.R1, V.R2, V.B, V.L2, V.L1].map(([x, y]) => `${x} ${y}`).join('L')}Z`

/** Where the struck face meets the outer edge — sparks fly from here. */
export const STRIKE_POINT: Pt = [63, 91]
