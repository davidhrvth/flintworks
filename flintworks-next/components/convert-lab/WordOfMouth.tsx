'use client'

import { useRef } from 'react'
import {
  approach,
  attr,
  easeOutBack,
  Glow,
  INK,
  mix,
  r1,
  SceneFrame,
  SparkLayer,
  Sparks,
  useScene,
  useSvgId,
  type Scene,
  type SceneApi,
} from '@/components/delivery-lab/scene'

// Option 5: a crowd of people linked to the ones they know. The cursor is a spark: touch someone
// and they become a customer, then tell their friends. A glowing pulse runs down each link and
// usually wins that friend over too, so one good product spreads through the crowd on its own.
// Clicking is a bigger spark. Left alone, a spark lands somewhere, the word spreads, it holds,
// fades and starts over (skipped under reduced motion, which shows a crowd that has caught on).

const P_SPREAD = 0.72
const PULSE_SPEED = 120
const TOUCH_R = 22
const STRIKE_R = 58
const HEAD = { cy: -2.2, r: 2.5 }
const BODY = 'M-4.6 6.4A4.6 4.6 0 0 1 4.6 6.4Z'

// Seeded so the server and the browser lay out the same crowd.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const { NODES, LINKS, ADJ } = (() => {
  const rand = rng(11)
  const nodes: { x: number; y: number }[] = []
  for (let r = 0; r < 4; r++) {
    const odd = r % 2
    for (let c = 0; c < 11 - odd; c++) {
      if (rand() < 0.14) continue
      nodes.push({
        x: Math.round(40 + c * 40 + odd * 20 + (rand() - 0.5) * 22),
        y: Math.round(78 + r * 32 + (rand() - 0.5) * 14),
      })
    }
  }
  const links: { a: number; b: number; len: number }[] = []
  const seen = new Set<string>()
  nodes.forEach((n, i) => {
    const near = nodes
      .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d)
    near.slice(0, 3).forEach((o, rank) => {
      if (rank === 2 && o.d > 50) return
      const key = i < o.j ? `${i}-${o.j}` : `${o.j}-${i}`
      if (seen.has(key)) return
      seen.add(key)
      links.push({ a: i, b: o.j, len: o.d })
    })
  })
  const adj = nodes.map(() => [] as number[])
  links.forEach((l, k) => {
    adj[l.a].push(k)
    adj[l.b].push(k)
  })
  return { NODES: nodes, LINKS: links, ADJ: adj }
})()

type Pending = { link: number; from: number; to: number; wait: number }
type Pulse = { link: number; from: number; to: number; t: number; dur: number }

function setup(api: SceneApi): Scene {
  const { el, all, pointer, autoplay, idle } = api
  const litEls = all('lit')
  const halos = all('halo')
  const litLinks = el('lit-links')
  const trails = el('trails')
  const heads = el('heads')
  const ring = el('ring')
  const countEl = el('count')
  const shareEl = el('share')
  const sparks = new Sparks(api, 220)

  const n = NODES.length
  const lit = new Uint8Array(n)
  const targeted = new Uint8Array(n)
  const level = new Float32Array(n)
  const heat = new Float32Array(n)
  const pop = new Float32Array(n).fill(1)
  const linkLit = new Uint8Array(LINKS.length)
  let pending: Pending[] = []
  let pulses: Pulse[] = []
  let count = 0
  let referred = 0
  let phase: 'wait' | 'run' | 'hold' | 'fade' = 'wait'
  let timer = 0
  let calm = 0
  let fade = 1
  let ringT = 1
  let ringX = 0
  let ringY = 0
  let lastX = NaN
  let lastY = NaN
  let trail = 0
  let linksDirty = true

  const header = () => {
    countEl.textContent = String(count)
    shareEl.textContent = `${count ? Math.round((referred / count) * 100) : 0}%`
  }
  const ignite = (i: number, referral: boolean) => {
    if (lit[i]) return
    lit[i] = 1
    heat[i] = 1
    pop[i] = 0
    count++
    if (referral) referred++
    header()
    for (const k of ADJ[i]) {
      const l = LINKS[k]
      const j = l.a === i ? l.b : l.a
      if (lit[j] || targeted[j]) continue
      targeted[j] = 1
      pending.push({ link: k, from: i, to: j, wait: 0.25 + Math.random() * 0.7 })
    }
  }
  const strike = (x: number, y: number, radius: number) => {
    ringT = 0
    ringX = x
    ringY = y
    sparks.burst(x, y, 22, { speed: 170, life: 0.6 })
    NODES.forEach((m, i) => {
      if (Math.hypot(m.x - x, m.y - y) < radius) ignite(i, false)
    })
  }
  const strikeRandom = () => {
    const dark = NODES.map((_, i) => i).filter((i) => !lit[i])
    if (!dark.length) return
    const left = dark.filter((i) => NODES[i].x < 240)
    const pool = left.length && count === 0 ? left : dark
    const i = pool[Math.floor(Math.random() * pool.length)]
    strike(NODES[i].x, NODES[i].y, 4)
  }
  const reset = () => {
    lit.fill(0)
    targeted.fill(0)
    level.fill(0)
    heat.fill(0)
    linkLit.fill(0)
    pending = []
    pulses = []
    count = 0
    referred = 0
    linksDirty = true
    header()
  }

  // Word of mouth: after a beat, each new customer's pulse travels to a friend and usually lands.
  const spread = (dt: number) => {
    pending = pending.filter((q) => {
      q.wait -= dt
      if (q.wait > 0) return true
      pulses.push({ link: q.link, from: q.from, to: q.to, t: 0, dur: LINKS[q.link].len / PULSE_SPEED })
      return false
    })
    pulses = pulses.filter((q) => {
      q.t += dt / q.dur
      if (q.t < 1) return true
      targeted[q.to] = 0
      if (Math.random() < P_SPREAD) {
        linkLit[q.link] = 1
        linksDirty = true
        ignite(q.to, true)
        sparks.burst(NODES[q.to].x, NODES[q.to].y, 6, { speed: 90, life: 0.4 })
      }
      return false
    })
  }

  if (!autoplay) {
    for (const [x, y] of [[80, 110], [250, 130], [410, 110]]) strike(x, y, 30)
    for (let i = 0; i < 900; i++) spread(1 / 60)
    level.set(lit)
    heat.fill(0)
    ringT = 1
  }

  return {
    press() {
      strike(pointer.x, pointer.y, STRIKE_R)
    },
    frame(dt) {
      if (pointer.inside) {
        if (phase === 'hold' || phase === 'fade' || phase === 'wait') phase = 'run'
        timer = 0
        fade = Math.min(1, fade + dt / 0.3)
        NODES.forEach((m, i) => {
          if (!lit[i] && Math.hypot(m.x - pointer.x, m.y - pointer.y) < TOUCH_R) {
            ignite(i, false)
            sparks.burst(m.x, m.y, 8, { speed: 120, life: 0.45 })
          }
        })
        // The cursor sheds a few sparks as it moves.
        if (!Number.isNaN(lastX)) trail += Math.hypot(pointer.x - lastX, pointer.y - lastY) / 14
        lastX = pointer.x
        lastY = pointer.y
        while (trail >= 1) {
          trail--
          sparks.burst(pointer.x, pointer.y, 1, { speed: 50, life: 0.35 })
        }
      } else {
        lastX = NaN
        if (autoplay && idle()) {
          timer += dt
          if (phase === 'wait' && timer > 0.9) {
            strikeRandom()
            phase = 'run'
            calm = 0
          } else if (phase === 'run') {
            if (pending.length || pulses.length) calm = 0
            else if ((calm += dt) > 0.8) {
              calm = 0
              if (count / n < 0.7) strikeRandom()
              else {
                phase = 'hold'
                timer = 0
              }
            }
          } else if (phase === 'hold' && timer > 3) phase = 'fade'
          else if (phase === 'fade') {
            fade = Math.max(0, fade - dt / 0.8)
            if (fade <= 0) {
              reset()
              fade = 1
              phase = 'wait'
              timer = 0
            }
          }
        }
      }

      if (autoplay || pointer.inside) spread(dt)

      for (let i = 0; i < n; i++) {
        level[i] += (lit[i] - level[i]) * approach(dt, 10)
        heat[i] = Math.max(0, heat[i] - dt / 0.7)
        pop[i] = Math.min(1, pop[i] + dt / 0.5)
        const o = level[i] * fade
        if (o < 0.002 && !lit[i]) {
          litEls[i].setAttribute('opacity', '0')
          halos[i].setAttribute('opacity', '0')
          continue
        }
        const s = 0.6 + 0.4 * easeOutBack(pop[i])
        attr(litEls[i], {
          opacity: o,
          transform: `translate(${NODES[i].x} ${NODES[i].y}) scale(${s.toFixed(3)})`,
          fill: mix(INK.ember, '#FFE8D6', heat[i]),
        })
        halos[i].setAttribute('opacity', (o * (0.35 + 0.5 * heat[i])).toFixed(3))
      }

      if (linksDirty) {
        let d = ''
        LINKS.forEach((l, k) => {
          if (linkLit[k]) d += `M${NODES[l.a].x} ${NODES[l.a].y}L${NODES[l.b].x} ${NODES[l.b].y}`
        })
        litLinks.setAttribute('d', d)
        linksDirty = false
      }
      litLinks.setAttribute('opacity', fade.toFixed(3))
      let tr = ''
      let hd = ''
      for (const q of pulses) {
        const a = NODES[q.from]
        const b = NODES[q.to]
        const x = r1(a.x + (b.x - a.x) * q.t)
        const y = r1(a.y + (b.y - a.y) * q.t)
        tr += `M${a.x} ${a.y}L${x} ${y}`
        hd += `M${x} ${y}h0`
      }
      trails.setAttribute('d', tr)
      heads.setAttribute('d', hd)

      ringT = Math.min(1, ringT + dt / 0.6)
      attr(ring, { cx: r1(ringX), cy: r1(ringY), r: 4 + 30 * (1 - (1 - ringT) ** 3), opacity: (1 - ringT) * 0.7 })
      sparks.frame(dt)
    },
  }
}

export function WordOfMouth() {
  const hostRef = useRef<HTMLDivElement>(null)
  const id = useSvgId()
  useScene(hostRef, setup)

  return (
    <SceneFrame hostRef={hostRef} cursor="cursor-pointer">
      <defs>
        <Glow id={`${id}-glow`} />
        <radialGradient id={`${id}-halo`}>
          <stop offset={0} stopColor={INK.ember} stopOpacity={0.6} />
          <stop offset={1} stopColor={INK.ember} stopOpacity={0} />
        </radialGradient>
      </defs>

      <text x={24} y={30} fontSize={8.5} letterSpacing={1.4} fill={INK.muted} className="font-mono">
        CUSTOMERS
      </text>
      <text data-k="count" x={24} y={54} fontSize={21} fontWeight={700} fill={INK.heading} className="font-display">
        0
      </text>
      <text x={456} y={30} textAnchor="end" fontSize={8.5} letterSpacing={1.4} fill={INK.muted} className="font-mono">
        FROM REFERRALS{' '}
        <tspan data-k="share" fill={INK.flame} fontWeight={700}>
          0%
        </tspan>
      </text>

      <path
        d={LINKS.map((l) => `M${NODES[l.a].x} ${NODES[l.a].y}L${NODES[l.b].x} ${NODES[l.b].y}`).join('')}
        stroke="#1F1F26"
        strokeWidth={1}
      />
      <path data-k="lit-links" fill="none" stroke="#6A2A10" strokeWidth={1.2} />
      <path data-k="trails" fill="none" stroke={INK.ember} strokeWidth={1.4} strokeLinecap="round" />

      {NODES.map((m, i) => (
        <circle key={i} data-k="halo" cx={m.x} cy={m.y + 1} r={13} fill={`url(#${id}-halo)`} opacity={0} />
      ))}
      <g fill="#2E2E38">
        {NODES.map((m, i) => (
          <g key={i} transform={`translate(${m.x} ${m.y})`}>
            <circle cy={HEAD.cy} r={HEAD.r} />
            <path d={BODY} />
          </g>
        ))}
      </g>
      <g filter={`url(#${id}-glow)`}>
        {NODES.map((m, i) => (
          <g key={i} data-k="lit" transform={`translate(${m.x} ${m.y})`} fill={INK.ember} opacity={0}>
            <circle cy={HEAD.cy} r={HEAD.r} />
            <path d={BODY} />
          </g>
        ))}
        <path data-k="heads" fill="none" stroke="#FFE1C7" strokeWidth={3.6} strokeLinecap="round" />
      </g>
      <circle data-k="ring" r={4} fill="none" stroke={INK.flame} strokeWidth={1.5} opacity={0} />
      <SparkLayer glow={`${id}-glow`} />
    </SceneFrame>
  )
}
