'use client'

import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// "03 Designed to convert" visual on the home page. A live chart of weekly sign-ups that never
// stops: it scrolls left forever, grey and flat until the first launch, ember after it. Every
// launch (a chip on the line) kicks the curve up and adds momentum, launches compound, and the
// axis rescales so the year on screen always fits. The headline reads growth against a year
// earlier, so it stays believable however long the chart runs. Hovering slows the chart and reads
// it like a real one (crosshair and tooltip); clicking ships an improvement right now. Under
// reduced motion it holds still and a click ships and jumps two months ahead. React only renders
// the copy; frames are written straight to the DOM, so React never re-renders per frame.

type Ship = { at: number; gain: number; label: number; chip: boolean; marker: number; pop: number }
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number }

const W = 480
const H = 200
const X0 = 28
const X1 = 452
const TOP = 66
const BOT = 170
const SPAN = 52 // weeks on screen; week 0 is the first week of January
const QUARTER = SPAN / 4
const STEP = 0.5 // weeks between line samples
const SPEED = 5 // weeks per second
const HOVER_SPEED = 1.5
const GAP = [15, 24] // weeks between launches when left alone
const GAIN = [0.44, 0.6] // log growth a launch adds once it has played out
const KICK = 0.2 // share of that growth that lands straight away
const TAU = 24 // weeks for the rest of it to build up, so launches overlap and compound
const MERGE = 4 // a click this soon after a launch boosts it instead of adding one
const CHIP_GAP = 12 // launches closer than this get a dot but no chip, so chips never overlap
const FLOOR = 0.35 // a flat line sits this high in the chart
const KEEP = 2 * SPAN + 8 * TAU // launches older than this weigh the same everywhere on screen
const MARKERS = 14
const TICKS = 5

const EMBER = '#FF4D00'
const FLAME = '#FF8C42'
const MUTED = '#6B6B7A'
const HEADING = '#F0F0F5'
const LINE = '#26262E'

const r1 = (n: number) => Math.round(n * 10) / 10
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)
const between = ([lo, hi]: number[]) => lo + Math.random() * (hi - lo)
const easeOutBack = (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2
const wiggle = (w: number) =>
  1 + 0.03 * Math.sin(w * 1.18 + 0.7) + 0.022 * Math.sin(w * 2.48 + 1.1) + 0.012 * Math.sin(w * 0.47 + 2.3)
const percent = (v: number) => `${v < 0 ? '−' : '+'}${Math.abs(Math.round(v * 100))}%`

export function GrowthCurve() {
  const { t } = useTranslation()
  const months = t('home.whyFlintworks.items.03.chart.months', { returnObjects: true }) as string[]
  const launches = t('home.whyFlintworks.items.03.chart.launches', { returnObjects: true }) as string[]
  const id = `growth${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const hostRef = useRef<HTMLDivElement>(null)
  // The frame loop reads labels from here, so a language switch reaches chips already on screen.
  const copyRef = useRef({ months, launches })

  useEffect(() => {
    copyRef.current = { months, launches }
  }, [months, launches])

  useEffect(() => {
    const host = hostRef.current
    const svg = host?.querySelector('svg')
    if (!host || !svg) return
    const one = <T extends Element = SVGElement>(key: string) => svg.querySelector<T>(`[data-k="${key}"]`)
    const many = <T extends Element = SVGElement>(key: string) =>
      Array.from(svg.querySelectorAll<T>(`[data-k="${key}"]`))
    const line = one('line')
    const area = one('area')
    const head = one('head')
    const pulse = one('pulse')
    const tip = one('tip')
    const tipLine = one('tip-line')
    const tipDot = one('tip-dot')
    const tipBox = one('tip-box')
    const tipText = one('tip-text')
    const valueEl = one('value')
    const sparkHot = one('spark-hot')
    const sparkCool = one('spark-cool')
    const stops = many('stop')
    const ticks = many<SVGGElement>('tick')
    const dots = many('marker-dot')
    const markers = many<SVGGElement>('marker').map((g, i) => ({
      g,
      dot: dots[i],
      line: g.querySelector('[data-part="line"]'),
      chip: g.querySelector('[data-part="chip"]'),
      rect: g.querySelector('[data-part="rect"]'),
      text: g.querySelector('[data-part="text"]'),
      label: '',
    }))
    if (!line || !area || !head || !pulse || !tip || !tipLine || !tipDot || !tipBox || !tipText || !valueEl) return
    if (!sparkHot || !sparkCool || stops.length !== 4 || ticks.length !== TICKS || markers.length !== MARKERS) return
    if (markers.some((m) => !m.dot || !m.line || !m.chip || !m.rect || !m.text)) return

    const autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: 0, inside: false }

    let now = 26
    let speed = autoplay ? SPEED : 0
    let ships: Ship[] = []
    let nextLabel = 0
    let nextAuto = now + 5
    // Values are exp(level - ref). Dropping an old launch lowers level evenly everywhere, so ref
    // drops with it; rebasing moves ref and the scale together. Either way nothing on screen moves.
    let ref = 0
    let scale = 0
    let scaleV = 0
    let time = 0
    let headPop = 1
    let tipOn = 0
    let shown = 0
    let shownText = ''
    const sparks: Spark[] = []

    const level = (w: number) => {
      let l = 0
      for (const s of ships) {
        const d = w - s.at
        if (d <= 0) continue
        const k = Math.min(1, d / 1.5)
        l += s.gain * (KICK * k * k * (3 - 2 * k) + (1 - KICK) * (1 - Math.exp(-d / TAU)))
      }
      return l
    }
    const value = (w: number) => Math.exp(level(w) - ref) * wiggle(w)
    const yoy = (w: number) => Math.exp(level(w) - level(w - SPAN)) * (wiggle(w) / wiggle(w - SPAN)) - 1
    const px = (w: number) => X1 - ((now - w) / SPAN) * (X1 - X0)
    const py = (v: number) => BOT - (v / scale) * (BOT - TOP)

    const burst = (x: number, y: number, count: number, speed: number) => {
      for (let i = 0; i < count && sparks.length < 160; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 2
        const s = speed * (0.35 + Math.random() * 0.85)
        const m = 0.55 * (0.55 + Math.random() * 0.7)
        sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: m, max: m })
      }
    }
    const drawSparks = (dt: number) => {
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
    }

    const launch = (at: number, quiet = false) => {
      const last = ships[ships.length - 1]
      if (last && at - last.at < MERGE) {
        last.gain = Math.min(0.9, last.gain + 0.14)
      } else {
        let lastChip = -Infinity
        for (const s of ships) if (s.chip) lastChip = s.at
        const chip = at - lastChip >= CHIP_GAP
        ships.push({ at, gain: between(GAIN), label: chip ? nextLabel++ : -1, chip, marker: -1, pop: quiet ? 1 : 0 })
      }
      if (!quiet && scale) {
        headPop = 0
        burst(X1, py(value(now)), 18, 160)
      }
    }

    if (autoplay) [34, 14].forEach((ago) => launch(now - ago, true))
    else [40, 24, 9].forEach((ago) => launch(now - ago, true))

    const frame = (dt: number) => {
      time += dt
      speed += ((autoplay ? (pointer.inside ? HOVER_SPEED : SPEED) : 0) - speed) * ease(dt, 4)
      now += speed * dt
      if (autoplay && now >= nextAuto) {
        launch(nextAuto)
        nextAuto += between(GAP)
      }

      ships = ships.filter((s) => {
        if (s.at > now - KEEP) return true
        ref -= s.gain
        return false
      })
      const drift = level(now) - ref
      if (drift > 30) {
        ref += drift
        scale *= Math.exp(-drift)
        scaleV *= Math.exp(-drift)
      }

      // Sample the line at fixed weeks so its wiggles scroll rigidly instead of shimmering.
      const start = now - SPAN
      const ws = [start]
      for (let w = Math.floor(start / STEP) * STEP + STEP; w < now; w += STEP) ws.push(w)
      ws.push(now)
      const vs = ws.map(value)
      const target = Math.max(Math.max(...vs) * 1.12, Math.min(...vs) / FLOOR)
      if (!scale) scale = target
      scaleV += (40 * (target - scale) - 2 * Math.sqrt(40) * scaleV) * dt
      scale += scaleV * dt

      // Grey until the first launch, then ember warming to flame at the head.
      const first = ships.length ? ships[0].at : Infinity
      const f = (first - start) / SPAN
      stops[1].setAttribute('offset', clamp(f - 0.015).toFixed(4))
      stops[2].setAttribute('offset', clamp(f + 0.015).toFixed(4))
      let d = ''
      let a = ''
      ws.forEach((w, i) => {
        const pt = `${r1(px(w))} ${r1(py(vs[i]))}`
        d += `${d ? 'L' : 'M'}${pt}`
        if (w >= first) a += `L${pt}`
      })
      line.setAttribute('d', d)
      if (first < now) {
        const from = Math.max(first, start)
        area.setAttribute('d', `M${r1(px(from))} ${BOT}L${r1(px(from))} ${r1(py(value(from)))}${a}L${X1} ${BOT}Z`)
      } else area.setAttribute('d', '')

      const hy = py(vs[vs.length - 1])
      headPop = Math.min(1, headPop + dt / 0.5)
      head.setAttribute('transform', `translate(${X1} ${r1(hy)}) scale(${(1 + 0.8 * Math.sin(Math.PI * headPop) * (1 - headPop)).toFixed(3)})`)
      const u = (time % 1.4) / 1.4
      pulse.setAttribute('cy', String(r1(hy)))
      pulse.setAttribute('r', String(r1(4 + 10 * u)))
      pulse.setAttribute('opacity', ((1 - u) * 0.6).toFixed(3))

      // Quarter ticks scroll with the data.
      const { months: monthNames, launches: launchNames } = copyRef.current
      const k0 = Math.ceil(start / QUARTER)
      ticks.forEach((tick, i) => {
        const k = k0 + i
        const x = px(k * QUARTER)
        if (x > X1) {
          tick.setAttribute('opacity', '0')
          return
        }
        const label = tick.lastElementChild!
        const name = monthNames[(((k % 4) + 4) % 4) * 3] ?? ''
        if (label.textContent !== name) label.textContent = name
        tick.setAttribute('transform', `translate(${r1(x)} 0)`)
        tick.setAttribute('opacity', (clamp((x - X0 + 2) / 16) * clamp((X1 - 10 - x) / 16)).toFixed(3))
      })

      // Launch markers. A marker is freed once its chip has scrolled off the left.
      for (const s of ships) {
        if (s.marker >= 0 && px(s.at) < X0 - 130) s.marker = -1
        else if (s.marker < 0 && px(s.at) >= X0 - 130) {
          const used = new Set(ships.map((o) => o.marker))
          s.marker = markers.findIndex((_, i) => !used.has(i))
        }
        s.pop = Math.min(1, s.pop + dt / 0.5)
      }
      markers.forEach((m, i) => {
        const s = ships.find((o) => o.marker === i)
        if (!s) {
          m.g.setAttribute('opacity', '0')
          m.dot!.setAttribute('opacity', '0')
          return
        }
        const sx = px(s.at)
        const sy = py(value(s.at))
        const o = clamp((sx - X0) / 24)
        m.g.setAttribute('opacity', '1')
        m.dot!.setAttribute('opacity', o.toFixed(3))
        m.dot!.setAttribute('cx', String(r1(sx)))
        m.dot!.setAttribute('cy', String(r1(sy)))
        m.line!.setAttribute('x1', String(r1(sx)))
        m.line!.setAttribute('x2', String(r1(sx)))
        m.line!.setAttribute('y1', String(r1(sy + 4)))
        m.line!.setAttribute('opacity', o.toFixed(3))
        if (!s.chip) {
          m.chip!.setAttribute('opacity', '0')
          return
        }
        const name = launchNames[s.label % launchNames.length] ?? ''
        const width = name.length * 5 + 14
        if (m.label !== name) {
          m.label = name
          m.text!.textContent = name
          m.rect!.setAttribute('x', String(-width))
          m.rect!.setAttribute('width', String(width))
          m.text!.setAttribute('x', String(-width / 2))
        }
        m.chip!.setAttribute('opacity', clamp((sx + 6 - width - X0 + 24) / 24).toFixed(3))
        m.chip!.setAttribute(
          'transform',
          `translate(${r1(sx + 6)} ${r1(sy - 18)}) scale(${Math.max(0.01, easeOutBack(s.pop)).toFixed(3)})`,
        )
      })

      // Hover: crosshair and tooltip, the way a real chart reads.
      tipOn += ((pointer.inside ? 1 : 0) - tipOn) * ease(dt, 12)
      tip.setAttribute('opacity', tipOn.toFixed(3))
      if (tipOn > 0.01) {
        const qx = clamp(pointer.x, X0, X1)
        const w = now - ((X1 - qx) / (X1 - X0)) * SPAN
        const ty = r1(py(value(w)))
        tipLine.setAttribute('x1', String(r1(qx)))
        tipLine.setAttribute('x2', String(r1(qx)))
        tipDot.setAttribute('cx', String(r1(qx)))
        tipDot.setAttribute('cy', String(ty))
        tipBox.setAttribute(
          'transform',
          `translate(${r1(qx > X1 - 90 ? qx - 84 : qx + 8)} ${r1(Math.max(TOP - 22, ty - 26))})`,
        )
        const month = monthNames[Math.floor(((((w % SPAN) + SPAN) % SPAN) / SPAN) * 12)] ?? ''
        tipText.textContent = `${month} · ${percent(yoy(w))}`
      }

      shown += (yoy(now) * 100 - shown) * ease(dt, 6)
      const text = percent(shown / 100)
      if (text !== shownText) {
        valueEl.textContent = text
        shownText = text
      }
      drawSparks(dt)
    }

    const locate = (e: PointerEvent) => {
      const m = svg.getScreenCTM()
      if (!m) return
      pointer.x = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()).x
      pointer.inside = true
    }
    const onLeave = () => {
      pointer.inside = false
    }
    const onDown = (e: PointerEvent) => {
      locate(e)
      launch(now)
      if (autoplay) nextAuto = now + between(GAP)
      else now += 8
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
    const tick = (stamp: number) => {
      frame(Math.min(0.05, Math.max(0, stamp - last) / 1000))
      last = stamp
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
    <div ref={hostRef} className="absolute inset-0 cursor-crosshair select-none touch-pan-y">
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
          <linearGradient id={`${id}-stroke`} gradientUnits="userSpaceOnUse" x1={X0} x2={X1} y1={0} y2={0}>
            <stop data-k="stop" offset={0} stopColor={MUTED} />
            <stop data-k="stop" offset={1} stopColor={MUTED} />
            <stop data-k="stop" offset={1} stopColor={EMBER} />
            <stop data-k="stop" offset={1} stopColor={FLAME} />
          </linearGradient>
          <linearGradient id={`${id}-area`} x1={0} y1={0} x2={0} y2={1}>
            <stop offset={0} stopColor={EMBER} stopOpacity={0.28} />
            <stop offset={1} stopColor={EMBER} stopOpacity={0} />
          </linearGradient>
        </defs>

        <text x={X0} y={30} fontSize={8.5} letterSpacing={1.4} fill={MUTED} className="font-mono">
          {t('home.whyFlintworks.items.03.chart.metric')}
        </text>
        <text data-k="value" x={X0} y={54} fontSize={22} fontWeight={700} fill={HEADING} className="font-display">
          +0%
        </text>

        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={X0}
            x2={X1}
            y1={TOP + (i * (BOT - TOP)) / 4}
            y2={TOP + (i * (BOT - TOP)) / 4}
            stroke={LINE}
            strokeOpacity={0.7}
            strokeDasharray="2 4"
          />
        ))}
        <line x1={X0} x2={X1} y1={BOT + 0.5} y2={BOT + 0.5} stroke={LINE} />
        {Array.from({ length: TICKS }, (_, i) => (
          <g key={i} data-k="tick" opacity={0}>
            <line y1={BOT + 1} y2={BOT + 4} stroke="#383843" />
            <text y={184} fontSize={7.5} letterSpacing={1} fill={MUTED} className="font-mono" />
          </g>
        ))}

        <path data-k="area" fill={`url(#${id}-area)`} />
        {Array.from({ length: MARKERS }, (_, i) => (
          <g key={i} data-k="marker" opacity={0}>
            <line data-part="line" y2={BOT} stroke="#383843" strokeDasharray="2 3" />
            <g data-part="chip" opacity={0}>
              <rect data-part="rect" y={-7} height={14} rx={7} fill="#16161B" stroke={EMBER} strokeOpacity={0.45} />
              <text data-part="text" y={2.7} textAnchor="middle" fontSize={7.5} letterSpacing={0.5} fill={FLAME} className="font-mono" />
            </g>
          </g>
        ))}
        <path
          data-k="line"
          fill="none"
          stroke={`url(#${id}-stroke)`}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${id}-glow)`}
        />
        {Array.from({ length: MARKERS }, (_, i) => (
          <circle key={i} data-k="marker-dot" r={3} fill="#0A0A0B" stroke={FLAME} strokeWidth={1.5} opacity={0} />
        ))}
        <circle data-k="pulse" cx={X1} r={4} fill="none" stroke={EMBER} strokeWidth={1.5} opacity={0} />
        <g data-k="head" transform={`translate(${X1} ${BOT})`}>
          <circle r={8} fill={EMBER} opacity={0.25} filter={`url(#${id}-glow)`} />
          <circle r={3.5} fill="#FFE8D6" filter={`url(#${id}-glow)`} />
        </g>

        <g data-k="tip" opacity={0}>
          <line data-k="tip-line" y1={TOP - 8} y2={BOT} stroke="#4A4A56" strokeDasharray="2 3" />
          <circle data-k="tip-dot" r={3.5} fill={FLAME} stroke="#0A0A0B" strokeWidth={1.5} />
          <g data-k="tip-box">
            <rect width={76} height={18} rx={5} fill="#16161B" stroke="#2A2A33" />
            <text data-k="tip-text" x={38} y={11.8} textAnchor="middle" fontSize={8} fill={HEADING} className="font-mono" />
          </g>
        </g>

        <g fill="none" strokeLinecap="round" filter={`url(#${id}-glow)`}>
          <path data-k="spark-cool" stroke={EMBER} strokeWidth={1.2} />
          <path data-k="spark-hot" stroke="#FFE1C7" strokeWidth={1.6} />
        </g>
      </svg>
    </div>
  )
}
