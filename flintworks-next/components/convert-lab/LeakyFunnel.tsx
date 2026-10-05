'use client'

import { useRef } from 'react'
import {
  approach,
  attr,
  clamp,
  easeOutCubic,
  Glow,
  INK,
  mix,
  r1,
  SceneFrame,
  SparkLayer,
  Sparks,
  Spring,
  useScene,
  useSvgId,
  type Scene,
  type SceneApi,
} from '@/components/delivery-lab/scene'

// Option 2: a conversion funnel drawn as a river of visitors. At each of four leaks (slow load,
// vague pitch, long form, clunky payment) part of the flow drops out. Visitors warm from grey to
// white-hot as they get closer to buying. Hovering over a leak welds it shut, which lets more of
// the river through and raises customers per day. Left alone it welds the leaks one by one, holds,
// reopens them and starts again (skipped under reduced motion, which shows the sealed funnel).

const C = 122
const T0 = 72
const X_IN = -16
const X_END = 492
const GATES = [118, 206, 294, 382]
const LEAKY = [0.62, 0.6, 0.56, 0.62]
const SEALED = [0.88, 0.86, 0.82, 0.88]
const PROBLEMS = ['SLOW LOAD', 'VAGUE PITCH', 'LONG FORM', 'CLUNKY PAY']
const FIXES = ['0.8S LOAD', 'CLEAR PITCH', 'SHORT FORM', '1-TAP PAY']
const HEAT = ['#55555F', '#8A3812', '#C4440C', '#FF5A12', '#FFB47E']
const RAMP = 18
const SPAWN_PER_S = 62
const SPEED = 64
const WELD_S = 1
const REACH = 44
const PER_DAY = 1200
const LEAKY_RATE = LEAKY.reduce((a, s) => a * s, 1)
const SEALED_RATE = SEALED.reduce((a, s) => a * s, 1)

type Particle = { x: number; off: number; v: number; k: number; leak: boolean; y: number; vy: number; age: number }

function setup(api: SceneApi): Scene {
  const { el, all, pointer, autoplay, idle } = api
  const band = el('band')
  const edges = el('edges')
  const flow = all('flow')
  const leakFresh = el('leak-fresh')
  const leakOld = el('leak-old')
  const mouths = all('mouth')
  const problems = all('problem')
  const fixes = all('fix')
  const torch = el('torch')
  const valueEl = el('value')
  const liftEl = el('lift')
  const pillBg = el('pill-bg')
  const sparks = new Sparks(api, 260)

  const seal = GATES.map((): number => (autoplay ? 0 : 1))
  const flash = GATES.map(() => 0)
  const ps: Particle[] = []
  const tx = new Spring(GATES[0], 110)
  const ty = new Spring(C, 110)
  let spawn = 0
  let sparkAcc = 0
  let welding = -1
  let reopening = false
  let phase: 'weld' | 'hold' = 'weld'
  let timer = -1.2
  let torchOn = 0
  let time = 0
  let shown = PER_DAY * (autoplay ? LEAKY_RATE : SEALED_RATE)
  let shownText = ''

  const survive = (g: number) => LEAKY[g] + (SEALED[g] - LEAKY[g]) * easeOutCubic(clamp(seal[g]))
  const before = (g: number) => {
    let t = T0
    for (let j = 0; j < g; j++) t *= survive(j)
    return t
  }
  // Band thickness at x: full where visitors enter, narrowing just after each leak.
  const thick = (x: number) => {
    let t = T0
    for (let g = 0; g < GATES.length; g++) {
      const u = clamp((x - GATES[g]) / RAMP)
      t *= 1 + (survive(g) - 1) * u * u * (3 - 2 * u)
    }
    return t
  }
  const mouth = (g: number) => {
    const b = before(g)
    return { top: C - b / 2 + b * survive(g), bottom: C + b / 2 }
  }
  const nearestGate = () => {
    let best = -1
    let bd = REACH
    GATES.forEach((gx, g) => {
      const d = Math.abs(pointer.x - gx)
      if (d < bd) {
        bd = d
        best = g
      }
    })
    return best
  }
  const sealed = (g: number) => {
    const m = mouth(g)
    seal[g] = 1
    flash[g] = 1
    sparks.burst(GATES[g], (m.top + m.bottom) / 2, 22, { speed: 180, life: 0.6 })
  }

  const step = (dt: number) => {
    spawn += dt * SPAWN_PER_S
    while (spawn >= 1) {
      spawn--
      if (ps.length > 640) continue
      ps.push({
        x: X_IN - Math.random() * 8,
        off: Math.random() * T0,
        v: SPEED * (0.85 + Math.random() * 0.3),
        k: 0,
        leak: false,
        y: 0,
        vy: 0,
        age: 0,
      })
    }
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i]
      if (p.leak) {
        p.age += dt
        p.x += p.v * 0.75 * Math.exp(-p.age * 1.4) * dt
        p.vy += 260 * dt
        p.y += p.vy * dt
        if (p.y > 215 || p.age > 1.8) ps.splice(i, 1)
        continue
      }
      p.x += p.v * dt
      if (p.k < GATES.length && p.x >= GATES[p.k]) {
        const b = before(p.k)
        if (p.off < b * survive(p.k)) p.k++
        else {
          p.leak = true
          p.y = C - b / 2 + Math.min(p.off, b)
          p.vy = 10 + Math.random() * 24
          p.age = 0
        }
      }
      if (p.x > X_END) ps.splice(i, 1)
    }
  }

  // Start with the river already flowing.
  for (let i = 0; i < 480; i++) step(1 / 60)

  return {
    press() {
      if (seal.every((s) => s >= 1)) {
        reopening = true
        return
      }
      const g = nearestGate()
      if (g >= 0 && seal[g] < 1) sealed(g)
    },
    frame(dt) {
      time += dt

      if (reopening) {
        let open = true
        for (let g = 0; g < GATES.length; g++) {
          seal[g] = Math.max(0, seal[g] - dt / 1.1)
          if (seal[g] > 0) open = false
        }
        if (open) reopening = false
      }
      if (pointer.inside) {
        const g = nearestGate()
        welding = g >= 0 && seal[g] < 1 && !reopening ? g : -1
        phase = 'hold'
        timer = 0
      } else if (autoplay && idle()) {
        timer += dt
        if (phase === 'hold') {
          welding = -1
          if (!reopening && seal.some((s) => s < 1)) {
            phase = 'weld'
            timer = 0
          } else if (timer > 3.4) {
            reopening = true
            phase = 'weld'
            timer = -1.4
          }
        } else if (!reopening && welding < 0 && timer > 0.5) {
          welding = seal.findIndex((s) => s < 1)
          if (welding < 0) {
            phase = 'hold'
            timer = 0
          }
        }
      } else welding = -1

      if (welding >= 0) {
        const g = welding
        seal[g] = Math.min(1, seal[g] + dt / WELD_S)
        const m = mouth(g)
        sparkAcc += dt * 45
        while (sparkAcc >= 1) {
          sparkAcc--
          sparks.burst(GATES[g], m.top + Math.random() * (m.bottom - m.top), 1, { speed: 150, spread: 2.6, life: 0.4 })
        }
        if (seal[g] >= 1) {
          sealed(g)
          welding = -1
          timer = 0
        }
      }

      if (autoplay || pointer.inside) step(dt)

      // Draw the river.
      const heat = HEAT.map(() => '')
      let fresh = ''
      let old = ''
      for (const p of ps) {
        if (p.leak) {
          const seg = `M${r1(p.x)} ${r1(p.y)}h0`
          if (p.age < 0.45) fresh += seg
          else old += seg
        } else {
          const t = thick(p.x)
          heat[p.k] += `M${r1(p.x)} ${r1(C - t / 2 + Math.min(p.off, t - 0.5))}h0`
        }
      }
      flow.forEach((path, k) => path.setAttribute('d', heat[k]))
      leakFresh.setAttribute('d', fresh)
      leakOld.setAttribute('d', old)

      let top = ''
      let bottom = ''
      for (let x = -24; x <= 504; x += 6) {
        const t = thick(x)
        top += `${top ? 'L' : 'M'}${x} ${r1(C - t / 2)}`
        bottom = `L${x} ${r1(C + t / 2)}` + bottom
      }
      band.setAttribute('d', `${top}${bottom}Z`)
      edges.setAttribute('d', `${top}M${bottom.slice(1)}`)

      // Leak mouths, labels, and the torch.
      const flicker = 0.5 + 0.5 * Math.sin(time * 40)
      GATES.forEach((gx, g) => {
        const m = mouth(g)
        flash[g] = Math.max(0, flash[g] - dt / 0.8)
        attr(mouths[g], {
          y1: r1(m.top),
          y2: r1(m.bottom),
          stroke: welding === g ? mix(INK.flame, '#FFE1C7', flicker) : mix('#5A2410', INK.hot, flash[g]),
        })
        const fixed = clamp((seal[g] - 0.85) / 0.15)
        problems[g].setAttribute('opacity', (1 - fixed).toFixed(3))
        fixes[g].setAttribute('opacity', fixed.toFixed(3))
      })
      const target = welding >= 0 ? welding : -1
      if (target >= 0) {
        const m = mouth(target)
        tx.step(GATES[target], dt)
        ty.step((m.top + m.bottom) / 2, dt)
      }
      torchOn += ((target >= 0 ? 1 : 0) - torchOn) * approach(dt, 10)
      attr(torch, {
        transform: `translate(${r1(tx.x)} ${r1(ty.x)}) scale(${(0.85 + 0.3 * flicker).toFixed(3)})`,
        opacity: torchOn,
      })

      const rate = GATES.reduce((a, _, g) => a * survive(g), 1)
      shown += (PER_DAY * rate - shown) * approach(dt, 6)
      const text = Math.round(shown).toLocaleString('en-US')
      if (text !== shownText) {
        valueEl.textContent = text
        shownText = text
        liftEl.textContent = `LIFT +${Math.round((shown / (PER_DAY * LEAKY_RATE) - 1) * 100)}%`
      }
      const lit = clamp((rate - LEAKY_RATE) / (SEALED_RATE - LEAKY_RATE))
      pillBg.setAttribute('fill-opacity', (0.1 + 0.9 * lit).toFixed(3))
      liftEl.setAttribute('fill', mix(INK.flame, INK.white, lit))
      sparks.frame(dt)
    },
  }
}

export function LeakyFunnel() {
  const hostRef = useRef<HTMLDivElement>(null)
  const id = useSvgId()
  useScene(hostRef, setup)

  return (
    <SceneFrame hostRef={hostRef} cursor="cursor-crosshair">
      <defs>
        <Glow id={`${id}-glow`} />
        <radialGradient id={`${id}-torch`}>
          <stop offset={0} stopColor="#FFE1C7" stopOpacity={0.9} />
          <stop offset={0.35} stopColor={INK.flame} stopOpacity={0.45} />
          <stop offset={1} stopColor={INK.ember} stopOpacity={0} />
        </radialGradient>
      </defs>

      <text x={24} y={30} fontSize={8.5} letterSpacing={1.4} fill={INK.muted} className="font-mono">
        CUSTOMERS / DAY
      </text>
      <text data-k="value" x={24} y={54} fontSize={21} fontWeight={700} fill={INK.heading} className="font-display">
        {Math.round(PER_DAY * LEAKY_RATE)}
      </text>
      <g transform="translate(456 30)">
        <rect data-k="pill-bg" x={-78} y={-10} width={78} height={20} rx={10} fill={INK.ember} fillOpacity={0.1} stroke={INK.ember} strokeOpacity={0.5} />
        <text data-k="lift" x={-39} y={3.3} textAnchor="middle" fontSize={9} fontWeight={700} letterSpacing={1} fill={INK.flame} className="font-mono">
          LIFT +0%
        </text>
      </g>

      <path data-k="band" fill={INK.ember} fillOpacity={0.05} />
      <path data-k="edges" fill="none" stroke="#2A2A33" strokeWidth={1} />
      {GATES.map((gx) => (
        <line key={gx} x1={gx} x2={gx} y1={C - T0 / 2 - 4} y2={C + T0 / 2 + 4} stroke="#2A2A33" strokeDasharray="2 3" />
      ))}
      {GATES.map((gx, g) => (
        <g key={gx}>
          <text data-k="problem" x={gx} y={C - T0 / 2 - 10} textAnchor="middle" fontSize={7.5} letterSpacing={1} fill="#8E8E9C" className="font-mono">
            {PROBLEMS[g]}
          </text>
          <text data-k="fix" x={gx} y={C - T0 / 2 - 10} textAnchor="middle" fontSize={7.5} letterSpacing={1} fontWeight={700} fill={INK.flame} opacity={0} className="font-mono">
            {FIXES[g]}
          </text>
        </g>
      ))}

      <g fill="none" strokeLinecap="round" strokeWidth={2.2}>
        <path data-k="leak-old" stroke="#33333D" />
        <path data-k="leak-fresh" stroke="#5A5A66" />
        {HEAT.slice(0, 3).map((c) => (
          <path key={c} data-k="flow" stroke={c} />
        ))}
        <g filter={`url(#${id}-glow)`}>
          {HEAT.slice(3).map((c) => (
            <path key={c} data-k="flow" stroke={c} />
          ))}
        </g>
      </g>

      {GATES.map((gx) => (
        <line key={gx} data-k="mouth" x1={gx} x2={gx} stroke="#5A2410" strokeWidth={2} strokeLinecap="round" />
      ))}
      <g data-k="torch" opacity={0}>
        <circle r={12} fill={`url(#${id}-torch)`} />
        <circle r={2.6} fill="#FFF4EA" filter={`url(#${id}-glow)`} />
      </g>
      <SparkLayer glow={`${id}-glow`} />
    </SceneFrame>
  )
}
