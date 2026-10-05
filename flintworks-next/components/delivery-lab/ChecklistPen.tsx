'use client'

import { useRef } from 'react'
import {
  approach,
  clamp,
  Glow,
  INK,
  mix,
  r1,
  SceneFrame,
  scribbleLoop,
  SparkLayer,
  Sparks,
  useScene,
  useSvgId,
  type Scene,
  type SceneApi,
} from './scene'

// Option 6: a pinned-up checklist for the client's new website. A pencil ticks each item off
// against its date, then rings "Go live" once everything's done. The pencil is the cursor;
// clicking a row ticks or unticks it. Left alone the pencil works down the list by itself,
// tracing each tick, then the list clears and it starts again.

const CX = 240
const CY = 102
const ROT = -2
const ROWS = [
  { label: 'Look & feel', due: 'Mar 3' },
  { label: 'Pages & menu', due: 'Mar 10' },
  { label: 'Online orders', due: 'Mar 17' },
  { label: 'Go live', due: 'Mar 24' },
]
const rowY = (i: number) => 84 + i * 26
const REST = { x: 352, y: 184 }
const LOOP = scribbleLoop(184, rowY(3) - 2.5, 33, 12.5)

// The card is drawn rotated; bring the pointer into its (unrotated) frame.
const toCard = (x: number, y: number) => {
  const a = (-ROT * Math.PI) / 180
  const dx = x - CX
  const dy = y - CY
  return { x: CX + dx * Math.cos(a) - dy * Math.sin(a), y: CY + dx * Math.sin(a) + dy * Math.cos(a) }
}
const rowAt = (x: number, y: number) =>
  x < 128 || x > 352 ? -1 : ROWS.findIndex((_, i) => Math.abs(y - rowY(i) + 1) <= 13)

function setup(api: SceneApi): Scene {
  const { el, all, pointer, autoplay, idle } = api
  const ticks = all<SVGPathElement>('tick')
  const labels = all('label')
  const dues = all('due')
  const hovers = all('hover')
  const loop = el<SVGPathElement>('loop')
  const pen = el('pen')
  const sparks = new Sparks(api)

  const lens = ticks.map((t) => t.getTotalLength())
  const loopLen = loop.getTotalLength()
  const want = ROWS.map(() => !autoplay)
  const level = ROWS.map((): number => (autoplay ? 0 : 1))
  const hoverA = ROWS.map(() => 0)
  const dueShown = ROWS.map(() => false)
  let loopWant = !autoplay
  let loopLevel = autoplay ? 0 : 1
  let phase: 'work' | 'hold' | 'clear' = 'work'
  let timer = 0
  const tip = { ...REST }
  let angle = -52
  let lastX = tip.x

  const tickPoint = (i: number, t: number) => ticks[i].getPointAtLength(clamp(t) * lens[i])
  const loopPoint = (t: number) => loop.getPointAtLength(clamp(t) * loopLen)

  return {
    press() {
      const p = toCard(pointer.x, pointer.y)
      const i = rowAt(p.x, p.y)
      if (i >= 0) want[i] = !want[i]
    },
    frame(dt) {
      const local = toCard(pointer.x, pointer.y)
      const row = pointer.inside ? rowAt(local.x, local.y) : -1
      let tx = tip.x
      let ty = tip.y
      let rate = 8

      if (pointer.inside) {
        tx = local.x
        ty = local.y
        rate = 30
        phase = 'work'
        timer = 0
        loopWant = want.every(Boolean)
      } else if (autoplay && idle()) {
        timer += dt
        if (phase === 'work') {
          // Trace whatever is being drawn; otherwise walk to the next thing to draw and start it.
          const drawing = want.findIndex((w, i) => w && level[i] < 1)
          const next = want.indexOf(false)
          let aim: DOMPoint | null = null
          if (drawing >= 0) {
            aim = tickPoint(drawing, level[drawing])
            rate = 40
          } else if (next >= 0) {
            aim = tickPoint(next, 0)
            if (Math.hypot(aim.x - tip.x, aim.y - tip.y) < 2.5) want[next] = true
          } else if (loopWant && loopLevel < 1) {
            aim = loopPoint(loopLevel)
            rate = 40
          } else if (!loopWant) {
            aim = loopPoint(0)
            if (Math.hypot(aim.x - tip.x, aim.y - tip.y) < 2.5) loopWant = true
          } else {
            phase = 'hold'
            timer = 0
          }
          if (aim) {
            tx = aim.x
            ty = aim.y
          }
        } else if (phase === 'hold') {
          tx = REST.x
          ty = REST.y
          rate = 4
          if (timer > 2.6) {
            want.fill(false)
            loopWant = false
            phase = 'clear'
            timer = 0
          }
        } else if (timer > 0.9) {
          phase = 'work'
        }
      }
      if (!want.every(Boolean)) loopWant = false

      ROWS.forEach((r, i) => {
        level[i] = clamp(level[i] + (want[i] ? dt / 0.32 : -dt / 0.2))
        ticks[i].setAttribute('stroke-dashoffset', (1 - level[i]).toFixed(3))
        labels[i].setAttribute('fill', mix(INK.body, INK.heading, level[i]))
        dues[i].setAttribute('fill', mix(INK.muted, INK.flame, level[i]))
        if (level[i] > 0.5 !== dueShown[i]) {
          dueShown[i] = level[i] > 0.5
          dues[i].textContent = dueShown[i] ? `✓ ${r.due}` : r.due
        }
        hoverA[i] += ((row === i ? 1 : 0) - hoverA[i]) * approach(dt, 16)
        hovers[i].setAttribute('opacity', (hoverA[i] * 0.07).toFixed(3))
      })

      const before = loopLevel
      loopLevel = clamp(loopLevel + (loopWant ? dt / 0.75 : -dt / 0.25))
      loop.setAttribute('stroke-dashoffset', (1 - loopLevel).toFixed(3))
      if (before < 1 && loopLevel >= 1) sparks.burst(184, rowY(3) - 2, 30, { speed: 160 })

      tip.x += (tx - tip.x) * approach(dt, rate)
      tip.y += (ty - tip.y) * approach(dt, rate)
      const vx = dt > 0 ? (tip.x - lastX) / dt : 0
      lastX = tip.x
      angle += (-52 + clamp(vx * 0.03, -10, 10) - angle) * approach(dt, 10)
      pen.setAttribute('transform', `translate(${r1(tip.x)} ${r1(tip.y)}) rotate(${r1(angle)})`)
      sparks.frame(dt)
    },
  }
}

export function ChecklistPen() {
  const hostRef = useRef<HTMLDivElement>(null)
  const id = useSvgId()
  useScene(hostRef, setup)

  return (
    <SceneFrame hostRef={hostRef} cursor="cursor-none">
      <defs>
        <Glow id={`${id}-glow`} blur={1.5} />
      </defs>
      <g transform={`rotate(${ROT} ${CX} ${CY})`}>
        <rect x={118} y={16} width={244} height={172} rx={6} fill="#16161B" stroke="#2A2A33" />
        <rect x={208} y={8} width={64} height={16} rx={4} fill="#2A2A33" stroke="#3A3A45" />
        <rect x={224} y={12} width={32} height={6} rx={3} fill="#0A0A0B" />
        <text x={138} y={50} fontSize={14} fontWeight={700} fill={INK.heading} className="font-display">
          Your website
        </text>
        <text
          x={342}
          y={50}
          textAnchor="end"
          fontSize={7.5}
          letterSpacing={1.5}
          fill={INK.muted}
          className="font-mono"
        >
          LAUNCH PLAN
        </text>
        <line x1={138} x2={342} y1={62} y2={62} stroke="#2A2A33" />

        {ROWS.map((r, i) => {
          const y = rowY(i)
          return (
            <g key={r.label}>
              <rect data-k="hover" x={130} y={y - 12} width={220} height={24} rx={5} fill={INK.ember} opacity={0} />
              {i < ROWS.length - 1 && <line x1={138} x2={342} y1={y + 13} y2={y + 13} stroke="#1F1F26" />}
              <rect x={138} y={y - 7.5} width={13} height={13} rx={3} fill="none" stroke={INK.edge} strokeWidth={1.3} />
              <text data-k="label" x={162} y={y + 4.2} fontSize={12.5} fill={INK.body} className="font-sans">
                {r.label}
              </text>
              <text
                data-k="due"
                x={342}
                y={y + 3.5}
                textAnchor="end"
                fontSize={9}
                fill={INK.muted}
                className="font-mono"
              >
                {r.due}
              </text>
              <path
                data-k="tick"
                d={`M140.5 ${y - 0.5}L144.8 ${y + 4}L155 ${y - 9.5}`}
                fill="none"
                stroke={INK.ember}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1}
              />
            </g>
          )
        })}
        <path
          data-k="loop"
          d={LOOP}
          fill="none"
          stroke={INK.ember}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1}
          filter={`url(#${id}-glow)`}
        />
        <SparkLayer glow={`${id}-glow`} />

        {/* Pencil: tip at the origin, body running along +x, turned up and to the right */}
        <g data-k="pen" transform={`translate(${REST.x} ${REST.y}) rotate(-52)`}>
          <path d="M0 0L9 -3.4V3.4Z" fill="#E9CFA9" />
          <path d="M0 0L3.2 -1.2V1.2Z" fill="#2A2A33" />
          <rect x={9} y={-3.4} width={34} height={6.8} fill={INK.ember} />
          <rect x={9} y={-3.4} width={34} height={2.2} fill={INK.flame} opacity={0.6} />
          <rect x={43} y={-3.4} width={4.5} height={6.8} fill="#8C8C99" />
          <rect x={47.5} y={-3.4} width={5} height={6.8} rx={2} fill={INK.hot} />
        </g>
      </g>
    </SceneFrame>
  )
}
