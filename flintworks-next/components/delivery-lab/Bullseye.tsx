'use client'

import { useRef } from 'react'
import {
  attr,
  clamp,
  easeOutCubic,
  Glow,
  INK,
  r1,
  SceneFrame,
  SparkLayer,
  Sparks,
  Spring,
  useScene,
  useSvgId,
  type Scene,
  type SceneApi,
} from './scene'

// Option 7: a bow on the left keeps firing at a target, and every arrow lands in the middle.
// The target follows the cursor and arrows home in mid-flight, so however you move it they
// still hit dead centre; a counter keeps score (always perfect). Clicking fires straight away.
// Left alone the target drifts slowly and the bow keeps shooting.

const BOW = { x: 56, y: 100 }
const HOME = { x: 330, y: 100 }
const RINGS = [
  { r: 38, fill: '#19191F' },
  { r: 30, fill: '#3A180A' },
  { r: 22, fill: '#19191F' },
  { r: 14, fill: '#8F300B' },
  { r: 6.5, fill: INK.ember },
]
const FIRE_EVERY = 1.35
const CHARGE_S = 0.4
const MAX_STUCK = 4
const DEG = 180 / Math.PI

type Arrow = {
  el: SVGGElement
  head: Element
  state: 'off' | 'nock' | 'fly' | 'stuck' | 'drop'
  t: number
  dur: number
  x: number
  y: number
  ang: number
  p0x: number
  p0y: number
  p1x: number
  p1y: number
  ox: number
  oy: number
  vib: number
  vx: number
  vy: number
  order: number
}

function setup(api: SceneApi): Scene {
  const { el, all, pointer, autoplay, idle } = api
  const target = el('target')
  const bow = el('bow')
  const string = el('string')
  const flashEl = el('flash')
  const shockEl = el('shock')
  const score = el('score')
  const sparks = new Sparks(api)
  const arrows: Arrow[] = all<SVGGElement>('arrow').map((node) => ({
    el: node,
    head: node.querySelector('[data-head]')!,
    state: 'off',
    t: 0,
    dur: 1,
    x: 0,
    y: 0,
    ang: 0,
    p0x: 0,
    p0y: 0,
    p1x: 0,
    p1y: 0,
    ox: 0,
    oy: 0,
    vib: 0,
    vx: 0,
    vy: 0,
    order: 0,
  }))

  const tx = new Spring(HOME.x, 60)
  const ty = new Spring(HOME.y, 60)
  const kickX = new Spring(0, 320, 14)
  const kickY = new Spring(0, 320, 14)
  const pull = new Spring(0, 900, 10)
  let goal = { ...HOME }
  let time = 0
  let fireIn = 0.8
  let charging: Arrow | null = null
  let charge = 0
  let hits = 0
  let order = 0
  let flash = 0
  let shock = 1
  let aim = 0
  let cx = HOME.x
  let cy = HOME.y

  const stick = (a: Arrow, ang: number, ox: number, oy: number) => {
    a.state = 'stuck'
    a.ang = ang
    a.ox = ox
    a.oy = oy
    a.order = order++
    a.head.setAttribute('opacity', '0')
    const stuck = arrows.filter((s) => s.state === 'stuck').sort((p, q) => p.order - q.order)
    if (stuck.length > MAX_STUCK) {
      const old = stuck[0]
      old.state = 'drop'
      old.t = 0
      old.vx = -30
      old.vy = -40
    }
    hits++
    score.textContent = `${hits}/${hits}`
  }
  const nock = () => {
    const a = arrows.find((s) => s.state === 'off')
    if (!a) return
    a.state = 'nock'
    a.head.setAttribute('opacity', '1')
    charging = a
    charge = 0
  }
  const release = () => {
    const a = charging
    if (!a) return
    charging = null
    fireIn = FIRE_EVERY
    const dist = Math.hypot(cx - a.x, cy - a.y)
    a.state = 'fly'
    a.t = 0
    a.dur = 0.34 + dist / 1300
    a.p0x = a.x
    a.p0y = a.y
    a.p1x = (a.x + cx) / 2
    a.p1y = (a.y + cy) / 2 - Math.min(70, dist * 0.22)
  }

  if (!autoplay) {
    // Reduced motion: start with a few arrows already in the gold.
    ;[
      [-0.12, -2, 1],
      [0.04, 1.5, -1],
      [0.16, 0, 2],
    ].forEach(([ang, ox, oy], i) => {
      const a = arrows[i]
      a.el.setAttribute('opacity', '1')
      stick(a, ang, ox, oy)
    })
  }

  return {
    press() {
      if (charging) release()
      else {
        nock()
        charge = 0.5
      }
    },
    frame(dt) {
      time += dt
      if (pointer.inside) goal = { x: pointer.x, y: pointer.y }
      else if (autoplay && idle()) {
        goal = { x: HOME.x - 12 + 88 * Math.sin(time * 0.45), y: HOME.y + 34 * Math.sin(time * 0.8 + 1.2) }
      }
      cx = tx.step(clamp(goal.x, 190, 438), dt) + kickX.step(0, dt)
      cy = ty.step(clamp(goal.y, 44, 156), dt) + kickY.step(0, dt)

      flash *= Math.exp(-dt * 6)
      shock = Math.min(1, shock + dt / 0.5)
      attr(target, { transform: `translate(${r1(cx)} ${r1(cy)}) scale(${(1 + flash * 0.06).toFixed(3)})` })
      flashEl.setAttribute('opacity', flash.toFixed(3))
      attr(shockEl, { cx: r1(cx), cy: r1(cy), r: 7 + 42 * shock, opacity: (1 - shock) * 0.7 })

      aim += (clamp(Math.atan2(cy - BOW.y, cx - BOW.x), -0.7, 0.7) - aim) * (1 - Math.exp(-dt * 10))
      bow.setAttribute('transform', `translate(${BOW.x} ${BOW.y}) rotate(${r1(aim * DEG)})`)

      if (autoplay) fireIn -= dt
      if (!charging && fireIn <= 0) nock()
      let drawBack: number
      if (charging) {
        charge = Math.min(1, charge + dt / CHARGE_S)
        pull.x = 14 * easeOutCubic(charge)
        pull.v = 0
        drawBack = pull.x
      } else {
        drawBack = pull.step(0, dt)
      }
      string.setAttribute('d', `M-2 -34L${r1(-2 - drawBack)} 0L-2 34`)

      for (const a of arrows) {
        if (a.state === 'nock') {
          const len = 58 - drawBack
          a.x = BOW.x + Math.cos(aim) * len
          a.y = BOW.y + Math.sin(aim) * len
          a.ang = aim
        } else if (a.state === 'fly') {
          a.t = Math.min(1, a.t + dt / a.dur)
          const u = a.t
          const iu = 1 - u
          a.x = iu * iu * a.p0x + 2 * iu * u * a.p1x + u * u * cx
          a.y = iu * iu * a.p0y + 2 * iu * u * a.p1y + u * u * cy
          a.ang = Math.atan2(2 * iu * (a.p1y - a.p0y) + 2 * u * (cy - a.p1y), 2 * iu * (a.p1x - a.p0x) + 2 * u * (cx - a.p1x))
          if (u >= 1) {
            stick(a, a.ang, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5)
            a.vib = 1
            flash = 1
            shock = 0
            kickX.v += Math.cos(a.ang) * 110
            kickY.v += Math.sin(a.ang) * 110
            sparks.burst(cx, cy, 16, { angle: a.ang + Math.PI, spread: 1.8, speed: 170 })
          }
        } else if (a.state === 'drop') {
          a.t = Math.min(1, a.t + dt / 0.8)
          a.vy += 500 * dt
          a.x += a.vx * dt
          a.y += a.vy * dt
          a.ang += 3 * dt
          if (a.t >= 1) a.state = 'off'
        }
        if (a.state === 'stuck') {
          a.vib *= Math.exp(-dt * 5)
          a.x = cx + a.ox
          a.y = cy + a.oy
        }
        const wobble = a.state === 'stuck' ? a.vib * Math.sin(time * 55) * 0.12 : 0
        const opacity = a.state === 'off' ? 0 : a.state === 'drop' ? 1 - a.t : 1
        attr(a.el, {
          transform: `translate(${r1(a.x)} ${r1(a.y)}) rotate(${r1((a.ang + wobble) * DEG)})`,
          opacity,
        })
      }
      if (charging && charge >= 1) release()
      sparks.frame(dt)
    },
  }
}

export function Bullseye() {
  const hostRef = useRef<HTMLDivElement>(null)
  const id = useSvgId()
  useScene(hostRef, setup)

  return (
    <SceneFrame hostRef={hostRef} cursor="cursor-crosshair">
      <defs>
        <Glow id={`${id}-glow`} />
      </defs>

      <text x={24} y={30} fontSize={8.5} letterSpacing={1.4} fill={INK.muted} className="font-mono">
        ON TARGET{' '}
        <tspan data-k="score" fill={INK.flame} fontWeight={700}>
          0/0
        </tspan>
      </text>

      <g data-k="target" transform={`translate(${HOME.x} ${HOME.y})`}>
        {RINGS.map((ring) => (
          <circle key={ring.r} r={ring.r} fill={ring.fill} stroke="#0A0A0B" strokeWidth={0.8} />
        ))}
        <circle r={38} fill="none" stroke="#2E2E38" />
        <circle r={6.5} fill={INK.ember} filter={`url(#${id}-glow)`} />
        <circle data-k="flash" r={6.5} fill="#FFD9B8" opacity={0} filter={`url(#${id}-glow)`} />
      </g>
      <circle data-k="shock" r={7} fill="none" stroke={INK.ember} strokeWidth={1.5} opacity={0} />

      <g data-k="bow" transform={`translate(${BOW.x} ${BOW.y})`}>
        <path d="M-2 -34Q22 0 -2 34" fill="none" stroke="#8C8C99" strokeWidth={2.6} strokeLinecap="round" />
        <path data-k="string" d="M-2 -34L-2 0L-2 34" fill="none" stroke={INK.muted} strokeWidth={0.9} />
        <rect x={5} y={-6} width={5} height={12} rx={2} fill={INK.ember} />
      </g>

      {Array.from({ length: 7 }, (_, i) => (
        <g key={i} data-k="arrow" opacity={0}>
          <line x1={-58} x2={-4} y1={0} y2={0} stroke="#C9C9D3" strokeWidth={1.8} strokeLinecap="round" />
          <path data-head="" d="M0 0L-10 -4L-8 0L-10 4Z" fill={INK.flame} />
          <path d="M-48 -0.6L-56 -5.5H-62L-57 -0.6ZM-48 0.6L-56 5.5H-62L-57 0.6Z" fill={INK.ember} />
        </g>
      ))}
      <SparkLayer glow={`${id}-glow`} />
    </SceneFrame>
  )
}
