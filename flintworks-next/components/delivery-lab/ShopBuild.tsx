'use client'

import { useRef } from 'react'
import {
  approach,
  attr,
  awningPaths,
  clamp,
  easeOutBack,
  easeOutCubic,
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

// Option 5: a shop front goes up from its blueprint, piece by piece: walls rise, the door, window,
// awning and sign drop into place with a shower of sparks, then the lights come on and the sign
// reads OPEN. The cursor is a welding torch that builds whatever part of the blueprint it touches;
// clicking a finished shop clears it for another go. Left alone it builds, holds, clears, repeats.

type Box = [number, number, number, number]
const GROUND = 180
const PARTS: { key: string; box: Box; grow?: boolean }[] = [
  { key: 'walls', box: [146, 40, 334, 180], grow: true },
  { key: 'door', box: [266, 116, 310, 180] },
  { key: 'window', box: [166, 118, 254, 172] },
  { key: 'awning', box: [157, 88, 323, 110] },
  { key: 'sign', box: [176, 58, 304, 80] },
]
const area = ([x0, y0, x1, y1]: Box) => (x1 - x0) * (y1 - y0)
const BY_SIZE = PARTS.map((_, i) => i).sort((a, b) => area(PARTS[a].box) - area(PARTS[b].box))
const inBox = ([x0, y0, x1, y1]: Box, x: number, y: number) => x >= x0 && x <= x1 && y >= y0 && y <= y1
const [AWNING_LIGHT, AWNING_DARK] = awningPaths(162, 318, 88, 102, 9)

function setup(api: SceneApi): Scene {
  const { el, all, pointer, autoplay, idle } = api
  const parts = all('part')
  const blueprints = all('bp')
  const extras = el('bp-extra')
  const lightsEl = el('lights')
  const signText = el('sign-text')
  const torch = el('torch')
  const sparks = new Sparks(api)

  const want = PARTS.map(() => !autoplay)
  const b = PARTS.map((): number => (autoplay ? 0 : 1))
  let phase: 'build' | 'hold' | 'clear' | 'wait' = 'build'
  let timer = 0
  let lightsOn = !autoplay
  let lights = lightsOn ? 1 : 0
  let flick = 1
  let torchA = 0
  let weld = 0

  const complete = () => want.every(Boolean) && b.every((v) => v >= 1)
  const unbuiltAt = (x: number, y: number) => BY_SIZE.find((i) => !want[i] && inBox(PARTS[i].box, x, y)) ?? -1

  return {
    press() {
      if (complete()) {
        want.fill(false)
        return
      }
      const i = unbuiltAt(pointer.x, pointer.y)
      const next = i >= 0 ? i : want.indexOf(false)
      if (next >= 0) want[next] = true
    },
    frame(dt) {
      if (pointer.inside) {
        const i = unbuiltAt(pointer.x, pointer.y)
        if (i >= 0) want[i] = true
        phase = 'build'
        timer = 0
      } else if (autoplay && idle()) {
        timer += dt
        if (phase === 'build') {
          if (complete()) {
            phase = 'hold'
            timer = 0
          } else if (timer > 0.6) {
            const next = want.indexOf(false)
            if (next >= 0) {
              want[next] = true
              timer = 0
            }
          }
        } else if (phase === 'hold' && timer > 3.2) {
          want.fill(false)
          phase = 'clear'
        } else if (phase === 'clear' && b.every((v) => v === 0)) {
          phase = 'wait'
          timer = 0
        } else if (phase === 'wait' && timer > 0.8) {
          phase = 'build'
          timer = 0
        }
      }

      PARTS.forEach((part, i) => {
        const prev = b[i]
        b[i] = want[i] ? Math.min(1, prev + dt / 0.55) : Math.max(0, prev - dt / 0.3)
        const landAt = part.grow ? 0.5 : 0.37
        if (want[i] && prev < landAt && b[i] >= landAt) {
          const [x0, , x1, y1] = part.box
          sparks.burst((x0 + x1) / 2, y1, part.grow ? 24 : 14, {
            speed: part.grow ? 150 : 120,
            angle: -Math.PI / 2,
            spread: Math.PI * 0.9,
          })
        }
        if (part.grow) {
          attr(parts[i], {
            opacity: clamp(b[i] * 3),
            transform: `translate(0 ${GROUND}) scale(1 ${easeOutCubic(b[i]).toFixed(3)}) translate(0 ${-GROUND})`,
          })
        } else {
          const drop = want[i] ? (1 - easeOutBack(b[i])) * -16 : 0
          attr(parts[i], { opacity: clamp(b[i] * 2), transform: `translate(0 ${r1(drop)})` })
        }
        blueprints[i].setAttribute('opacity', (1 - clamp(b[i] * 1.5)).toFixed(3))
      })

      const done = complete()
      if (done && !lightsOn) {
        lightsOn = true
        flick = 0
        sparks.burst(240, 69, 30, { speed: 170 })
      }
      if (!done) lightsOn = false
      flick = Math.min(1, flick + dt / 0.7)
      lights += ((lightsOn ? 1 : 0) - lights) * approach(dt, 9)
      const flicker = flick < 1 && Math.sin(flick * 97) + Math.sin(flick * 41) < 0.2 ? 0.2 : 1
      const L = lights * flicker
      lightsEl.setAttribute('opacity', L.toFixed(3))
      signText.setAttribute('fill', mix(INK.edge, INK.heading, L))
      extras.setAttribute('opacity', (1 - 0.7 * lights).toFixed(3))

      // The cursor is a torch: it glows, and throws sparks while it's over a part that's going up.
      torchA += ((pointer.inside ? 1 : 0) - torchA) * approach(dt, 12)
      attr(torch, { transform: `translate(${r1(pointer.x)} ${r1(pointer.y)})`, opacity: torchA })
      const welding =
        pointer.inside && PARTS.some((p, i) => want[i] && b[i] < 1 && inBox(p.box, pointer.x, pointer.y))
      weld = welding ? weld + dt * 45 : 0
      for (; weld >= 1; weld--) sparks.burst(pointer.x, pointer.y, 1, { speed: 120, life: 0.4 })

      sparks.frame(dt)
    },
  }
}

const BP = { fill: 'none', stroke: '#34343E', strokeDasharray: '4 3' }
const LINE = '#2A2A33'

export function ShopBuild() {
  const hostRef = useRef<HTMLDivElement>(null)
  const id = useSvgId()
  useScene(hostRef, setup)

  return (
    <SceneFrame hostRef={hostRef} cursor="cursor-crosshair">
      <defs>
        <Glow id={`${id}-glow`} />
        <pattern id={`${id}-dots`} width={12} height={12} patternUnits="userSpaceOnUse">
          <circle cx={6} cy={6} r={0.7} fill="#2A2A33" />
        </pattern>
        <linearGradient id={`${id}-warm`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={INK.flame} stopOpacity={0.42} />
          <stop offset="1" stopColor={INK.ember} stopOpacity={0.12} />
        </linearGradient>
        <radialGradient id={`${id}-spill`}>
          <stop offset="0" stopColor={INK.ember} stopOpacity={0.35} />
          <stop offset="1" stopColor={INK.ember} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-torch`}>
          <stop offset="0" stopColor={INK.flame} stopOpacity={0.5} />
          <stop offset="1" stopColor={INK.ember} stopOpacity={0} />
        </radialGradient>
      </defs>

      <g data-k="bp-extra">
        <rect x={-480} y={-100} width={1440} height={400} fill={`url(#${id}-dots)`} />
        <path d="M134 40V180M130 40h8M130 180h8M146 26H334M146 22v8M334 22v8" stroke="#3A3A45" fill="none" />
        <text transform="translate(126 110) rotate(-90)" textAnchor="middle" fontSize={8} fill={INK.muted} className="font-mono">
          4.2 m
        </text>
        <text x={240} y={19} textAnchor="middle" fontSize={8} fill={INK.muted} className="font-mono">
          6.0 m
        </text>
      </g>
      <line x1={-480} x2={960} y1={GROUND} y2={GROUND} stroke={LINE} strokeWidth={1.5} />

      {/* Blueprint outlines, in PARTS order */}
      <g data-k="bp" {...BP}>
        <rect x={146} y={40} width={188} height={10} />
        <rect x={154} y={50} width={172} height={130} />
      </g>
      <g data-k="bp" {...BP}>
        <rect x={266} y={116} width={44} height={64} />
        <rect x={273} y={123} width={30} height={26} />
      </g>
      <g data-k="bp" {...BP}>
        <rect x={170} y={118} width={80} height={50} />
        <path d="M170 126H250" />
        <rect x={166} y={168} width={88} height={4} />
      </g>
      <g data-k="bp" {...BP}>
        <path d={AWNING_LIGHT + AWNING_DARK} />
      </g>
      <g data-k="bp" {...BP}>
        <rect x={176} y={58} width={128} height={22} />
      </g>

      {/* Solid parts, in PARTS order */}
      <g data-k="part" opacity={0}>
        <rect x={146} y={40} width={188} height={10} rx={1.5} fill="#1C1C22" />
        <rect x={154} y={50} width={172} height={130} fill="#131318" stroke={LINE} />
        <rect x={154} y={172} width={172} height={8} fill="#18181E" />
      </g>
      <g data-k="part" opacity={0}>
        <rect x={266} y={116} width={44} height={64} fill="#0F0F13" stroke={LINE} />
        <rect x={273} y={123} width={30} height={26} fill="#0B0B0E" />
        <circle cx={302} cy={154} r={2} fill={INK.muted} />
      </g>
      <g data-k="part" opacity={0}>
        <rect x={170} y={118} width={80} height={50} fill="#0B0B0E" stroke={LINE} />
        <line x1={170} x2={250} y1={126} y2={126} stroke={LINE} />
        <rect x={166} y={168} width={88} height={4} rx={1} fill="#1E1E25" />
        <rect x={188} y={136} width={44} height={18} rx={3} fill="none" stroke="#2E2E37" />
        <text
          x={210}
          y={148.6}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          letterSpacing={1.5}
          fill="#33333C"
          className="font-mono"
        >
          OPEN
        </text>
      </g>
      <g data-k="part" opacity={0}>
        <path d={AWNING_DARK} fill="#2A2A31" />
        <path d={AWNING_LIGHT} fill={INK.ember} />
      </g>
      <g data-k="part" opacity={0}>
        <rect x={176} y={58} width={128} height={22} rx={2} fill="#0D0D10" stroke={LINE} />
        <text
          data-k="sign-text"
          x={240}
          y={73.6}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          letterSpacing={2.4}
          fill={INK.edge}
          className="font-display"
        >
          YOUR SHOP
        </text>
      </g>

      <g data-k="lights" opacity={0}>
        <rect x={170} y={118} width={80} height={50} fill={`url(#${id}-warm)`} />
        <rect x={273} y={123} width={30} height={26} fill={`url(#${id}-warm)`} />
        <ellipse cx={240} cy={GROUND + 1} rx={110} ry={7} fill={`url(#${id}-spill)`} />
        <g filter={`url(#${id}-glow)`}>
          <rect x={188} y={136} width={44} height={18} rx={3} fill={INK.ember} fillOpacity={0.12} stroke={INK.ember} strokeWidth={1.4} />
          <text
            x={210}
            y={148.6}
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
      </g>

      <g data-k="torch" opacity={0} pointerEvents="none">
        <circle r={12} fill={`url(#${id}-torch)`} />
        <circle r={2.2} fill="#FFF1E6" filter={`url(#${id}-glow)`} />
      </g>
      <SparkLayer glow={`${id}-glow`} />
    </SceneFrame>
  )
}
