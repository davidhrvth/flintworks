'use client'

import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// "02 Delivered on time" visual on the home page. An order tracker, the screen people watch when
// their food is on the way: a courier dot runs Ordered → Being built → Almost ready → Delivered,
// each step filling in as it lands, while the headline and a one-line promise above follow along.
// Hovering a step sends the order there; clicking throws sparks off the current step. Left alone
// it runs the order through, holds on Delivered, fades and starts over (skipped under reduced
// motion, which rests on Delivered). React only renders the copy, so a language switch just swaps
// text; frames are written straight to the DOM, so React never re-renders per frame.

type Step = { label: string; status: string; note: string }
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number }

const W = 480
const H = 200
const X0 = 64
const X1 = 416
const Y = 128
const GAP = (X1 - X0) / 3
const LAST = 3
const ICONS = [
  // Receipt, hammer, parcel, tick.
  'M-4.5 -6.5h9v13l-2.25-1.4L0 6.5l-2.25-1.4L-4.5 6.5zM-2 -3h4M-2 0h4M-2 3h2.5',
  'M-5 6L1 0M-2.9 -3.1L-0.1 -5.9L6.9 1.1L4.1 3.9Z',
  'M-6 -3.5l6-3 6 3v7l-6 3-6-3zM-6 -3.5l6 3 6-3M0 -0.5v7',
  'M-5 0.5l3.3 3.3L5.5 -4',
]

const EMBER = '#FF4D00'
const FLAME = '#FF8C42'
const MUTED = '#6B6B7A'
const HEADING = '#F0F0F5'
const WHITE = '#FFFFFF'

const SPRING = 42
const IDLE_AFTER_MS = 1400
const HOLD_S = [1.1, 1.6, 1.6, 3.4]
const FADE_S = 0.4
const SWAP_S = 0.35

const xAt = (p: number) => X0 + GAP * p
const r1 = (n: number) => Math.round(n * 10) / 10
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const mix = (a: string, b: string, t: number) => {
  const from = rgb(a)
  const to = rgb(b)
  return `rgb(${from.map((v, i) => Math.round(v + (to[i] - v) * clamp(t))).join(',')})`
}

export function DeliveryTracker() {
  const { t } = useTranslation()
  const steps = t('home.whyFlintworks.items.02.tracker.steps', { returnObjects: true }) as Step[]
  const id = `track${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const hostRef = useRef<HTMLDivElement>(null)
  const progRef = useRef<SVGGElement>(null)
  const barRef = useRef<SVGLineElement>(null)
  const courierRef = useRef<SVGGElement>(null)
  const pulseRef = useRef<SVGCircleElement>(null)
  const pillBgRef = useRef<SVGRectElement>(null)
  const pillDotRef = useRef<SVGCircleElement>(null)
  const pillTextRef = useRef<SVGTextElement>(null)
  const sparkHotRef = useRef<SVGPathElement>(null)
  const sparkCoolRef = useRef<SVGPathElement>(null)
  const doneRefs = useRef<(SVGGElement | null)[]>([])
  const labelRefs = useRef<(SVGTextElement | null)[]>([])
  const copyRefs = useRef<(SVGGElement | null)[]>([])

  useEffect(() => {
    const host = hostRef.current
    const svg = host?.querySelector('svg')
    const prog = progRef.current
    const bar = barRef.current
    const courier = courierRef.current
    const pulse = pulseRef.current
    const pillBg = pillBgRef.current
    const pillDot = pillDotRef.current
    const pillText = pillTextRef.current
    const sparkHot = sparkHotRef.current
    const sparkCool = sparkCoolRef.current
    const done = doneRefs.current
    const labels = labelRefs.current
    const copies = copyRefs.current
    if (!host || !svg || !prog || !bar || !courier || !pulse) return
    if (!pillBg || !pillDot || !pillText || !sparkHot || !sparkCool) return
    if ([done, labels, copies].some((list) => list.length !== ICONS.length || list.some((el) => !el))) return

    const autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: 0, inside: false, lastMove: -Infinity }
    const idle = () => !pointer.inside && performance.now() - pointer.lastMove > IDLE_AFTER_MS

    let pos = autoplay ? 0 : LAST
    let vel = 0
    let target = pos
    let phase: 'step' | 'fade' = 'step'
    let timer = 0
    let fade = 1
    let time = 0
    const reached = ICONS.map((_, i) => i <= pos)
    let shown = reached.lastIndexOf(true)
    let swap = 1
    const level = reached.map((r): number => (r ? 1 : 0))
    const pop = ICONS.map(() => 1)
    const sparks: Spark[] = []
    let sparksDrawn = false

    const burst = (x: number, count: number, speed: number) => {
      for (let i = 0; i < count && sparks.length < 200; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 2
        const s = speed * (0.35 + Math.random() * 0.85)
        const m = 0.55 * (0.55 + Math.random() * 0.7)
        sparks.push({ x, y: Y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: m, max: m })
      }
    }

    // Streaks that fall, drag, and cool from white-hot to ember.
    const drawSparks = (dt: number) => {
      if (!sparks.length && !sparksDrawn) return
      let hot = ''
      let cool = ''
      const drag = Math.exp(-dt * 2.2)
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.life -= dt
        if (s.life <= 0) {
          sparks.splice(i, 1)
          continue
        }
        s.vy += 340 * dt
        s.vx *= drag
        s.vy *= drag
        s.x += s.vx * dt
        s.y += s.vy * dt
        const seg = `M${r1(s.x)} ${r1(s.y)}L${r1(s.x - s.vx * 0.035)} ${r1(s.y - s.vy * 0.035)}`
        if (s.life / s.max > 0.45) hot += seg
        else cool += seg
      }
      sparkHot.setAttribute('d', hot)
      sparkCool.setAttribute('d', cool)
      sparksDrawn = sparks.length > 0
    }

    const frame = (dt: number) => {
      time += dt
      if (pointer.inside) {
        target = clamp(Math.round((pointer.x - X0) / GAP), 0, LAST)
        phase = 'step'
        timer = 0
      } else if (autoplay && idle()) {
        timer += dt
        if (phase === 'step') {
          if (timer > HOLD_S[target]) {
            timer = 0
            if (target < LAST) target++
            else phase = 'fade'
          }
        } else if (fade <= 0) {
          pos = 0
          vel = 0
          target = 0
          reached.fill(false)
          level.fill(0)
          phase = 'step'
          timer = 0
        }
      }
      fade = phase === 'fade' ? Math.max(0, fade - dt / FADE_S) : Math.min(1, fade + dt / FADE_S)
      vel += (SPRING * (target - pos) - 2 * Math.sqrt(SPRING) * vel) * dt
      pos += vel * dt
      const p = clamp(pos, 0, LAST)

      for (let i = 0; i <= LAST; i++) {
        if (!reached[i] && p >= i - 0.05) {
          reached[i] = true
          pop[i] = 0
          burst(xAt(i), i === LAST ? 40 : 10, i === LAST ? 200 : 110)
        } else if (reached[i] && p < i - 0.3) {
          reached[i] = false
        }
        level[i] += ((reached[i] ? 1 : 0) - level[i]) * ease(dt, 12)
        pop[i] = Math.min(1, pop[i] + dt / 0.45)
        const scale = 1 + 0.3 * Math.sin(pop[i] * Math.PI) * (1 - pop[i])
        done[i]!.setAttribute('opacity', (level[i] * fade).toFixed(3))
        done[i]!.setAttribute('transform', `translate(${r1(xAt(i))} ${Y}) scale(${scale.toFixed(3)})`)
        labels[i]!.setAttribute('fill', mix(MUTED, HEADING, level[i] * fade))
      }

      // The headline follows the furthest step reached, sliding up as it changes.
      const k = Math.max(0, reached.lastIndexOf(true))
      if (k !== shown) {
        copies[shown]!.setAttribute('opacity', '0')
        shown = k
        swap = 0
      }
      swap = Math.min(1, swap + dt / SWAP_S)
      copies[k]!.setAttribute('opacity', swap.toFixed(3))
      copies[k]!.setAttribute('transform', `translate(0 ${r1((1 - swap) ** 3 * 6)})`)

      const x = r1(xAt(p))
      prog.setAttribute('opacity', fade.toFixed(3))
      bar.setAttribute('x2', String(x))
      courier.setAttribute('transform', `translate(${x} ${Y})`)
      const u = (time % 1.5) / 1.5
      pulse.setAttribute('cx', String(r1(xAt(k))))
      pulse.setAttribute('r', String(r1(15 + 12 * u)))
      pulse.setAttribute('opacity', (k === LAST ? 0 : (1 - u) * 0.55 * fade).toFixed(3))

      const delivered = level[LAST] * fade
      pillBg.setAttribute('fill-opacity', (0.1 + 0.9 * delivered).toFixed(3))
      pillText.setAttribute('fill', mix(FLAME, WHITE, delivered))
      pillDot.setAttribute('r', String(r1(3 + (1 - delivered) * 0.8 * Math.sin(time * 5))))
      pillDot.setAttribute('fill', mix(EMBER, WHITE, delivered))
      drawSparks(dt)
    }

    const locate = (e: PointerEvent) => {
      const m = svg.getScreenCTM()
      if (!m) return
      pointer.x = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()).x
      pointer.inside = true
      pointer.lastMove = performance.now()
    }
    const onLeave = () => {
      pointer.inside = false
      pointer.lastMove = performance.now()
    }
    const onDown = (e: PointerEvent) => {
      locate(e)
      burst(xAt(shown), 22, 160)
    }
    host.addEventListener('pointerenter', locate)
    host.addEventListener('pointermove', locate)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointercancel', onLeave)
    host.addEventListener('pointerdown', onDown)

    // Only animate while the card is on screen and the tab is visible.
    let raf = 0
    let last = 0
    let onScreen = false
    const tick = (now: number) => {
      frame(Math.min(0.05, Math.max(0, now - last) / 1000))
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
    frame(0)

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
  }, [])

  return (
    <div ref={hostRef} className="absolute inset-0 cursor-pointer select-none touch-pan-y">
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id={`${id}-glow`}
            filterUnits="userSpaceOnUse"
            x={-40}
            y={-40}
            width={W + 80}
            height={H + 80}
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={2} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={`${id}-halo`}>
            <stop offset="0" stopColor={EMBER} stopOpacity={0.55} />
            <stop offset="1" stopColor={EMBER} stopOpacity={0} />
          </radialGradient>
        </defs>

        <text x={40} y={34} fontSize={8.5} letterSpacing={1.4} fill={MUTED} className="font-mono">
          {t('home.whyFlintworks.items.02.tracker.project')} · #FW-0231
        </text>
        {steps.map((step, i) => (
          <g
            key={i}
            ref={(el) => {
              copyRefs.current[i] = el
            }}
            opacity={0}
          >
            <text x={40} y={62} fontSize={21} fontWeight={700} fill={HEADING} className="font-display">
              {step.status}
            </text>
            <text x={40} y={81} fontSize={11} fill="#8E8E9C" className="font-sans">
              {step.note}
            </text>
          </g>
        ))}
        <g transform="translate(440 30)">
          <rect
            ref={pillBgRef}
            x={-74}
            y={-10}
            width={74}
            height={20}
            rx={10}
            fill={EMBER}
            fillOpacity={0.1}
            stroke={EMBER}
            strokeOpacity={0.5}
          />
          <circle ref={pillDotRef} cx={-62} cy={0} r={3} fill={EMBER} />
          <text
            ref={pillTextRef}
            x={-54}
            y={3.3}
            fontSize={9}
            fontWeight={700}
            letterSpacing={1.2}
            fill={FLAME}
            className="font-mono"
          >
            {t('home.whyFlintworks.items.02.tracker.onTime')}
          </text>
        </g>

        <line x1={X0} x2={X1} y1={Y} y2={Y} stroke="#26262E" strokeWidth={4} strokeLinecap="round" />
        <g ref={progRef}>
          <line
            ref={barRef}
            x1={X0}
            x2={X0}
            y1={Y}
            y2={Y}
            stroke={EMBER}
            strokeWidth={4}
            strokeLinecap="round"
            filter={`url(#${id}-glow)`}
          />
          <g ref={courierRef} transform={`translate(${X0} ${Y})`}>
            <circle r={13} fill={`url(#${id}-halo)`} />
            <circle r={4.5} fill="#FFE8D6" filter={`url(#${id}-glow)`} />
          </g>
        </g>

        {ICONS.map((icon, i) => (
          <g key={i} transform={`translate(${xAt(i)} ${Y})`}>
            <circle r={15} fill="#111114" stroke="#383843" strokeWidth={1.5} />
            <path d={icon} fill="none" stroke={MUTED} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
        {ICONS.map((icon, i) => (
          <g
            key={i}
            ref={(el) => {
              doneRefs.current[i] = el
            }}
            opacity={0}
            transform={`translate(${xAt(i)} ${Y})`}
          >
            <circle r={15} fill={EMBER} filter={`url(#${id}-glow)`} />
            <path d={icon} fill="none" stroke={WHITE} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
        <circle ref={pulseRef} cy={Y} r={15} fill="none" stroke={EMBER} strokeWidth={1.5} opacity={0} />
        {steps.map((step, i) => (
          <text
            key={i}
            ref={(el) => {
              labelRefs.current[i] = el
            }}
            x={xAt(i)}
            y={Y + 36}
            textAnchor="middle"
            fontSize={10.5}
            fill={MUTED}
            className="font-sans"
          >
            {step.label}
          </text>
        ))}

        <g fill="none" strokeLinecap="round" filter={`url(#${id}-glow)`}>
          <path ref={sparkCoolRef} stroke={EMBER} strokeWidth={1.2} />
          <path ref={sparkHotRef} stroke="#FFE1C7" strokeWidth={1.6} />
        </g>
      </svg>
    </div>
  )
}
