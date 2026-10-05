'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ANIM_CSS, ANIM_VARIANTS, type AnimVariant } from './anim'
import { FACETS, OUTLINE, STRIKE_POINT } from './knapped'
import { Frame, sparkPath, useSvgId, type Concept, type MarkProps, type Palette } from './marks'
import { GlyphWordmark, WORDMARKS } from './wordmarks'

/* ── Static mark ────────────────────────────────────────────────────────── */

function KnappedFinalMark({ size, p }: MarkProps) {
  const id = useSvgId()
  return (
    <Frame size={size}>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="50" y1="46" x2="62" y2="90">
          <stop offset="0" stopColor={p.accent2} />
          <stop offset="1" stopColor={p.accent} />
        </linearGradient>
      </defs>
      {FACETS.map((f) => (
        <path key={f.id} d={f.d} fill={f.ember ? (p.mono ? p.accent : `url(#${id})`) : p.fg} fillOpacity={f.ember ? 1 : f.tone} />
      ))}
    </Frame>
  )
}

export const FINAL_CONCEPT: Concept = {
  id: 'knapped-final',
  no: '—',
  name: 'Knapped',
  tag: 'Final',
  story: 'The chosen mark.',
  Mark: KnappedFinalMark,
  wordmark: 'wide',
}

/* ── Intro animation ────────────────────────────────────────────────────── */

export { ANIM_CSS, ANIM_VARIANTS, type AnimVariant }

const PARTICLES: [number, number][] = [
  [14, 12],
  [4, 20],
  [20, 2],
]

type Vars = CSSProperties & Record<`--${string}`, string | number>

/**
 * Mark + name that animate in once scrolled into view. Change `playKey` to replay.
 * Needs ANIM_CSS on the page.
 */
export function AnimatedLockup({
  variant,
  wordmark,
  height,
  p,
  playKey = 0,
}: {
  variant: AnimVariant
  wordmark: 'wide' | 'terminal'
  height: number
  p: Palette
  playKey?: number
}) {
  const id = useSvgId()
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const ember = p.mono ? p.accent : `url(#${id}g)`
  const [sx, sy] = STRIKE_POINT
  return (
    <div
      key={playKey}
      ref={ref}
      className="fwa"
      data-v={variant}
      data-w={wordmark}
      data-play={seen || undefined}
      style={{ gap: Math.round(height * 0.34) }}
    >
      <svg width={height} height={height} viewBox="0 0 100 100" overflow="visible" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
        <defs>
          <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1="50" y1="46" x2="62" y2="90">
            <stop offset="0" stopColor={p.accent2} />
            <stop offset="1" stopColor={p.accent} />
          </linearGradient>
          <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <filter id={`${id}b`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <clipPath id={`${id}c`}>
            <path d={OUTLINE} />
          </clipPath>
        </defs>
        <g className="fwa-body">
          {FACETS.map((f, i) => {
            const vars: Vars = {
              '--i': f.ember && variant === 'knap' ? 6 : i,
              '--dx': `${f.out[0] * 22}px`,
              '--dy': `${f.out[1] * 22}px`,
              '--r': `${i % 2 ? 10 : -10}deg`,
            }
            if (!f.ember) return <path key={f.id} className="fwa-f" d={f.d} fill={p.fg} fillOpacity={f.tone} style={vars} />
            return (
              <g key={f.id} className="fwa-f" style={vars}>
                <path d={f.d} fill={p.fg} fillOpacity={0.2} />
                <path className="fwa-glow" d={f.d} fill={p.accent} filter={`url(#${id}b)`} />
                <path className="fwa-ember" d={f.d} fill={ember} />
                <path className="fwa-hot" d={f.d} fill={p.mono ? p.bg : '#FFE1C2'} />
              </g>
            )
          })}
          <g clipPath={`url(#${id}c)`}>
            <g transform="rotate(20 50 50)">
              <rect className="fwa-sheen" x="-70" y="-30" width="34" height="160" fill={`url(#${id}s)`} />
            </g>
          </g>
        </g>
        <path className="fwa-striker" d={sparkPath(sx, sy, 10, 10, 0.2)} fill={p.accent2} />
        <path className="fwa-burst" d={sparkPath(sx, sy, 16, 16, 0.18)} fill={p.accent2} />
        {PARTICLES.map(([px, py], k) => (
          <circle key={k} className="fwa-p" cx={sx} cy={sy} r={1.6 - k * 0.3} fill={p.accent2} style={{ '--px': `${px}px`, '--py': `${py}px` } as Vars} />
        ))}
      </svg>
      <GlyphWordmark k={wordmark} fontSize={Math.round(height * WORDMARKS[wordmark].scale)} p={p} letterClass="fwa-l" cursorClass="fwa-cursor" />
    </div>
  )
}
