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
  scribbleLoop,
  SparkLayer,
  Sparks,
  Spring,
  useScene,
  useSvgId,
  type Scene,
  type SceneApi,
} from './scene'

// Option 3: a wall calendar with the launch date circled. Days get crossed off one by one while
// the tear-off pad beside it loses a page per day; when the circled date comes up an "ON TIME"
// stamp slams onto the pad. Clicking the pad tears off a day; clicking a date skips ahead to it
// (or back, un-crossing the days). Left alone it counts down, stamps, holds, and starts over.

const START = 2
const DUE = 26
const GX = 49
const GY = 72
const CW = 33
const CH = 25
const PAD = { x: 318, y: 46, w: 130, h: 134 }
const PAD_CX = PAD.x + PAD.w / 2
const STAMP_Y = 108
const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const DAYS = Array.from({ length: 28 }, (_, i) => i + 1)
const CROSSABLE = DAYS.filter((d) => d >= START && d < DUE)

const cellX = (d: number) => GX + CW / 2 + ((d - 1) % 7) * CW
const cellY = (d: number) => GY + CH / 2 + Math.floor((d - 1) / 7) * CH
const cellAt = (x: number, y: number) => {
  const c = Math.floor((x - GX) / CW)
  const r = Math.floor((y - GY) / CH)
  return c >= 0 && c < 7 && r >= 0 && r < 4 ? r * 7 + c + 1 : 0
}
const inPad = (x: number, y: number) =>
  x >= PAD.x - 4 && x <= PAD.x + PAD.w + 4 && y >= PAD.y - 20 && y <= PAD.y + PAD.h + 4
const dayColor = (d: number) => (d < START ? '#3A3A45' : (d - 1) % 7 >= 5 ? INK.muted : INK.body)

const DUE_LOOP = scribbleLoop(cellX(DUE), cellY(DUE) - 1, 15, 11.5)

function setup(api: SceneApi): Scene {
  const { el, all, svg, pointer, autoplay, idle } = api
  const rig = el('rig')
  const dayText = all('day')
  const xa = all('xa')
  const xb = all('xb')
  const today = el('today')
  const hover = el('hover')
  const dueLoop = el('due-loop')
  const page = el('page')
  const flap = el('flap')
  const num = el('num')
  const weekday = el('weekday')
  const stampEl = el('stamp')
  const falls = all<SVGGElement>('fall').map((g) => ({ g, num: g.querySelector('text')!, t: 1, tear: true }))
  const sparks = new Sparks(api)

  let day = autoplay ? START : DUE
  let goal = day
  let autoGoal = false
  let wait = 0.6
  let phase: 'run' | 'hold' | 'reset' = 'run'
  let timer = 0
  let time = 0
  let loopDraw = autoplay ? 0 : 1
  let shake = 0
  let curl = 0
  let hoverA = 0
  let cursor = ''
  let fallNext = 0
  const xl = CROSSABLE.map((): number => (autoplay ? 0 : 1))
  const stamp = { on: !autoplay, t: autoplay ? 0 : 1, alpha: autoplay ? 0 : 1 }
  const todayX = new Spring(cellX(day), 170)
  const todayY = new Spring(cellY(day), 170)

  const paintPad = () => {
    num.textContent = String(day)
    num.setAttribute('fill', day === DUE ? '#3A3A45' : INK.heading)
    weekday.textContent = day === DUE ? 'LAUNCH DAY' : WEEKDAYS[(day - 1) % 7]
    weekday.setAttribute('fill', day === DUE ? INK.flame : INK.muted)
  }
  const paintCross = (i: number) => {
    xa[i].setAttribute('stroke-dashoffset', (1 - clamp(xl[i] * 2)).toFixed(3))
    xb[i].setAttribute('stroke-dashoffset', (1 - clamp(xl[i] * 2 - 1)).toFixed(3))
    dayText[CROSSABLE[i] - 1].setAttribute('fill', mix(dayColor(CROSSABLE[i]), '#4A4A56', xl[i]))
  }
  // Single steps tear the page off and let it fall; fast runs flip pages up over the binding instead,
  // so a quick countdown doesn't bury the pad under falling paper.
  const advance = (tear: boolean) => {
    const f = falls[fallNext]
    fallNext = (fallNext + 1) % falls.length
    f.num.textContent = String(day)
    f.t = 0
    f.tear = tear
    day += 1
    paintPad()
  }
  const rewind = (d: number) => {
    day = d
    goal = d
    paintPad()
  }
  paintPad()
  xl.forEach((_, i) => paintCross(i))
  dueLoop.setAttribute('stroke-dashoffset', String(1 - loopDraw))

  return {
    press() {
      const { x, y } = pointer
      autoGoal = false
      if (inPad(x, y)) {
        if (day === DUE) stamp.t = 0
        else {
          goal = Math.min(DUE, Math.max(goal, day) + 1)
          wait = 0
        }
        return
      }
      const c = cellAt(x, y)
      if (!c) return
      if (c > day) {
        goal = Math.min(DUE, c)
        wait = 0
      } else {
        rewind(Math.max(START, c))
      }
    },
    frame(dt) {
      time += dt
      const overPad = pointer.inside && inPad(pointer.x, pointer.y)
      const cell = pointer.inside && !overPad ? cellAt(pointer.x, pointer.y) : 0

      if (pointer.inside) {
        // Hand control to the visitor: stop the countdown where it is.
        if (autoGoal) goal = day
        autoGoal = false
        phase = 'run'
        timer = 0
      } else if (autoplay && idle()) {
        timer += dt
        if (phase === 'run') {
          goal = DUE
          autoGoal = true
          if (day === DUE && stamp.t >= 1) {
            phase = 'hold'
            timer = 0
          }
        } else if (phase === 'hold' && timer > 2.8) {
          phase = 'reset'
          timer = 0
          rewind(START)
        } else if (phase === 'reset' && timer > 1.1) {
          phase = 'run'
          wait = 0.3
        }
      }

      if (day < goal) {
        wait -= dt
        if (wait <= 0) {
          const user = pointer.inside || !idle()
          advance(user ? goal - day === 1 : DUE - day <= 3)
          const left = DUE - day
          wait = user ? 0.12 : left <= 1 ? 0.6 : left <= 3 ? 0.34 : 0.15
        }
      } else {
        wait = Math.max(wait, 0.25)
      }

      // Stamp slams in when the due date comes up, then sits there until the date changes.
      if (day === DUE && !stamp.on) {
        stamp.on = true
        stamp.t = 0
      } else if (day !== DUE) {
        stamp.on = false
      }
      if (stamp.on) {
        const before = stamp.t
        stamp.t = Math.min(1, stamp.t + dt / 0.2)
        stamp.alpha = Math.min(1, stamp.t * 3)
        if (before < 1 && stamp.t >= 1) {
          shake = 1
          sparks.burst(PAD_CX, STAMP_Y, 34, { speed: 210 })
          sparks.burst(cellX(DUE), cellY(DUE), 12, { speed: 110 })
        }
      } else {
        stamp.alpha = Math.max(0, stamp.alpha - dt / 0.3)
      }
      const scale = stamp.on ? 2.3 - 1.3 * stamp.t * stamp.t : 1
      attr(stampEl, {
        opacity: stamp.alpha,
        transform: `translate(${PAD_CX} ${STAMP_Y}) rotate(-13) scale(${scale.toFixed(3)})`,
      })

      shake *= Math.exp(-dt * 7)
      rig.setAttribute(
        'transform',
        `translate(${r1(Math.sin(time * 63) * 2.4 * shake)} ${r1(Math.cos(time * 51) * 1.6 * shake)})`,
      )

      xl.forEach((prev, i) => {
        const next = CROSSABLE[i] < day ? Math.min(1, prev + dt / 0.2) : Math.max(0, prev - dt / 0.25)
        if (next === prev) return
        xl[i] = next
        paintCross(i)
      })

      if (loopDraw < 1) {
        loopDraw = Math.min(1, loopDraw + dt / 0.8)
        dueLoop.setAttribute('stroke-dashoffset', (1 - easeOutCubic(loopDraw)).toFixed(3))
      }
      dueLoop.setAttribute('stroke-width', (1.8 + 1.6 * shake).toFixed(2))

      attr(today, {
        x: todayX.step(cellX(day), dt) - 13.5,
        y: todayY.step(cellY(day), dt) - 10.5,
      })
      hoverA += ((cell ? 1 : 0) - hoverA) * approach(dt, 16)
      if (cell) attr(hover, { x: cellX(cell) - 13.5, y: cellY(cell) - 10.5 })
      hover.setAttribute('opacity', hoverA.toFixed(3))

      curl += ((overPad ? 14 : 0) - curl) * approach(dt, 14)
      const cx = PAD.x + PAD.w
      const cy = PAD.y + PAD.h
      const s = r1(curl)
      page.setAttribute('d', `M${PAD.x} ${PAD.y}H${cx}V${cy - s}L${cx - s} ${cy}H${PAD.x}Z`)
      flap.setAttribute('d', `M${cx - s} ${cy}L${cx} ${cy - s}L${cx - s} ${cy - s}Z`)

      const want = overPad || cell ? 'pointer' : ''
      if (want !== cursor) {
        cursor = want
        svg.style.cursor = want
      }

      for (const f of falls) {
        if (f.t >= 1) continue
        f.t = Math.min(1, f.t + dt / (f.tear ? 0.6 : 0.16))
        const e = f.t
        attr(
          f.g,
          f.tear
            ? {
                opacity: 1 - e,
                transform: `translate(${r1(20 * e)} ${r1(30 * e + 190 * e * e)}) rotate(${r1(28 * easeOutCubic(e))} ${PAD.x} ${PAD.y})`,
              }
            : {
                opacity: 1 - e * 0.6,
                transform: `translate(0 ${PAD.y}) scale(1 ${(1 - e).toFixed(3)}) translate(0 ${-PAD.y})`,
              },
        )
      }
      sparks.frame(dt)
    },
  }
}

export function CalendarStamp() {
  const hostRef = useRef<HTMLDivElement>(null)
  const id = useSvgId()
  useScene(hostRef, setup)

  return (
    <SceneFrame hostRef={hostRef} cursor="cursor-default">
      <defs>
        <Glow id={`${id}-glow`} />
      </defs>
      <g data-k="rig">
        {/* Month */}
        <rect x={34} y={20} width={262} height={166} rx={8} fill="#141419" stroke="#26262E" />
        {[84, 240].map((x) => (
          <rect key={x} x={x} y={13} width={6} height={15} rx={3} fill="#2A2A33" stroke="#3A3A45" />
        ))}
        <text x={52} y={45} fontSize={13} fontWeight={700} letterSpacing={1.5} fill={INK.heading} className="font-display">
          FEBRUARY
        </text>
        <text x={278} y={45} textAnchor="end" fontSize={9} letterSpacing={1} fill={INK.muted} className="font-mono">
          2027
        </text>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((w, i) => (
          <text
            key={i}
            x={GX + CW / 2 + i * CW}
            y={64}
            textAnchor="middle"
            fontSize={8}
            fill={INK.muted}
            className="font-mono"
          >
            {w}
          </text>
        ))}
        <rect
          data-k="today"
          width={27}
          height={21}
          rx={5}
          fill={INK.ember}
          fillOpacity={0.12}
          stroke={INK.ember}
          strokeOpacity={0.55}
        />
        <rect data-k="hover" width={27} height={21} rx={5} fill="none" stroke={INK.edge} opacity={0} />
        {DAYS.map((d) => (
          <text
            key={d}
            data-k="day"
            x={cellX(d)}
            y={cellY(d) + 3.8}
            textAnchor="middle"
            fontSize={11}
            fontWeight={d === DUE ? 700 : 400}
            fill={dayColor(d)}
            className="font-sans"
          >
            {d}
          </text>
        ))}
        <g fill="none" stroke={INK.deep} strokeWidth={1.7} strokeLinecap="round">
          {CROSSABLE.map((d) => (
            <g key={d}>
              <path
                data-k="xa"
                d={`M${cellX(d) - 6} ${cellY(d) - 6}L${cellX(d) + 6} ${cellY(d) + 6}`}
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1}
              />
              <path
                data-k="xb"
                d={`M${cellX(d) + 6} ${cellY(d) - 6}L${cellX(d) - 6} ${cellY(d) + 6}`}
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1}
              />
            </g>
          ))}
        </g>
        <path
          data-k="due-loop"
          d={DUE_LOOP}
          fill="none"
          stroke={INK.ember}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1}
          filter={`url(#${id}-glow)`}
        />

        {/* Tear-off pad */}
        <rect x={PAD.x} y={PAD.y} width={PAD.w} height={PAD.h + 6} rx={2} fill="#101014" stroke="#24242B" />
        <rect x={PAD.x} y={PAD.y} width={PAD.w} height={PAD.h + 3} rx={2} fill="#131317" stroke="#24242B" />
        <path data-k="page" fill="#18181D" stroke="#2C2C35" strokeLinejoin="round" />
        <path data-k="flap" fill="#26262E" stroke="#34343E" strokeLinejoin="round" />
        <text
          data-k="num"
          x={PAD_CX}
          y={128}
          textAnchor="middle"
          fontSize={60}
          fontWeight={700}
          fill={INK.heading}
          className="font-display"
        />
        <text
          data-k="weekday"
          x={PAD_CX}
          y={156}
          textAnchor="middle"
          fontSize={9}
          letterSpacing={2}
          fill={INK.muted}
          className="font-mono"
        />
        {[0, 1, 2].map((i) => (
          <g key={i} data-k="fall" opacity={0}>
            <rect x={PAD.x} y={PAD.y} width={PAD.w} height={PAD.h} fill="#18181D" stroke="#2C2C35" />
            <text
              x={PAD_CX}
              y={128}
              textAnchor="middle"
              fontSize={60}
              fontWeight={700}
              fill={INK.heading}
              className="font-display"
            />
          </g>
        ))}
        <rect x={PAD.x - 4} y={PAD.y - 20} width={PAD.w + 8} height={20} rx={4} fill={INK.ember} />
        <text
          x={PAD_CX}
          y={PAD.y - 6.5}
          textAnchor="middle"
          fontSize={9}
          fontWeight={700}
          letterSpacing={2}
          fill={INK.white}
          className="font-mono"
        >
          FEB
        </text>

        <g data-k="stamp" opacity={0}>
          <rect
            x={-62}
            y={-17}
            width={124}
            height={34}
            rx={5}
            fill={INK.ember}
            fillOpacity={0.1}
            stroke={INK.ember}
            strokeWidth={2.6}
          />
          <text
            y={5.5}
            textAnchor="middle"
            fontSize={15}
            fontWeight={800}
            letterSpacing={1}
            fill={INK.ember}
            className="font-display"
          >
            ON TIME
          </text>
        </g>
      </g>
      <SparkLayer glow={`${id}-glow`} />
    </SceneFrame>
  )
}
