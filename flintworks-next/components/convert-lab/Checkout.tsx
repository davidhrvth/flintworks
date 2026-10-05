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

// Option 1: a product card beside today's revenue. The buy button leans toward the cursor as if it
// wants to be pressed; a click buys, a coin flies across, revenue rolls up and this hour's bar
// grows. Left alone, a ghost shopper wanders in and buys every couple of seconds (skipped under
// reduced motion, which just shows the day so far).

const PRICE = 49
const BTN = { x: 48, y: 142, w: 166, h: 24 }
const BTN_C = { x: BTN.x + BTN.w / 2, y: BTN.y + BTN.h / 2 }
const COIN_Y = 50
const BARS = [0.22, 0.3, 0.26, 0.38, 0.35, 0.48, 0.44, 0.56, 0.52, 0.66, 0.72, 0.3]
const LAST = BARS.length - 1
const BAR_X0 = 258
const BAR_STEP = 16
const BAR_W = 10
const BAR_BASE = 172
const BAR_MAX = 70
const BAR_GROW = 0.1
const START_ORDERS = 59
const YESTERDAY = 2352
const PAY_DELAY = 0.32
const PAID_S = 0.9
const COIN_S = 0.6
const MAGNET_R = 120
const CURSOR = 'M0 0L0 15.5L4.1 11.6L6.9 17.7L9.4 16.6L6.7 10.6L12 10.6Z'
const STAR = Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5
  const r = i % 2 ? 1.35 : 3.2
  return `${i ? 'L' : 'M'}${r1(Math.cos(a) * r)} ${r1(Math.sin(a) * r)}`
}).join('') + 'Z'

type Coin = { el: SVGGElement; on: boolean; t: number; x0: number; y0: number }
type Floater = { el: SVGTextElement; t: number }

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const money = (n: number) => `€${Math.round(n).toLocaleString('en-US')}`

function setup(api: SceneApi): Scene {
  const { el, all, pointer, autoplay, idle } = api
  const btn = el('btn')
  const body = el('btn-body')
  const halo = el('btn-halo')
  const label = el('btn-label')
  const spin = el('btn-spin')
  const paidEl = el('btn-paid')
  const ripple = el('ripple')
  const ghost = el('ghost')
  const shine = el('shine')
  const revenueG = el('revenue-g')
  const revenue = el<SVGTextElement>('revenue')
  const ordersEl = el('orders')
  const deltaEl = el('delta')
  const bars = all<SVGRectElement>('bar')
  const leavingBar = el<SVGRectElement>('bar-leaving')
  const sparks = new Sparks(api)
  const coins: Coin[] = all<SVGGElement>('coin').map((node) => ({ el: node, on: false, t: 0, x0: 0, y0: 0 }))
  const floaters: Floater[] = all<SVGTextElement>('floater').map((node) => ({ el: node, t: 1 }))

  const offX = new Spring(0, 240, 14)
  const offY = new Spring(0, 240, 14)
  const squash = new Spring(1, 520, 16)
  const pop = new Spring(0, 420, 14)
  let time = 0
  let hover = 0
  let queue: number[] = []
  let paid = 0
  let labelOp = 1
  let spinOp = 0
  let paidOp = 0
  let rippleT = 1
  let rippleX = BTN_C.x
  let rippleY = BTN_C.y
  let orders = START_ORDERS
  let total = orders * PRICE
  let shown = total
  let shownText = ''
  let numEnd = 350
  const heights = [...BARS]
  const grown = [...BARS]
  let slide = 0
  let leaving = 0

  // The ghost shopper alternates between drifting somewhere on the card and going for the button.
  const g = { x: 236, y: 206, fx: 0, fy: 0, tx: 0, ty: 0, t: 1, dur: 0, hold: 0, toButton: false, clicked: true, press: 1, vis: 0 }
  const nextLeg = () => {
    g.fx = g.x
    g.fy = g.y
    g.toButton = !g.toButton
    g.clicked = false
    g.t = 0
    if (g.toButton) {
      g.tx = BTN_C.x + 16 + Math.random() * 40
      g.ty = BTN_C.y - 3 + Math.random() * 6
      g.dur = 0.65
      g.hold = 0.75
    } else {
      g.tx = 110 + Math.random() * 140
      g.ty = 64 + Math.random() * 56
      g.dur = 0.7
      g.hold = 0.3
    }
  }

  const credit = () => {
    total += PRICE
    orders++
    ordersEl.textContent = String(orders)
    deltaEl.textContent = `+${Math.round((total / YESTERDAY - 1) * 100)}%`
    pop.v += 5
    sparks.burst(numEnd + 12, COIN_Y, 12, { speed: 150, life: 0.5 })
    const f = floaters.find((item) => item.t >= 1) ?? floaters[0]
    f.t = 0
    f.el.setAttribute('x', String(r1(numEnd + 14)))
    // A full bar means the hour is over: everything slides left and a new hour starts.
    if (heights[LAST] >= 1) {
      leaving = grown[0]
      heights.shift()
      grown.shift()
      heights.push(0)
      grown.push(0)
      slide = 1
    }
    heights[LAST] = Math.min(1, heights[LAST] + BAR_GROW)
  }

  const launch = () => {
    paid = PAID_S
    const c = coins.find((item) => !item.on)
    if (!c) return credit()
    c.on = true
    c.t = 0
    c.x0 = BTN_C.x + offX.x
    c.y0 = BTN_C.y + offY.x - 6
  }

  const buy = (x: number, y: number) => {
    squash.v -= 2.6
    rippleT = 0
    rippleX = x
    rippleY = y
    queue.push(PAY_DELAY)
  }

  return {
    press() {
      buy(pointer.x, pointer.y)
    },
    frame(dt) {
      time += dt

      // Ghost shopper, only while nobody is here.
      const ghostOn = autoplay && idle()
      g.vis += ((ghostOn ? 1 : 0) - g.vis) * approach(dt, 6)
      if (ghostOn) {
        g.t += dt
        if (g.t >= g.dur + g.hold) nextLeg()
        const u = easeInOut(clamp(g.t / Math.max(g.dur, 0.001)))
        g.x = g.fx + (g.tx - g.fx) * u
        g.y = g.fy + (g.ty - g.fy) * u - Math.sin(Math.PI * u) * 12
        if (g.toButton && !g.clicked && g.t >= g.dur + 0.12) {
          g.clicked = true
          g.press = 0
          buy(g.x, g.y)
        }
      }
      g.press = Math.min(1, g.press + dt / 0.25)
      attr(ghost, {
        transform: `translate(${r1(g.x)} ${r1(g.y)}) scale(${(1 - 0.14 * Math.sin(Math.PI * g.press)).toFixed(3)})`,
        opacity: g.vis,
      })

      // The button leans toward whoever is closest to pressing it.
      let tx = 0
      let ty = 0
      let over = 0
      const src = pointer.inside ? pointer : g.vis > 0.5 ? g : null
      if (src) {
        const dx = src.x - BTN_C.x
        const dy = src.y - BTN_C.y
        const f = clamp(1 - Math.hypot(dx / 1.6, dy) / MAGNET_R)
        tx = clamp(dx * 0.1, -10, 10) * f
        ty = clamp(dy * 0.16, -6, 6) * f
        over = Math.abs(dx) < BTN.w / 2 + 6 && Math.abs(dy) < BTN.h / 2 + 6 ? 1 : 0
      }
      hover += (over - hover) * approach(dt, 12)
      const s = squash.step(1, dt)
      attr(btn, {
        transform: `translate(${r1(BTN_C.x + offX.step(tx, dt))} ${r1(BTN_C.y + offY.step(ty, dt))}) scale(${(1 + (s - 1) * 0.6).toFixed(3)} ${s.toFixed(3)})`,
      })
      body.setAttribute('fill', mix(INK.ember, INK.flame, hover * 0.5))
      halo.setAttribute('opacity', (0.22 + 0.08 * Math.sin(time * 2.4) + hover * 0.4).toFixed(3))

      // Buy now → spinner → Paid.
      queue = queue.filter((left) => {
        if (left - dt > 0) return true
        launch()
        return false
      }).map((left) => left - dt)
      paid = Math.max(0, paid - dt)
      const state = paid > 0 ? 2 : queue.length ? 1 : 0
      labelOp += ((state === 0 ? 1 : 0) - labelOp) * approach(dt, 18)
      spinOp += ((state === 1 ? 1 : 0) - spinOp) * approach(dt, 18)
      paidOp += ((state === 2 ? 1 : 0) - paidOp) * approach(dt, 18)
      label.setAttribute('opacity', labelOp.toFixed(3))
      attr(spin, { opacity: spinOp, transform: `rotate(${Math.round((time * 540) % 360)})` })
      paidEl.setAttribute('opacity', paidOp.toFixed(3))

      rippleT = Math.min(1, rippleT + dt / 0.5)
      attr(ripple, {
        cx: r1(rippleX),
        cy: r1(rippleY),
        r: 5 + 24 * easeOutCubic(rippleT),
        opacity: (1 - rippleT) * 0.7,
      })

      for (const c of coins) {
        if (!c.on) continue
        c.t = Math.min(1, c.t + dt / COIN_S)
        const u = c.t * c.t * (3 - 2 * c.t)
        const iu = 1 - u
        const endX = numEnd + 12
        const x = iu * iu * c.x0 + 2 * iu * u * ((c.x0 + endX) / 2) + u * u * endX
        const y = iu * iu * c.y0 + 2 * iu * u * 8 + u * u * COIN_Y
        attr(c.el, { transform: `translate(${r1(x)} ${r1(y)}) scale(${(1 - 0.35 * u).toFixed(3)})`, opacity: 1 })
        if (c.t >= 1) {
          c.on = false
          c.el.setAttribute('opacity', '0')
          credit()
        }
      }

      shown += (total - shown) * approach(dt, 7)
      const text = money(shown)
      if (text !== shownText) {
        revenue.textContent = text
        shownText = text
        numEnd = 256 + revenue.getComputedTextLength()
      }
      revenueG.setAttribute('transform', `translate(256 64) scale(${(1 + pop.step(0, dt) * 0.012).toFixed(4)})`)
      for (const f of floaters) {
        if (f.t >= 1) continue
        f.t = Math.min(1, f.t + dt / 0.9)
        attr(f.el, { y: r1(60 - 20 * easeOutCubic(f.t)), opacity: f.t < 0.5 ? 1 : 2 - 2 * f.t })
      }

      slide = Math.max(0, slide - dt / 0.45)
      const shift = BAR_STEP * easeOutCubic(slide)
      bars.forEach((bar, i) => {
        grown[i] += (heights[i] - grown[i]) * approach(dt, 10)
        const h = Math.max(1, grown[i] * BAR_MAX)
        attr(bar, { x: r1(BAR_X0 + i * BAR_STEP + shift), y: r1(BAR_BASE - h), height: r1(h) })
      })
      const lh = Math.max(1, leaving * BAR_MAX)
      attr(leavingBar, { x: r1(BAR_X0 - BAR_STEP + shift), y: r1(BAR_BASE - lh), height: r1(lh), opacity: slide })

      const tw = Math.max(0, Math.sin(time * 1.7)) ** 6
      attr(shine, { opacity: tw, transform: `translate(152 49) scale(${(0.6 + 0.6 * tw).toFixed(3)})` })
      sparks.frame(dt)
    },
  }
}

export function Checkout() {
  const hostRef = useRef<HTMLDivElement>(null)
  const id = useSvgId()
  useScene(hostRef, setup)

  return (
    <SceneFrame hostRef={hostRef} cursor="cursor-pointer">
      <defs>
        <Glow id={`${id}-glow`} />
        <filter id={`${id}-soft`} x="-50%" y="-100%" width="200%" height="300%">
          <feGaussianBlur stdDeviation={7} />
        </filter>
        <linearGradient id={`${id}-gem`} x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor={INK.hot} />
          <stop offset={0.35} stopColor={INK.ember} />
          <stop offset={1} stopColor={INK.deep} />
        </linearGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset={0} stopColor={INK.ember} stopOpacity={0.35} />
          <stop offset={1} stopColor={INK.ember} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Product card */}
      <rect x={36} y={22} width={190} height={156} rx={12} fill="#111114" stroke={INK.line} />
      <rect x={48} y={34} width={166} height={64} rx={8} fill="#16161B" />
      <circle cx={131} cy={66} r={36} fill={`url(#${id}-halo)`} />
      <g transform="translate(131 67)">
        <path d="M-24 -5L-12 -18H12L24 -5L0 20Z" fill={`url(#${id}-gem)`} />
        <path
          d="M-24 -5H24M-12 -18L-5 -5L0 20L5 -5L12 -18M-5 -5L0 -18L5 -5"
          fill="none"
          stroke="#FFD2B0"
          strokeOpacity={0.45}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      </g>
      <path data-k="shine" d={STAR} fill="#FFF1E3" opacity={0} filter={`url(#${id}-glow)`} />
      <text x={48} y={116} fontSize={11} fontWeight={600} fill={INK.heading} className="font-sans">
        Your product
      </text>
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={STAR} transform={`translate(${178 + i * 8} 112.5)`} fill={INK.flame} />
      ))}
      <text x={48} y={132} fontSize={12} fontWeight={700} fill={INK.flame} className="font-display">
        €{PRICE}
      </text>
      <text x={214} y={132} textAnchor="end" fontSize={8.5} fill={INK.muted} className="font-sans">
        Free delivery
      </text>

      <circle data-k="ripple" r={5} fill="none" stroke={INK.flame} strokeWidth={1.5} opacity={0} />
      <g data-k="btn" transform={`translate(${BTN_C.x} ${BTN_C.y})`}>
        <rect
          data-k="btn-halo"
          x={-BTN.w / 2 - 4}
          y={-BTN.h / 2 - 3}
          width={BTN.w + 8}
          height={BTN.h + 6}
          rx={15}
          fill={INK.ember}
          opacity={0.22}
          filter={`url(#${id}-soft)`}
        />
        <rect data-k="btn-body" x={-BTN.w / 2} y={-BTN.h / 2} width={BTN.w} height={BTN.h} rx={BTN.h / 2} fill={INK.ember} />
        <text data-k="btn-label" y={3.7} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={INK.white} className="font-sans">
          Buy now
        </text>
        <g data-k="btn-spin" opacity={0}>
          <path d="M0 -5A5 5 0 1 1 -5 0" fill="none" stroke={INK.white} strokeWidth={1.6} strokeLinecap="round" />
        </g>
        <g data-k="btn-paid" opacity={0}>
          <path d="M-17 0.5l3 3 6-6.5" fill="none" stroke={INK.white} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
          <text x={-3} y={3.7} fontSize={10.5} fontWeight={700} fill={INK.white} className="font-sans">
            Paid
          </text>
        </g>
      </g>

      {/* Today's numbers */}
      <text x={256} y={34} fontSize={8.5} letterSpacing={1.4} fill={INK.muted} className="font-mono">
        REVENUE TODAY
      </text>
      <g data-k="revenue-g" transform="translate(256 64)">
        <text data-k="revenue" fontSize={27} fontWeight={700} fill={INK.heading} className="font-display">
          {money(START_ORDERS * PRICE)}
        </text>
      </g>
      <text x={256} y={86} fontSize={9.5} fill={INK.muted} className="font-sans">
        <tspan data-k="orders" fill={INK.body} fontWeight={600}>
          {START_ORDERS}
        </tspan>{' '}
        orders ·{' '}
        <tspan data-k="delta" fill={INK.flame} fontWeight={600}>
          +{Math.round(((START_ORDERS * PRICE) / YESTERDAY - 1) * 100)}%
        </tspan>{' '}
        vs yesterday
      </text>
      {Array.from({ length: 3 }, (_, i) => (
        <text key={i} data-k="floater" x={370} y={60} fontSize={11} fontWeight={700} fill={INK.flame} opacity={0} className="font-sans">
          +€{PRICE}
        </text>
      ))}

      <line x1={250} x2={452} y1={BAR_BASE + 0.5} y2={BAR_BASE + 0.5} stroke={INK.line} />
      <rect data-k="bar-leaving" x={BAR_X0 - BAR_STEP} width={BAR_W} rx={2} fill="#2A2A33" opacity={0} />
      {BARS.map((h, i) => (
        <rect
          key={i}
          data-k="bar"
          x={BAR_X0 + i * BAR_STEP}
          y={BAR_BASE - h * BAR_MAX}
          width={BAR_W}
          height={h * BAR_MAX}
          rx={2}
          fill={i === LAST ? INK.ember : '#2A2A33'}
          filter={i === LAST ? `url(#${id}-glow)` : undefined}
        />
      ))}
      <text x={BAR_X0 + LAST * BAR_STEP + BAR_W / 2} y={185} textAnchor="middle" fontSize={7.5} letterSpacing={1} fill={INK.flame} className="font-mono">
        NOW
      </text>

      {Array.from({ length: 6 }, (_, i) => (
        <g key={i} data-k="coin" opacity={0}>
          <circle r={7} fill={INK.ember} stroke={INK.hot} strokeWidth={1} filter={`url(#${id}-glow)`} />
          <text y={3} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={INK.white} className="font-sans">
            €
          </text>
        </g>
      ))}
      <SparkLayer glow={`${id}-glow`} />
      <g data-k="ghost" opacity={0}>
        <path d={CURSOR} fill={INK.heading} stroke="#0A0A0B" strokeWidth={1.2} strokeLinejoin="round" />
      </g>
    </SceneFrame>
  )
}
