import type { CSSProperties } from 'react'
import { sparkPath } from '@/components/logo-lab/geometry'
import { GLYPHS } from '@/components/logo-lab/glyphs'
import { FACETS, STRIKE_POINT } from '@/components/logo-lab/knapped'

// Brand-kit logo (dark-background variant) drawn from the same geometry as brand-kit/logo/svg.
// Fixed brand colours; the wordmark is outlined, so there's no font dependency.
// `animated` adds the hover/focus strike (styles live in globals.css under "Logo hover").

const BONE = '#F0F0F5'
const EMBER_FACET = FACETS.find((f) => f.ember)!

function mix(t: number) {
  const a = [0xf0, 0xf0, 0xf5]
  const b = [0x0a, 0x0a, 0x0b]
  return `#${a.map((v, i) => Math.round(v * t + b[i] * (1 - t)).toString(16).padStart(2, '0')).join('')}`
}

export function LogoMark({ height = 28, className = '', animated = false }: { height?: number; className?: string; animated?: boolean }) {
  const [sx, sy] = STRIKE_POINT
  return (
    <svg
      viewBox="24 4 52 92"
      height={height}
      width={(height * 52) / 92}
      overflow="visible"
      className={`fw-logo__mark ${className}`}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="fw-logo-ember" gradientUnits="userSpaceOnUse" x1="50" y1="46" x2="62" y2="90">
          <stop offset="0" stopColor="#FF8C42" />
          <stop offset="1" stopColor="#FF4D00" />
        </linearGradient>
      </defs>
      {FACETS.map((f) => (
        <path key={f.id} d={f.d} fill={f.ember ? 'url(#fw-logo-ember)' : mix(f.tone)} />
      ))}
      {animated && (
        <>
          <path className="fw-logo__hot" d={EMBER_FACET.d} fill="#FFE1C2" />
          <path className="fw-logo__spark" d={sparkPath(sx, sy, 13, 13, 0.2)} fill="#FF8C42" />
        </>
      )}
    </svg>
  )
}

const W = GLYPHS.wide
const [X0, Y0, X1, Y1] = W.bbox

export function Wordmark({ height = 12, className }: { height?: number; className?: string }) {
  return (
    <svg
      viewBox={`${X0} ${Y0} ${X1 - X0} ${Y1 - Y0}`}
      height={height}
      width={(height * (X1 - X0)) / (Y1 - Y0)}
      className={className}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
      fill={BONE}
    >
      {W.letters.map((l, i) => (
        <path key={i} d={l.d} className="fw-logo__letter" style={{ '--i': i } as CSSProperties} />
      ))}
    </svg>
  )
}

/** Mark + name, matching brand-kit/logo/svg/flintworks-logo-on-dark.svg. `height` is the mark's height. */
export function Logo({ height = 28, className = '', animated = false }: { height?: number; className?: string; animated?: boolean }) {
  return (
    <span
      className={`inline-flex items-center ${animated ? 'fw-logo--animated' : ''} ${className}`}
      style={{ gap: Math.round(height * 0.34) }}
    >
      <LogoMark height={height} animated={animated} />
      <Wordmark height={Math.round(height * 0.36)} />
    </span>
  )
}
