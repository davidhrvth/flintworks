'use client'

import { useEffect, useId, type ReactNode, type RefObject } from 'react'

// Shared plumbing for the "02 Delivered on time" candidates. Every scene draws into a fixed
// 480×200 viewBox, letterboxed with `meet` and left overflow-visible so ground lines can run
// full-bleed (the card clips them). Scenes get the pointer in viewBox units and a rAF loop that
// only runs while the card is on screen and the tab is visible. Frames are written straight to
// the DOM, so React never re-renders per frame — same approach as StressMesh.

export const W = 480
export const H = 200
const IDLE_AFTER_MS = 1400

export const INK = {
  line: '#26262E',
  dim: '#383843',
  edge: '#4A4A56',
  muted: '#6B6B7A',
  body: '#C4C4CF',
  heading: '#F0F0F5',
  ember: '#FF4D00',
  deep: '#A33A0F',
  flame: '#FF8C42',
  hot: '#FFB47E',
  white: '#FFFFFF',
} as const

export type Pointer = { x: number; y: number; inside: boolean; lastMove: number }

export type SceneApi = {
  svg: SVGSVGElement
  pointer: Pointer
  /** False under prefers-reduced-motion: scenes then rest in their finished state and only react to the pointer. */
  autoplay: boolean
  /** True once the pointer has been gone long enough for the scene to run itself again. */
  idle: () => boolean
  el: <T extends Element = SVGGraphicsElement>(key: string) => T
  all: <T extends Element = SVGGraphicsElement>(key: string) => T[]
}

export type Scene = { frame: (dt: number) => void; press?: () => void }

export function useScene(hostRef: RefObject<HTMLDivElement | null>, setup: (api: SceneApi) => Scene) {
  useEffect(() => {
    const host = hostRef.current
    const svg = host?.querySelector('svg')
    if (!host || !svg) return

    const pointer: Pointer = { x: W / 2, y: H / 2, inside: false, lastMove: -Infinity }
    const scene = setup({
      svg,
      pointer,
      autoplay: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      idle: () => !pointer.inside && performance.now() - pointer.lastMove > IDLE_AFTER_MS,
      el: <T extends Element = SVGGraphicsElement>(key: string) => {
        const node = svg.querySelector<T>(`[data-k="${key}"]`)
        if (!node) throw new Error(`Scene part "${key}" is missing`)
        return node
      },
      all: <T extends Element = SVGGraphicsElement>(key: string) =>
        Array.from(svg.querySelectorAll<T>(`[data-k="${key}"]`)),
    })

    const locate = (e: PointerEvent) => {
      const m = svg.getScreenCTM()
      if (!m) return
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
      pointer.x = p.x
      pointer.y = p.y
      pointer.inside = true
      pointer.lastMove = performance.now()
    }
    const onLeave = () => {
      pointer.inside = false
      pointer.lastMove = performance.now()
    }
    const onDown = (e: PointerEvent) => {
      locate(e)
      scene.press?.()
    }
    host.addEventListener('pointerenter', locate)
    host.addEventListener('pointermove', locate)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointercancel', onLeave)
    host.addEventListener('pointerdown', onDown)

    let raf = 0
    let last = 0
    let onScreen = false
    const tick = (now: number) => {
      scene.frame(Math.min(0.05, Math.max(0, now - last) / 1000))
      last = now
      raf = requestAnimationFrame(tick)
    }
    const sync = () => {
      if (onScreen && !document.hidden) {
        if (!raf) {
          last = performance.now()
          raf = requestAnimationFrame(tick)
        }
      } else if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        sync()
      },
      { rootMargin: '80px' },
    )
    io.observe(host)
    document.addEventListener('visibilitychange', sync)
    scene.frame(0)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      host.removeEventListener('pointerenter', locate)
      host.removeEventListener('pointermove', locate)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointercancel', onLeave)
      host.removeEventListener('pointerdown', onDown)
    }
  }, [hostRef, setup])
}

export const useSvgId = () => `s${useId().replace(/[^a-zA-Z0-9]/g, '')}`

export function SceneFrame({
  hostRef,
  cursor = 'cursor-crosshair',
  children,
}: {
  hostRef: RefObject<HTMLDivElement | null>
  cursor?: string
  children: ReactNode
}) {
  return (
    <div ref={hostRef} className={`absolute inset-0 select-none touch-pan-y ${cursor}`}>
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        {children}
      </svg>
    </div>
  )
}

// Soft bloom. User-space region so zero-height strokes (straight lines, spark trails) still render.
export function Glow({ id, blur = 2 }: { id: string; blur?: number }) {
  return (
    <filter
      id={id}
      filterUnits="userSpaceOnUse"
      x={-40}
      y={-40}
      width={W + 80}
      height={H + 80}
      colorInterpolationFilters="sRGB"
    >
      <feGaussianBlur stdDeviation={blur} result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  )
}

export function SparkLayer({ glow }: { glow: string }) {
  return (
    <g fill="none" strokeLinecap="round" filter={`url(#${glow})`}>
      <path data-k="spark-cool" stroke={INK.ember} strokeWidth={1.2} />
      <path data-k="spark-hot" stroke="#FFE1C7" strokeWidth={1.6} />
    </g>
  )
}

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number }

// Forge sparks: short streaks that fall, drag, and cool from white-hot to ember.
export class Sparks {
  private list: Spark[] = []
  private dirty = false
  private hot: SVGPathElement
  private cool: SVGPathElement
  private gravity: number

  constructor(api: SceneApi, gravity = 340) {
    this.hot = api.el<SVGPathElement>('spark-hot')
    this.cool = api.el<SVGPathElement>('spark-cool')
    this.gravity = gravity
  }

  burst(
    x: number,
    y: number,
    count: number,
    { speed = 150, angle = -Math.PI / 2, spread = Math.PI * 2, life = 0.55 } = {},
  ) {
    for (let i = 0; i < count && this.list.length < 240; i++) {
      const a = angle + (Math.random() - 0.5) * spread
      const s = speed * (0.35 + Math.random() * 0.85)
      const m = life * (0.55 + Math.random() * 0.7)
      this.list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: m, max: m })
    }
  }

  frame(dt: number) {
    if (!this.list.length && !this.dirty) return
    let hot = ''
    let cool = ''
    const drag = Math.exp(-dt * 2.2)
    for (let i = this.list.length - 1; i >= 0; i--) {
      const s = this.list[i]
      s.life -= dt
      if (s.life <= 0) {
        this.list.splice(i, 1)
        continue
      }
      s.vy += this.gravity * dt
      s.vx *= drag
      s.vy *= drag
      s.x += s.vx * dt
      s.y += s.vy * dt
      const seg = `M${r1(s.x)} ${r1(s.y)}L${r1(s.x - s.vx * 0.035)} ${r1(s.y - s.vy * 0.035)}`
      if (s.life / s.max > 0.45) hot += seg
      else cool += seg
    }
    this.hot.setAttribute('d', hot)
    this.cool.setAttribute('d', cool)
    this.dirty = this.list.length > 0
  }
}

// Critically damped by default; lower `c` for wobble.
export class Spring {
  x: number
  v = 0
  private k: number
  private c: number

  constructor(x: number, k: number, c = 2 * Math.sqrt(k)) {
    this.x = x
    this.k = k
    this.c = c
  }

  step(target: number, dt: number) {
    this.v += (this.k * (target - this.x) - this.c * this.v) * dt
    this.x += this.v * dt
    return this.x
  }
}

export const r1 = (n: number) => Math.round(n * 10) / 10
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
export const approach = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
export const easeOutBack = (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2

export function attr(el: Element, values: Record<string, string | number>) {
  for (const key in values) {
    const v = values[key]
    el.setAttribute(key, typeof v === 'number' ? String(Math.round(v * 100) / 100) : v)
  }
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

export function mix(a: string, b: string, t: number) {
  const from = rgb(a)
  const to = rgb(b)
  const k = clamp(t)
  return `rgb(${from.map((v, i) => Math.round(v + (to[i] - v) * k)).join(',')})`
}

// A hand-drawn ring: slightly more than one turn, wobbling and spiralling out so the ends overshoot.
export function scribbleLoop(cx: number, cy: number, rx: number, ry: number) {
  let d = ''
  for (let i = 0; i <= 56; i++) {
    const t = i / 56
    const a = -2.3 + t * Math.PI * 2.25
    const k = 1 + 0.05 * Math.sin(a * 3 + 1) + 0.09 * t
    d += `${i ? 'L' : 'M'}${r1(cx + Math.cos(a) * rx * k)} ${r1(cy + Math.sin(a) * ry * k)}`
  }
  return d
}

// Striped shop awning with a scalloped hem, split into [ember stripes, dark stripes].
export function awningPaths(x0: number, x1: number, y0: number, y1: number, stripes: number, flare = 5) {
  const out: [string, string] = ['', '']
  const topW = (x1 - x0) / stripes
  const botW = (x1 - x0 + flare * 2) / stripes
  for (let i = 0; i < stripes; i++) {
    const ta = r1(x0 + i * topW)
    const tb = r1(x0 + (i + 1) * topW)
    const ba = r1(x0 - flare + i * botW)
    const bb = r1(x0 - flare + (i + 1) * botW)
    out[i % 2] += `M${ta} ${y0}L${tb} ${y0}L${bb} ${y1}A${r1(botW / 2)} ${r1(botW / 2.4)} 0 0 1 ${ba} ${y1}Z`
  }
  return out
}
