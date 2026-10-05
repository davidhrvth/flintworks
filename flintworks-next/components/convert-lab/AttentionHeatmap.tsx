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

// Option 4: a wireframe landing page under a heatmap, like the session tools marketers use. The
// cursor leaves heat wherever it goes, and all of it slowly drifts into the call to action, so the
// button is always the hottest thing on the page. A click on the button is a sign-up. Left alone,
// a simulated visitor's gaze scans the page in an F-pattern, ends on the button and clicks
// (skipped under reduced motion, which shows a settled heatmap).
//
// Heat lives on a coarse grid. Cells are drawn as soft white dots, bucketed by heat into a few
// paths, then one SVG filter blurs them and maps the result onto an ember colour ramp.

const PAGE = { x: 24, y: 12, w: 432, h: 176 }
const BODY_Y = 32
const CELL = 8
const COLS = Math.ceil(PAGE.w / CELL)
const ROWS = Math.ceil((PAGE.y + PAGE.h - BODY_Y) / CELL)
const CTA = { x: 40, y: 134, w: 88, h: 24 }
const CTA_C = { x: CTA.x + CTA.w / 2, y: CTA.y + CTA.h / 2 }
const STEPS = [0.035, 0.08, 0.15, 0.25, 0.4, 0.6, 0.85]
const OPACITY = [0.1, 0.18, 0.28, 0.42, 0.58, 0.76, 0.95]
const DECAY = 0.45
const REST_CHARGE = 0.35
const START_SIGNUPS = 12
// Where a first-time visitor's eyes go: logo, nav, headline, subhead, image, then the button.
const GAZE = [
  { x: 54, y: 44, dwell: 0.35 },
  { x: 330, y: 44, dwell: 0.2 },
  { x: 52, y: 72, dwell: 0.3 },
  { x: 196, y: 72, dwell: 0.2 },
  { x: 52, y: 90, dwell: 0.25 },
  { x: 160, y: 90, dwell: 0.15 },
  { x: 70, y: 110, dwell: 0.2 },
  { x: 340, y: 104, dwell: 0.45 },
  { x: CTA_C.x + 6, y: CTA_C.y, dwell: 0.8 },
]
// Heat ramp for the filter tables: dark maroon → ember → flame → white-hot.
const RAMP_R = '0.23 0.64 1 1 1 1'
const RAMP_G = '0.06 0.23 0.3 0.55 0.77 0.95'
const RAMP_B = '0.02 0.06 0 0.26 0.56 0.89'
const RAMP_A = '0 0.55 0.8 0.9 0.95 1'

type Mote = { x: number; y: number; vx: number; vy: number; age: number; life: number }

const inCta = (x: number, y: number, pad = 0) =>
  x > CTA.x - pad && x < CTA.x + CTA.w + pad && y > CTA.y - pad && y < CTA.y + CTA.h + pad

function setup(api: SceneApi): Scene {
  const { el, all, pointer, autoplay, idle } = api
  const layers = all('heat')
  const cta = el('cta')
  const ctaFill = el('cta-fill')
  const ctaGlow = el('cta-glow')
  const ripple = el('ripple')
  const gazeEl = el('gaze')
  const rec = el('rec')
  const signupsEl = el('signups')
  const shareEl = el('share')
  const sparks = new Sparks(api)

  const heat = new Float32Array(COLS * ROWS)
  const motes: Mote[] = []
  const squash = new Spring(1, 520, 16)
  let charge = REST_CHARGE
  let signups = START_SIGNUPS
  let share = 0.6
  let shareText = ''
  let time = 0
  let emit = 0
  let lastX = NaN
  let lastY = NaN
  let rippleT = 1
  let rippleX = 0
  let rippleY = 0

  const gaze = { x: GAZE[0].x, y: GAZE[0].y, fx: GAZE[0].x, fy: GAZE[0].y, i: 0, t: 0, dur: 0.01, vis: 0 }

  const deposit = (x: number, y: number, amount: number) => {
    const gx = (x - PAGE.x) / CELL - 0.5
    const gy = (y - BODY_Y) / CELL - 0.5
    const i = Math.floor(gx)
    const j = Math.floor(gy)
    const fx = gx - i
    const fy = gy - j
    const add = (ci: number, cj: number, w: number) => {
      if (ci < 0 || cj < 0 || ci >= COLS || cj >= ROWS) return
      const k = cj * COLS + ci
      heat[k] = Math.min(1.4, heat[k] + amount * w)
    }
    add(i, j, (1 - fx) * (1 - fy))
    add(i + 1, j, fx * (1 - fy))
    add(i, j + 1, (1 - fx) * fy)
    add(i + 1, j + 1, fx * fy)
  }
  const spawn = (x: number, y: number, speed = 16) => {
    if (motes.length > 260) return
    const a = Math.random() * Math.PI * 2
    motes.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, age: 0, life: 2.2 + Math.random() * 1.2 })
  }
  const convert = () => {
    signups++
    signupsEl.textContent = String(signups)
    charge = Math.min(1.6, charge + 0.5)
    squash.v -= 2.4
    sparks.burst(CTA_C.x, CTA.y, 18, { speed: 170, life: 0.55 })
  }
  const click = (x: number, y: number) => {
    rippleT = 0
    rippleX = x
    rippleY = y
    for (let i = 0; i < 12; i++) spawn(x, y, 40 + Math.random() * 40)
    if (inCta(x, y, 4)) convert()
  }

  const step = (dt: number) => {
    // Motes wander where they were dropped, then get pulled harder and harder toward the button.
    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i]
      m.age += dt
      const k = m.age / m.life
      const dx = CTA_C.x - m.x
      const dy = CTA_C.y - m.y
      const d = Math.hypot(dx, dy) || 1
      const pull = 20 + 700 * k * k
      m.vx += ((dx / d) * pull - m.vx * 2.4) * dt
      m.vy += ((dy / d) * pull - m.vy * 2.4) * dt
      m.x += m.vx * dt
      m.y += m.vy * dt
      // Heat builds where attention rests; a mote in flight only leaves a faint trail.
      deposit(m.x, m.y, (dt * 1.3 * (1 - 0.5 * k)) / (1 + Math.hypot(m.vx, m.vy) / 30))
      if (inCta(m.x, m.y)) {
        deposit(m.x, m.y, 0.04)
        charge = Math.min(1.6, charge + 0.012)
        motes.splice(i, 1)
      } else if (m.age > m.life) motes.splice(i, 1)
    }
    charge += (REST_CHARGE - charge) * approach(dt, 0.5)
    for (let n = 0; n < 5; n++) {
      deposit(CTA.x + 10 + Math.random() * (CTA.w - 20), CTA.y + 4 + Math.random() * (CTA.h - 8), dt * charge * 3)
    }
    const keep = Math.exp(-dt * DECAY)
    for (let k = 0; k < heat.length; k++) heat[k] *= keep
  }

  if (!autoplay) {
    // Settle a plausible map: a scan across the page that ends in the button.
    for (const g of GAZE) for (let n = 0; n < 14; n++) spawn(g.x + (Math.random() - 0.5) * 16, g.y + (Math.random() - 0.5) * 8)
    for (let n = 0; n < 150; n++) step(1 / 60)
  }

  return {
    press() {
      click(pointer.x, pointer.y)
    },
    frame(dt) {
      time += dt

      if (pointer.inside) {
        if (!Number.isNaN(lastX)) emit += Math.hypot(pointer.x - lastX, pointer.y - lastY) / 5
        emit += dt * 8
        lastX = pointer.x
        lastY = pointer.y
        while (emit >= 1) {
          emit--
          spawn(pointer.x, pointer.y)
        }
      } else lastX = NaN

      // Simulated visitor: saccade to the next fixation, dwell there, click the button, repeat.
      const gazing = autoplay && idle()
      gaze.vis += ((gazing ? 1 : 0) - gaze.vis) * approach(dt, 6)
      if (gazing) {
        gaze.t += dt
        const target = GAZE[gaze.i]
        const u = easeOutCubic(clamp(gaze.t / gaze.dur))
        gaze.x = gaze.fx + (target.x - gaze.fx) * u
        gaze.y = gaze.fy + (target.y - gaze.fy) * u
        emit += dt * (u >= 1 ? 45 : 4)
        while (emit >= 1) {
          emit--
          spawn(gaze.x + (Math.random() - 0.5) * 10, gaze.y + (Math.random() - 0.5) * 6)
        }
        if (gaze.t > gaze.dur + target.dwell) {
          if (gaze.i === GAZE.length - 1) click(gaze.x, gaze.y)
          gaze.fx = gaze.x
          gaze.fy = gaze.y
          gaze.i = (gaze.i + 1) % GAZE.length
          const next = GAZE[gaze.i]
          gaze.dur = 0.12 + Math.hypot(next.x - gaze.x, next.y - gaze.y) / 900
          gaze.t = 0
        }
      }
      attr(gazeEl, { transform: `translate(${r1(gaze.x)} ${r1(gaze.y)})`, opacity: gaze.vis * 0.9 })

      if (autoplay || pointer.inside) step(dt)

      // Bucket the grid into soft dots; the filter turns them into a heatmap.
      const paths = STEPS.map(() => '')
      let total = 0
      let near = 0
      for (let j = 0; j < ROWS; j++) {
        for (let i = 0; i < COLS; i++) {
          const h = heat[j * COLS + i]
          total += h
          const x = PAGE.x + (i + 0.5) * CELL
          const y = BODY_Y + (j + 0.5) * CELL
          if (inCta(x, y, 10)) near += h
          if (h < STEPS[0]) continue
          let q = 0
          while (q < STEPS.length - 1 && h >= STEPS[q + 1]) q++
          paths[q] += `M${x} ${y}h0`
        }
      }
      layers.forEach((layer, q) => layer.setAttribute('d', paths[q]))

      share += ((total > 0.5 ? near / total : share) - share) * approach(dt, 2)
      const text = `${Math.round(share * 100)}%`
      if (text !== shareText) {
        shareEl.textContent = text
        shareText = text
      }

      const c = clamp(charge)
      const s = squash.step(1, dt)
      attr(cta, { transform: `translate(${CTA_C.x} ${CTA_C.y}) scale(${(1 + (s - 1) * 0.6).toFixed(3)} ${s.toFixed(3)})` })
      attr(ctaFill, { 'fill-opacity': 0.2 + 0.8 * c, fill: mix(INK.ember, INK.flame, clamp(charge - 1)) })
      ctaGlow.setAttribute('opacity', (0.15 + 0.5 * c).toFixed(3))

      rippleT = Math.min(1, rippleT + dt / 0.55)
      attr(ripple, { cx: r1(rippleX), cy: r1(rippleY), r: 3 + 18 * easeOutCubic(rippleT), opacity: (1 - rippleT) * 0.8 })
      rec.setAttribute('opacity', (0.45 + 0.55 * (Math.sin(time * 4) > 0 ? 1 : 0)).toFixed(2))
      sparks.frame(dt)
    },
  }
}

export function AttentionHeatmap() {
  const hostRef = useRef<HTMLDivElement>(null)
  const id = useSvgId()
  useScene(hostRef, setup)
  const wire = '#24242C'
  const faint = '#1C1C22'

  return (
    <SceneFrame hostRef={hostRef} cursor="cursor-crosshair">
      <defs>
        <Glow id={`${id}-glow`} />
        <clipPath id={`${id}-page`}>
          <rect x={PAGE.x} y={BODY_Y} width={PAGE.w} height={PAGE.y + PAGE.h - BODY_Y} rx={2} />
        </clipPath>
        <filter
          id={`${id}-heat`}
          filterUnits="userSpaceOnUse"
          x={PAGE.x}
          y={BODY_Y}
          width={PAGE.w}
          height={PAGE.y + PAGE.h - BODY_Y}
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation={6} />
          <feColorMatrix type="matrix" values="0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues={RAMP_R} />
            <feFuncG type="table" tableValues={RAMP_G} />
            <feFuncB type="table" tableValues={RAMP_B} />
            <feFuncA type="table" tableValues={RAMP_A} />
          </feComponentTransfer>
        </filter>
        <filter id={`${id}-soft`} x="-50%" y="-100%" width="200%" height="300%">
          <feGaussianBlur stdDeviation={6} />
        </filter>
      </defs>

      {/* Browser window and a wireframe landing page */}
      <rect x={PAGE.x} y={PAGE.y} width={PAGE.w} height={PAGE.h} rx={10} fill="#0E0E11" stroke={INK.line} />
      <line x1={PAGE.x} x2={PAGE.x + PAGE.w} y1={BODY_Y} y2={BODY_Y} stroke={INK.line} />
      {[38, 48, 58].map((x) => (
        <circle key={x} cx={x} cy={22} r={2.8} fill="#2E2E38" />
      ))}
      <rect x={170} y={16.5} width={140} height={11} rx={5.5} fill="#16161B" />
      <text x={240} y={24.6} textAnchor="middle" fontSize={7} fill={INK.muted} className="font-mono">
        yourbrand.com
      </text>
      <circle data-k="rec" cx={372} cy={22} r={2.4} fill={INK.ember} />
      <text x={446} y={24.6} textAnchor="end" fontSize={7} letterSpacing={0.8} fill={INK.muted} className="font-mono">
        SIGN-UPS{' '}
        <tspan data-k="signups" fill={INK.flame} fontWeight={700}>
          {START_SIGNUPS}
        </tspan>
      </text>

      <rect x={40} y={40} width={28} height={8} rx={2} fill={wire} />
      {[300, 328, 356].map((x) => (
        <rect key={x} x={x} y={42} width={20} height={4} rx={2} fill={faint} />
      ))}
      <rect x={392} y={38} width={48} height={12} rx={6} fill="none" stroke={wire} />
      <rect x={40} y={66} width={172} height={12} rx={3} fill={wire} />
      <rect x={40} y={84} width={128} height={12} rx={3} fill={wire} />
      <rect x={40} y={106} width={160} height={5} rx={2.5} fill={faint} />
      <rect x={40} y={116} width={138} height={5} rx={2.5} fill={faint} />
      <rect x={262} y={60} width={178} height={100} rx={8} fill="#121216" stroke={faint} />
      <path d="M282 146L322 104L346 126L370 98L420 146Z" fill={faint} />
      <circle cx={404} cy={82} r={8} fill={faint} />
      <rect x={40} y={170} width={72} height={4} rx={2} fill={faint} />
      <rect x={124} y={170} width={56} height={4} rx={2} fill={faint} />

      <g clipPath={`url(#${id}-page)`}>
        <g filter={`url(#${id}-heat)`} opacity={0.8} fill="none" stroke={INK.white} strokeWidth={14} strokeLinecap="round">
          {OPACITY.map((o) => (
            <path key={o} data-k="heat" strokeOpacity={o} />
          ))}
        </g>
      </g>

      <g data-k="cta" transform={`translate(${CTA_C.x} ${CTA_C.y})`}>
        <rect
          data-k="cta-glow"
          x={-CTA.w / 2 - 4}
          y={-CTA.h / 2 - 3}
          width={CTA.w + 8}
          height={CTA.h + 6}
          rx={15}
          fill={INK.ember}
          opacity={0.3}
          filter={`url(#${id}-soft)`}
        />
        <rect
          data-k="cta-fill"
          x={-CTA.w / 2}
          y={-CTA.h / 2}
          width={CTA.w}
          height={CTA.h}
          rx={CTA.h / 2}
          fill={INK.ember}
          fillOpacity={0.4}
          stroke={INK.ember}
        />
        <text y={3.4} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={INK.white} className="font-sans">
          Get started
        </text>
      </g>

      <g transform={`translate(${CTA.x + CTA.w + 8} ${CTA_C.y})`}>
        <rect y={-8} width={78} height={16} rx={8} fill="#0E0E11" fillOpacity={0.85} stroke={INK.ember} strokeOpacity={0.5} />
        <text x={39} y={2.8} textAnchor="middle" fontSize={7.5} letterSpacing={0.6} fill={INK.muted} className="font-mono">
          <tspan data-k="share" fill={INK.flame} fontWeight={700}>
            60%
          </tspan>{' '}
          OF GAZE
        </text>
      </g>

      <circle data-k="ripple" r={3} fill="none" stroke={INK.hot} strokeWidth={1.5} opacity={0} />
      <g data-k="gaze" opacity={0}>
        <circle r={7} fill="none" stroke={INK.heading} strokeOpacity={0.7} strokeWidth={1} />
        <circle r={1.6} fill={INK.heading} />
      </g>
      <SparkLayer glow={`${id}-glow`} />
    </SceneFrame>
  )
}
