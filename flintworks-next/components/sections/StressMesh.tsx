'use client'

import { useEffect, useId, useRef } from 'react'

// "01 Built to perform" visual on the home page. A lattice pinned at its edges takes the
// pointer as a load: struts are coloured by strain, and the panel springs back when the
// load moves off. Pressing adds weight and sends a shockwave. Left alone, a slow load
// wanders across it (skipped under reduced motion). Frames are drawn imperatively into a
// handful of <path>s, so React never re-renders per frame.

// Strain buckets, cool to white-hot. A strut lands in the first bucket whose step it's under.
const STRAIN_COLORS = ['#26262E', '#4B2415', '#A33A0F', '#FF4D00', '#FFB47E']
const STRAIN_WIDTHS = [1, 1.15, 1.35, 1.6, 1.9]
const STRAIN_STEPS = [0.025, 0.07, 0.14, 0.26]
const HOT_FROM = 3

const SPRING = 130
const DAMPING = 7.5
const LOAD_FORCE = 4800
const WAVE_FORCE = 5200
const WAVE_SPEED = 360
const WAVE_BAND = 14
const IDLE_AFTER_MS = 1400
const IDLE_LOAD = 0.85

type Wave = { x: number; y: number; r: number; strength: number; max: number }

const r1 = (n: number) => Math.round(n * 10) / 10
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)

export function StressMesh() {
  const id = `mesh${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const hostRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<SVGFilterElement>(null)
  const heatRef = useRef<SVGCircleElement>(null)
  const strutRefs = useRef<(SVGPathElement | null)[]>([])
  const jointCoolRef = useRef<SVGPathElement>(null)
  const jointHotRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const svg = host?.querySelector('svg')
    const filter = filterRef.current
    const heat = heatRef.current
    const jointCool = jointCoolRef.current
    const jointHot = jointHotRef.current
    const struts = strutRefs.current
    if (!host || !svg || !filter || !heat || !jointCool || !jointHot) return
    if (struts.length !== STRAIN_COLORS.length || struts.some((p) => !p)) return

    const autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: 0, y: 0, inside: false, down: false, lastMove: -Infinity }

    let w = 0
    let h = 0
    let n = 0
    let restX = new Float32Array(0)
    let restY = new Float32Array(0)
    let x = new Float32Array(0)
    let y = new Float32Array(0)
    let vx = new Float32Array(0)
    let vy = new Float32Array(0)
    let pinned = new Uint8Array(0)
    let edges = new Uint32Array(0)
    let restLen = new Float32Array(0)
    let loadX = 0
    let loadY = 0
    let load = 0
    let idleT = Math.random() * 10
    let settled = false
    const waves: Wave[] = []

    // Grid of nodes, outer ring pinned; struts run across, down, and along one alternating diagonal per cell.
    const build = () => {
      const gap = w < 480 ? 20 : 22
      const pad = 12
      const cols = Math.floor((w - pad * 2) / gap) + 1
      const rows = Math.floor((h - pad * 2) / gap) + 1
      const ox = (w - (cols - 1) * gap) / 2
      const oy = (h - (rows - 1) * gap) / 2
      n = cols * rows
      restX = new Float32Array(n)
      restY = new Float32Array(n)
      x = new Float32Array(n)
      y = new Float32Array(n)
      vx = new Float32Array(n)
      vy = new Float32Array(n)
      pinned = new Uint8Array(n)
      const list: number[] = []
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i
          restX[k] = x[k] = ox + i * gap
          restY[k] = y[k] = oy + j * gap
          pinned[k] = i === 0 || j === 0 || i === cols - 1 || j === rows - 1 ? 1 : 0
          if (i < cols - 1) list.push(k, k + 1)
          if (j < rows - 1) list.push(k, k + cols)
          if (i < cols - 1 && j < rows - 1) {
            if ((i + j) % 2 === 0) list.push(k, k + cols + 1)
            else list.push(k + 1, k + cols)
          }
        }
      }
      edges = new Uint32Array(list)
      restLen = new Float32Array(list.length / 2)
      for (let e = 0; e < restLen.length; e++) {
        const a = edges[2 * e]
        const b = edges[2 * e + 1]
        restLen[e] = Math.hypot(restX[b] - restX[a], restY[b] - restY[a])
      }
      loadX = w / 2
      loadY = h / 2
      waves.length = 0
      settled = false
    }

    const step = (dt: number) => {
      let tx = loadX
      let ty = loadY
      let target = 0
      if (pointer.inside) {
        tx = pointer.x
        ty = pointer.y
        target = pointer.down ? 1.6 : 1
      } else if (autoplay && performance.now() - pointer.lastMove > IDLE_AFTER_MS) {
        idleT += dt
        tx = w * (0.5 + 0.36 * Math.sin(idleT * 0.47))
        ty = h * (0.5 + 0.3 * Math.sin(idleT * 0.83 + 1.3))
        target = IDLE_LOAD
      }
      const follow = ease(dt, pointer.inside ? 18 : 3)
      loadX += (tx - loadX) * follow
      loadY += (ty - loadY) * follow
      load += (target - load) * ease(dt, 5)

      const radius = 58 + 18 * load
      const radius2 = radius * radius
      const force = LOAD_FORCE * load
      let maxV = 0
      for (let k = 0; k < n; k++) {
        if (pinned[k]) continue
        let ax = -SPRING * (x[k] - restX[k]) - DAMPING * vx[k]
        let ay = -SPRING * (y[k] - restY[k]) - DAMPING * vy[k]
        const dx = x[k] - loadX
        const dy = y[k] - loadY
        const d2 = dx * dx + dy * dy
        if (force > 1 && d2 < radius2 && d2 > 0.01) {
          const d = Math.sqrt(d2)
          const f = (force * (1 - d / radius) ** 2) / d
          ax += dx * f
          ay += dy * f
        }
        for (const wave of waves) {
          const wx = restX[k] - wave.x
          const wy = restY[k] - wave.y
          const d = Math.hypot(wx, wy)
          const band = 1 - Math.abs(d - wave.r) / WAVE_BAND
          if (band > 0 && d > 0.1) {
            const f = (WAVE_FORCE * band * wave.strength) / d
            ax += wx * f
            ay += wy * f
          }
        }
        vx[k] += ax * dt
        vy[k] += ay * dt
        x[k] += vx[k] * dt
        y[k] += vy[k] * dt
        maxV = Math.max(maxV, Math.abs(vx[k]) + Math.abs(vy[k]))
      }
      for (let i = waves.length - 1; i >= 0; i--) {
        const wave = waves[i]
        wave.r += WAVE_SPEED * dt
        wave.strength = 1 - wave.r / wave.max
        if (wave.strength <= 0) waves.splice(i, 1)
      }
      return load < 0.003 && waves.length === 0 && maxV < 0.05
    }

    const draw = () => {
      heat.setAttribute('cx', String(r1(loadX)))
      heat.setAttribute('cy', String(r1(loadY)))
      heat.setAttribute('r', String(r1((58 + 18 * load) * 1.9)))
      heat.setAttribute('opacity', Math.min(1, load * 0.9).toFixed(3))

      const buckets = STRAIN_COLORS.map(() => '')
      for (let e = 0; e < restLen.length; e++) {
        const a = edges[2 * e]
        const b = edges[2 * e + 1]
        const strain = Math.abs(Math.hypot(x[b] - x[a], y[b] - y[a]) / restLen[e] - 1)
        let q = 0
        while (q < STRAIN_STEPS.length && strain >= STRAIN_STEPS[q]) q++
        buckets[q] += `M${r1(x[a])} ${r1(y[a])}L${r1(x[b])} ${r1(y[b])}`
      }
      buckets.forEach((d, q) => struts[q]!.setAttribute('d', d))

      // Joints are zero-length segments with round caps, split by how far they've been pushed.
      let cool = ''
      let hot = ''
      for (let k = 0; k < n; k++) {
        const seg = `M${r1(x[k])} ${r1(y[k])}h0`
        if (Math.abs(x[k] - restX[k]) + Math.abs(y[k] - restY[k]) > 6) hot += seg
        else cool += seg
      }
      jointCool.setAttribute('d', cool)
      jointHot.setAttribute('d', hot)
    }

    const frame = (dt: number) => {
      const still = step(dt)
      if (still && settled) return
      settled = still
      draw()
    }

    const fit = () => {
      const rect = host.getBoundingClientRect()
      const nw = Math.round(rect.width)
      const nh = Math.round(rect.height)
      if (!nw || !nh || (nw === w && nh === h)) return
      w = nw
      h = nh
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      filter.setAttribute('width', String(w + 40))
      filter.setAttribute('height', String(h + 40))
      build()
      draw()
    }

    const locate = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.inside = true
      pointer.lastMove = performance.now()
    }
    const onLeave = () => {
      pointer.inside = false
      pointer.down = false
      pointer.lastMove = performance.now()
    }
    const onDown = (e: PointerEvent) => {
      locate(e)
      pointer.down = true
      waves.push({ x: pointer.x, y: pointer.y, r: 0, strength: 1, max: Math.hypot(w, h) * 0.75 })
      settled = false
    }
    const onUp = () => {
      pointer.down = false
    }
    host.addEventListener('pointerenter', locate)
    host.addEventListener('pointermove', locate)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointercancel', onLeave)
    host.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)

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
    const ro = new ResizeObserver(fit)
    ro.observe(host)
    fit()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', sync)
      host.removeEventListener('pointerenter', locate)
      host.removeEventListener('pointermove', locate)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointercancel', onLeave)
      host.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  const strut = (q: number) => (
    <path
      key={q}
      ref={(el) => {
        strutRefs.current[q] = el
      }}
      stroke={STRAIN_COLORS[q]}
      strokeWidth={STRAIN_WIDTHS[q]}
    />
  )

  return (
    <div ref={hostRef} className="absolute inset-0 cursor-crosshair select-none touch-pan-y">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id={`${id}-heat`}>
            <stop offset="0" stopColor="#FF4D00" stopOpacity={0.3} />
            <stop offset="0.55" stopColor="#FF4D00" stopOpacity={0.08} />
            <stop offset="1" stopColor="#FF4D00" stopOpacity={0} />
          </radialGradient>
          <filter
            ref={filterRef}
            id={`${id}-glow`}
            filterUnits="userSpaceOnUse"
            x={-20}
            y={-20}
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={2} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle ref={heatRef} fill={`url(#${id}-heat)`} opacity={0} />
        <g fill="none" strokeLinecap="round">
          {STRAIN_COLORS.slice(0, HOT_FROM).map((_, q) => strut(q))}
          <path ref={jointCoolRef} stroke="#383843" strokeWidth={2.6} />
          <g filter={`url(#${id}-glow)`}>
            {STRAIN_COLORS.slice(HOT_FROM).map((_, i) => strut(HOT_FROM + i))}
            <path ref={jointHotRef} stroke="#FF8C42" strokeWidth={3} />
          </g>
        </g>
      </svg>
    </div>
  )
}
