'use client'

import { useRef } from 'react'
import {
  approach,
  attr,
  clamp,
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
} from './scene'

// Option 1: a spark runs the project track from Start to a flag. Each milestone lights as it's
// reached, and the last one raises the flag with an "ON TIME" badge. The pointer scrubs the spark
// along the track and clicking throws sparks off it. Left alone it runs the track, holds, and repeats.

const X0 = 48
const X1 = 432
const Y = 104
const FLAG_TOP = 44
const STOPS = [
  { t: 0, label: 'Start' },
  { t: 0.25, label: 'Design' },
  { t: 0.5, label: 'Build' },
  { t: 0.75, label: 'Test' },
  { t: 1, label: 'Live' },
]
const LAST = STOPS.length - 1
const RUN_S = 5
const HOLD_S = 2.6

const xAt = (p: number) => X0 + (X1 - X0) * p

function flagPath(time: number, amp: number) {
  let top = ''
  let bottom = ''
  for (let i = 0; i <= 8; i++) {
    const u = i / 8
    const x = r1(X1 + 1 + u * 30)
    const wave = Math.sin(time * 5 - u * 4) * amp * u
    top += `${i ? 'L' : 'M'}${x} ${r1(FLAG_TOP + wave)}`
    bottom = `L${x} ${r1(FLAG_TOP + 19 + wave * 0.85)}${bottom}`
  }
  return `${top}${bottom}Z`
}

function setup(api: SceneApi): Scene {
  const { el, all, pointer, autoplay, idle } = api
  const litLayer = el('lit-layer')
  const bar = el('bar')
  const head = el('head')
  const halo = el('halo')
  const hotNodes = all('hot-node')
  const rings = all('ring')
  const labels = all('label')
  const flag = el('flag')
  const flagHot = el('flag-hot')
  const badge = el('badge')
  const sparks = new Sparks(api)

  let p = autoplay ? 0 : 1
  let phase: 'rest' | 'run' | 'hold' | 'fade' = 'rest'
  let timer = 0
  let fade = 1
  let time = 0
  let badgeT = autoplay ? 0 : 1
  const reached = STOPS.map((s) => p >= s.t)
  const level = reached.map((r): number => (r ? 1 : 0))
  const ringT = STOPS.map(() => 1)

  const reach = (i: number) => {
    reached[i] = true
    ringT[i] = 0
    const last = i === LAST
    sparks.burst(xAt(STOPS[i].t), Y, last ? 34 : 12, { speed: last ? 190 : 120 })
  }

  return {
    press: () => sparks.burst(xAt(p), Y, 20, { speed: 170 }),
    frame(dt) {
      time += dt
      if (pointer.inside) {
        p += (clamp((pointer.x - X0) / (X1 - X0)) - p) * approach(dt, 12)
        phase = 'run'
        timer = 0
      } else if (autoplay && idle()) {
        timer += dt
        if (phase === 'rest' && timer > 0.7) {
          phase = 'run'
        } else if (phase === 'run') {
          p = Math.min(1, p + dt / RUN_S)
          if (p >= 1) {
            phase = 'hold'
            timer = 0
          }
        } else if (phase === 'hold' && timer > HOLD_S) {
          phase = 'fade'
        } else if (phase === 'fade' && fade <= 0) {
          p = 0
          reached.fill(false)
          level.fill(0)
          ringT.fill(1)
          badgeT = 0
          phase = 'rest'
          timer = 0
        }
      }
      fade = phase === 'fade' ? Math.max(0, fade - dt / 0.45) : Math.min(1, fade + dt / 0.35)

      STOPS.forEach((s, i) => {
        if (!reached[i] && p >= s.t - 0.002) reach(i)
        else if (reached[i] && p < s.t - 0.02) reached[i] = false
        level[i] += ((reached[i] ? 1 : 0) - level[i]) * approach(dt, 9)
        ringT[i] = Math.min(1, ringT[i] + dt / 0.7)
        hotNodes[i].setAttribute('opacity', level[i].toFixed(3))
        attr(rings[i], { r: 7 + 18 * ringT[i], opacity: (1 - ringT[i]) * 0.7 * fade })
        labels[i].setAttribute('fill', mix(INK.muted, INK.heading, level[i] * fade))
      })
      badgeT = reached[LAST] ? Math.min(1, badgeT + dt / 0.4) : Math.max(0, badgeT - dt / 0.2)

      const hx = r1(xAt(p))
      litLayer.setAttribute('opacity', fade.toFixed(3))
      bar.setAttribute('x2', String(hx))
      head.setAttribute('transform', `translate(${hx} ${Y})`)
      halo.setAttribute('r', String(r1(11 + 2.5 * Math.sin(time * 6))))
      const d = flagPath(time, 1.4 + 1.8 * level[LAST])
      flag.setAttribute('d', d)
      flagHot.setAttribute('d', d)
      flagHot.setAttribute('opacity', level[LAST].toFixed(3))
      attr(badge, {
        transform: `translate(${X1} 154) scale(${Math.max(0, easeOutBack(badgeT)).toFixed(3)})`,
        opacity: Math.min(1, badgeT * 3),
      })
      sparks.frame(dt)
    },
  }
}

export function MilestoneRail() {
  const hostRef = useRef<HTMLDivElement>(null)
  const id = useSvgId()
  useScene(hostRef, setup)

  return (
    <SceneFrame hostRef={hostRef} cursor="cursor-ew-resize">
      <defs>
        <Glow id={`${id}-glow`} />
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor={INK.ember} stopOpacity={0.5} />
          <stop offset="1" stopColor={INK.ember} stopOpacity={0} />
        </radialGradient>
      </defs>

      <line x1={X0} x2={X1} y1={Y} y2={Y} stroke={INK.line} strokeWidth={3} strokeLinecap="round" />
      <line x1={X1} x2={X1} y1={Y - 8} y2={FLAG_TOP - 3} stroke={INK.edge} strokeWidth={1.5} strokeLinecap="round" />
      <path data-k="flag" fill="#1C1C22" stroke={INK.dim} strokeWidth={1} strokeLinejoin="round" />
      {STOPS.map((s) => (
        <g key={s.label} transform={`translate(${xAt(s.t)} ${Y})`}>
          <circle r={7} fill="#111114" stroke={INK.dim} strokeWidth={1.5} />
          <circle r={2.5} fill={INK.line} />
        </g>
      ))}
      {STOPS.map((s) => (
        <text
          key={s.label}
          data-k="label"
          x={xAt(s.t)}
          y={Y + 30}
          textAnchor="middle"
          fontSize={11}
          fill={INK.muted}
          className="font-sans"
        >
          {s.label}
        </text>
      ))}

      <g data-k="lit-layer">
        <line
          data-k="bar"
          x1={X0}
          x2={X0}
          y1={Y}
          y2={Y}
          stroke={INK.ember}
          strokeWidth={3}
          strokeLinecap="round"
          filter={`url(#${id}-glow)`}
        />
        <path data-k="flag-hot" fill={INK.ember} opacity={0} filter={`url(#${id}-glow)`} />
        {STOPS.map((s) => (
          <g
            key={s.label}
            data-k="hot-node"
            opacity={0}
            transform={`translate(${xAt(s.t)} ${Y})`}
            filter={`url(#${id}-glow)`}
          >
            <circle r={7} fill="#1A0C06" stroke={INK.ember} strokeWidth={2} />
            <circle r={3} fill={INK.hot} />
          </g>
        ))}
        <g data-k="badge" opacity={0}>
          <rect x={-30} y={-9} width={60} height={18} rx={9} fill={INK.ember} />
          <text
            y={3.3}
            textAnchor="middle"
            fontSize={9}
            fontWeight={700}
            letterSpacing={1.2}
            fill={INK.white}
            className="font-mono"
          >
            ON TIME
          </text>
        </g>
        <g data-k="head" transform={`translate(${X0} ${Y})`}>
          <circle data-k="halo" r={11} fill={`url(#${id}-halo)`} />
          <circle r={4} fill="#FFE8D6" filter={`url(#${id}-glow)`} />
        </g>
      </g>

      {STOPS.map((s) => (
        <circle
          key={s.label}
          data-k="ring"
          cx={xAt(s.t)}
          cy={Y}
          r={7}
          fill="none"
          stroke={INK.ember}
          strokeWidth={1.5}
          opacity={0}
        />
      ))}
      <SparkLayer glow={`${id}-glow`} />
    </SceneFrame>
  )
}
