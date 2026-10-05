'use client'

import { useRef } from 'react'
import {
  approach,
  attr,
  awningPaths,
  clamp,
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
} from './scene'

// Option 4: a delivery van drives up to a little shop front and parks; the shop's OPEN sign
// flickers on and the windows light up. The van drives toward the cursor (with a bit of body roll
// and exhaust), so you can park it yourself; clicking honks. Left alone it pulls in, honks, waits,
// drives off, and comes round again.

const ROAD = 172
const PARK = 186
const ACC = 520
const VMAX = 310
const K = 9
const C = 6.3
const [AWNING_LIGHT, AWNING_DARK] = awningPaths(306, 446, 90, 102, 8)

function setup(api: SceneApi): Scene {
  const { el, all, pointer, autoplay, idle } = api
  const van = el('van')
  const body = el('body')
  const spokes = all('spokes')
  const honkEl = el('honk')
  const glows = all('glow')
  const open = el('open')
  const sign = el('sign')
  const awning = el('awning')
  const spill = el('spill')
  const bay = el('bay')
  const puffs = all('puff').map((node) => ({ node, t: 1, x: 0, y: 0 }))
  const sparks = new Sparks(api)

  let x = autoplay ? -150 : PARK
  let v = 0
  let target = PARK
  let phase: 'arrive' | 'leave' | 'gone' = 'arrive'
  let timer = 0
  let parkedFor = autoplay ? 0 : 1
  let awayFor = 0
  let time = 0
  let lightsOn = !autoplay
  let lights = lightsOn ? 1 : 0
  let flick = 1
  let wheel = 0
  let honk = 0
  let honked = false
  let puffAcc = 0
  let puffNext = 0
  const tilt = new Spring(0, 110, 9)
  const bob = new Spring(0, 260, 9)

  const beep = () => {
    honk = 1
    bob.v -= 45
    tilt.v -= 20
  }

  return {
    press: beep,
    frame(dt) {
      time += dt
      if (pointer.inside) {
        target = clamp(pointer.x - 48, -60, 400)
        phase = 'arrive'
        timer = 0
      } else if (autoplay && idle()) {
        timer += dt
        if (phase === 'arrive') {
          target = PARK
          if (parkedFor > 1 && !honked) {
            beep()
            honked = true
          }
          if (parkedFor > 3.6) phase = 'leave'
        } else if (phase === 'leave') {
          target = 660
          if (x > 580) {
            phase = 'gone'
            timer = 0
          }
        } else if (phase === 'gone' && timer > 1.6) {
          x = -150
          v = 0
          phase = 'arrive'
          honked = false
        }
      }

      const a = clamp(K * (target - x) - C * v, -ACC, ACC)
      v = clamp(v + a * dt, -VMAX, VMAX)
      x += v * dt
      wheel = (wheel + ((v * dt) / 9) * (180 / Math.PI)) % 360

      const tiltDeg = tilt.step(clamp((-a / ACC) * 3, -3, 3), dt)
      const idleShake = autoplay && Math.abs(v) < 4 ? Math.sin(time * 38) * 0.25 : 0
      const bobY = bob.step(0, dt) + idleShake
      van.setAttribute('transform', `translate(${r1(x)} ${ROAD})`)
      body.setAttribute('transform', `translate(0 ${bobY.toFixed(2)}) rotate(${tiltDeg.toFixed(2)} 48 -10)`)
      spokes.forEach((s) => s.setAttribute('transform', `rotate(${r1(wheel)})`))

      // Shop opens once the van has been parked in the bay for a moment; closes after it's been gone a while.
      const inBay = Math.abs(x - PARK) < 28
      parkedFor = inBay && Math.abs(v) < 8 ? parkedFor + dt : 0
      awayFor = inBay ? 0 : awayFor + dt
      if (!inBay) honked = false
      if (!lightsOn && parkedFor > 0.35) {
        lightsOn = true
        flick = 0
        sparks.burst(376, 76, 16, { speed: 90 })
      }
      if (lightsOn && awayFor > 1.4) lightsOn = false
      flick = Math.min(1, flick + dt / 0.7)
      lights += ((lightsOn ? 1 : 0) - lights) * approach(dt, lightsOn ? 10 : 3)
      const flicker = flick < 1 && Math.sin(flick * 97) + Math.sin(flick * 41) < 0.2 ? 0.2 : 1
      const L = lights * flicker
      glows.forEach((g) => g.setAttribute('opacity', (L * 0.9).toFixed(3)))
      open.setAttribute('opacity', L.toFixed(3))
      spill.setAttribute('opacity', L.toFixed(3))
      sign.setAttribute('fill', mix(INK.edge, INK.heading, L))
      awning.setAttribute('opacity', (0.55 + 0.45 * L).toFixed(3))
      bay.setAttribute('opacity', ((1 - lights) * (0.4 + 0.25 * Math.sin(time * 4))).toFixed(3))

      honk = Math.max(0, honk - dt / 0.5)
      honkEl.setAttribute('opacity', honk > 0 && Math.floor((1 - honk) * 4) % 2 === 0 ? '1' : '0')

      if (autoplay) {
        puffAcc += dt * (Math.abs(v) < 4 ? 1.6 : 2.5 + (Math.abs(a) / ACC) * 8)
        if (puffAcc >= 1 && x > -110 && x < 500) {
          puffAcc = 0
          const p = puffs[puffNext]
          puffNext = (puffNext + 1) % puffs.length
          p.t = 0
          p.x = x - 3
          p.y = ROAD - 10
        }
      }
      for (const p of puffs) {
        if (p.t >= 1) continue
        p.t = Math.min(1, p.t + dt / 0.9)
        p.x -= 16 * dt
        p.y -= 10 * dt
        attr(p.node, { cx: p.x, cy: p.y, r: 2 + 5 * p.t, opacity: 0.28 * (1 - p.t) })
      }
      sparks.frame(dt)
    },
  }
}

function Wheel({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} -9)`}>
      <circle r={9} fill="#0D0D10" stroke="#3A3A46" strokeWidth={2} />
      <g data-k="spokes" stroke={INK.edge} strokeWidth={1.4} strokeLinecap="round">
        <path d="M0 -6V6M-5.2 -3L5.2 3M-5.2 3L5.2 -3" />
      </g>
      <circle r={2.8} fill={INK.muted} />
    </g>
  )
}

export function VanDelivery() {
  const hostRef = useRef<HTMLDivElement>(null)
  const id = useSvgId()
  useScene(hostRef, setup)

  return (
    <SceneFrame hostRef={hostRef} cursor="cursor-pointer">
      <defs>
        <Glow id={`${id}-glow`} />
        <linearGradient id={`${id}-warm`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={INK.flame} stopOpacity={0.4} />
          <stop offset="1" stopColor={INK.ember} stopOpacity={0.12} />
        </linearGradient>
        <radialGradient id={`${id}-spill`}>
          <stop offset="0" stopColor={INK.ember} stopOpacity={0.35} />
          <stop offset="1" stopColor={INK.ember} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFD9B8" stopOpacity={0.3} />
          <stop offset="1" stopColor="#FFD9B8" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Street */}
      <line x1={-480} x2={960} y1={ROAD} y2={ROAD} stroke="#2A2A33" strokeWidth={1.5} />
      <line x1={-480} x2={960} y1={ROAD + 15} y2={ROAD + 15} stroke="#1E1E24" strokeWidth={2} strokeDasharray="14 12" />

      {/* Shop */}
      <rect x={294} y={50} width={164} height={9} rx={1.5} fill="#1C1C22" />
      <rect x={300} y={59} width={152} height={113} fill="#131318" stroke="#25252D" />
      <rect x={318} y={65} width={116} height={20} rx={2} fill="#0D0D10" stroke="#25252D" />
      <text
        data-k="sign"
        x={376}
        y={78.8}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        letterSpacing={2}
        fill={INK.edge}
        className="font-display"
      >
        YOUR SHOP
      </text>
      <g data-k="awning" opacity={0.55}>
        <path d={AWNING_DARK} fill="#2A2A31" />
        <path d={AWNING_LIGHT} fill={INK.ember} />
      </g>
      <rect x={312} y={114} width={76} height={50} rx={1.5} fill="#0B0B0E" stroke="#25252D" />
      <rect data-k="glow" x={312} y={114} width={76} height={50} rx={1.5} fill={`url(#${id}-warm)`} opacity={0} />
      <line x1={312} x2={388} y1={121} y2={121} stroke="#25252D" />
      <rect x={330} y={128} width={40} height={18} rx={3} fill="none" stroke="#2E2E37" />
      <text
        x={350}
        y={140.5}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        letterSpacing={1.5}
        fill="#33333C"
        className="font-mono"
      >
        OPEN
      </text>
      <g data-k="open" opacity={0} filter={`url(#${id}-glow)`}>
        <rect x={330} y={128} width={40} height={18} rx={3} fill={INK.ember} fillOpacity={0.12} stroke={INK.ember} strokeWidth={1.4} />
        <text
          x={350}
          y={140.5}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          letterSpacing={1.5}
          fill="#FFC49A"
          className="font-mono"
        >
          OPEN
        </text>
      </g>
      <rect x={400} y={112} width={38} height={60} fill="#0F0F13" stroke="#25252D" />
      <rect x={406} y={118} width={26} height={24} fill="#0B0B0E" />
      <rect data-k="glow" x={406} y={118} width={26} height={24} fill={`url(#${id}-warm)`} opacity={0} />
      <circle cx={431} cy={147} r={1.8} fill={INK.muted} />
      <ellipse data-k="spill" cx={376} cy={ROAD + 1} rx={90} ry={6} fill={`url(#${id}-spill)`} opacity={0} />

      {/* Drop-off bay */}
      <path data-k="bay" d={`M${PARK - 6} ${ROAD}v7M${PARK + 102} ${ROAD}v7`} stroke={INK.ember} strokeWidth={2} strokeLinecap="round" />

      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} data-k="puff" r={2} fill={INK.muted} opacity={0} />
      ))}

      {/* Van: origin at the rear wheel's ground line, facing right */}
      <g data-k="van" transform={`translate(${PARK} ${ROAD})`}>
        <g data-k="body">
          <path d="M95 -27L170 -40L170 -10Z" fill={`url(#${id}-beam)`} />
          <path
            d="M2 -13V-46Q2 -51 7 -51H63L78 -33H89Q95 -33 95 -27V-15Q95 -13 93 -13Z"
            fill="#202028"
            stroke="#3A3A46"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <path d="M64.5 -47.5L75.8 -34.5H64.5Z" fill="#2A2E38" />
          <path d="M66 -45L69 -41" stroke="#4A5060" strokeWidth={1.2} strokeLinecap="round" />
          <path d="M57 -49V-15" stroke="#2E2E38" />
          <rect x={5} y={-27} width={50} height={3} fill={INK.ember} />
          <text x={8} y={-33} fontSize={6.4} fontWeight={700} letterSpacing={0.6} fill="#9A9AA8" className="font-mono">
            FLINTWORKS
          </text>
          <rect x={91.5} y={-29} width={3.5} height={4.5} rx={1.2} fill="#FFE8D6" />
          <rect x={1} y={-31} width={2.6} height={7} rx={1} fill="#D1411C" />
          <rect x={86} y={-16} width={11} height={3.2} rx={1.6} fill="#2E2E38" />
          <rect x={-1} y={-16} width={8} height={3.2} rx={1.6} fill="#2E2E38" />
          <path
            data-k="honk"
            d="M101 -44l6 -5M103 -34h8M101 -24l6 5"
            stroke={INK.flame}
            strokeWidth={1.6}
            strokeLinecap="round"
            opacity={0}
          />
        </g>
        <Wheel x={21} />
        <Wheel x={75} />
      </g>
      <SparkLayer glow={`${id}-glow`} />
    </SceneFrame>
  )
}
