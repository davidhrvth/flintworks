/**
 * Builds the Flintworks business cards (../brand-kit/business-card) from the brand-kit logo files:
 * a personal card, and a company card that lists the services, in the site's dark look and in the
 * logo lab's all-orange ember theme.
 *
 *   npx tsx scripts/build-business-card.ts
 *
 * Needs Google Chrome on this machine and a network connection (the type comes from Google Fonts).
 * Edit PERSON, COMPANY and BACK_TEXT below and re-run: the printed details and the QR codes are built from them.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import qrcode from 'qrcode-generator'
import { FACETS } from '../components/logo-lab/knapped'
import { launchChrome, makeRenderer } from './chrome'

const KIT = resolve(__dirname, '../../brand-kit')
const OUT = join(KIT, 'business-card')
const LOGOS = join(KIT, 'logo/svg')

/* ── What's printed ─────────────────────────────────────────────────────── */

const WEB = 'flintworks.hu'

const PERSON = {
  family: 'Horváth',
  given: 'Dávid',
  // International format with spaces. While this is empty the personal card is a draft.
  phone: '+36 20 270 5192',
  email: 'davidh@flintworks.hu',
}

const COMPANY = {
  phone: '+36 20 270 5192',
  email: 'hello@flintworks.hu',
}

// The fronts are the same in every language; only the backs are translated.
const TAGLINE = 'The spark for your business'
const BACK_TEXT = {
  hu: {
    name: [PERSON.family, PERSON.given], // Hungarian order: family name first
    saveContact: 'Névjegy mentése',
    servicesEyebrow: 'Amit fejlesztünk',
    // The site's services in its own words. Marketing isn't offered yet, so it's left off.
    services: ['Webalkalmazások és platformok', 'Vállalati weboldalak', 'Mobilapplikációk', 'Startup fejlesztés'],
    place: 'Budapest, Magyarország',
    website: 'Weboldalunk',
  },
  en: {
    name: [PERSON.given, PERSON.family],
    saveContact: 'Save my contact',
    servicesEyebrow: 'What we build',
    services: ['Web Apps & Platforms', 'Business Websites', 'Mobile Apps', 'Startup Development'],
    place: 'Budapest, Hungary',
    website: 'Our website',
  },
}
const LANG: keyof typeof BACK_TEXT = 'hu'

const PHONE_PLACEHOLDER = '+36 00 000 0000'

/* ── Sheet ──────────────────────────────────────────────────────────────── */

// Millimetres. 90 × 50 is the standard Hungarian card; print shops want 3 mm of bleed on every side.
const W = 90
const H = 50
const BLEED = 3
const MARGIN = 6
const PT = 0.3528 // one typographic point in mm
const FIRE_PX = 24 // pixels per mm for the fire image: about 600 dpi, plenty for soft light

const C = {
  ink: '#0A0A0B',
  bone: '#F0F0F5',
  ember: '#FF4D00',
  flame: '#FF8C42',
  // A step lighter than the site's #6B6B7A: small grey type reversed out of black prints darker than it looks on screen.
  muted: '#8A8A99',
}

const r = (n: number) => Math.round(n * 1000) / 1000
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

/** `a` at strength `t` over `b`, as the solid colour it comes to. The brand kit bakes its logo facets the same way. */
function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return `#${pa.map((v, i) => Math.round(v * t + pb[i] * (1 - t)).toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

// One weight per family per request. Ask for two weights of a family together and Google serves a variable font,
// which Chrome can't embed in a PDF as a real font: the type ends up as Type 3 outlines.
const FONTS =
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500&family=JetBrains+Mono:wght@500&family=Syne:wght@700&display=block">' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=block">'

const NAME_SIZE = r(17 * PT)
const SERVICE_SIZE = r(9.5 * PT)
const VALUE_SIZE = r(7.5 * PT)
const LABEL_SIZE = r(6 * PT) // light type on black fills in below about 6 pt
const LABEL_CAP = LABEL_SIZE * 0.73 // JetBrains Mono's cap height
const MONO_ADVANCE = 0.6 // JetBrains Mono: every glyph is 0.6 em wide, so label widths are known up front
const PILL_TRACKING = 0.1
const EYEBROW_TRACKING = 0.2

// Fonts only. Colours come from the theme, as fill attributes.
const TYPE_CSS = `
  .name{font:700 ${NAME_SIZE}px Syne;letter-spacing:-.02em}
  .service{font:700 ${SERVICE_SIZE}px Syne;letter-spacing:-.01em}
  .value{font:500 ${VALUE_SIZE}px Inter}
  .label{font:500 ${LABEL_SIZE}px 'JetBrains Mono'}
  .eyebrow{font:500 ${LABEL_SIZE}px 'JetBrains Mono';letter-spacing:${EYEBROW_TRACKING}em;text-transform:uppercase}
  .pill{font:500 ${LABEL_SIZE}px 'JetBrains Mono';letter-spacing:${PILL_TRACKING}em;text-transform:uppercase}
  .pill--solid{font-weight:700}
  .caption{font:500 ${LABEL_SIZE}px 'JetBrains Mono';text-transform:uppercase}
`

// The site's gradient, ember to flame from corner to corner: the hero headline's second line, and the filled badge.
const INK_DEFS = `<defs><linearGradient id="fwc-flame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.ember}"/><stop offset="1" stop-color="${C.flame}"/></linearGradient></defs>`

/* ── Themes ─────────────────────────────────────────────────────────────── */

type Stop = [offset: number, color: string, opacity: number]
type Badge = { fill: string; stroke?: string; text: string }

type Theme = {
  bg: string
  /** Main type. */
  fg: string
  /** Labels, numerals and eyebrows. */
  accent: string
  /** Captions and the dateline. */
  quiet: string
  /** The second line of the name, the hero headline's highlight. */
  highlight: string
  /** The QR tile. Its modules are always ink. */
  tile: string
  /** The brand-kit logos are drawn for a dark ground; this re-inks them for the theme's. */
  logo: (src: string) => string
  badge: { outline: Badge; solid: Badge }
  /** The fire: the colour of its glow, and the gradients of the soft and the hot embers. Leave `embers` out for a glow alone. */
  fire: { pool: string; embers?: { soft: Stop[]; hot: Stop[] } }
}

// The site: ink ground, bone type, ember for everything that glows.
const DARK: Theme = {
  bg: C.ink,
  fg: C.bone,
  accent: C.ember,
  quiet: C.muted,
  highlight: 'url(#fwc-flame)',
  tile: C.bone,
  logo: (src) => src,
  badge: {
    // The hero badge's translucent ember fill and border, as the solid colours they come to over the glow.
    outline: { fill: '#22110B', stroke: '#782806', text: C.ember },
    solid: { fill: 'url(#fwc-flame)', text: C.ink },
  },
  fire: {
    pool: C.ember,
    embers: {
      // The same stops as the hero's canvas particles.
      soft: [
        [0, '#FF781E', 1],
        [0.5, C.ember, 0.6],
        [1, C.ember, 0],
      ],
      hot: [
        [0, '#FFE1C2', 1],
        [0.28, C.flame, 1],
        [0.6, C.ember, 0.5],
        [1, C.ember, 0],
      ],
    },
  },
}

// The logo lab's ember theme (PALETTES.ember): an ember ground with everything on it in ink. The mark keeps its
// facets as tones of ink and the struck face goes solid. Here the fire is only a glow, gold against the ground, with no embers.
const EMBER: Theme = {
  bg: C.ember,
  fg: C.ink,
  accent: C.ink,
  quiet: mix(C.ink, C.ember, 0.72),
  highlight: C.ink,
  tile: '#FFE9D2',
  logo: (src) =>
    FACETS.filter((f) => !f.ember).reduce(
      // The wordmark shares the lightest facet's colour, so it goes to ink along with it.
      (out, f) => out.replaceAll(mix(C.bone, C.ink, f.tone), mix(C.ink, C.ember, f.tone)),
      src.replaceAll('url(#fw-ember)', C.ink),
    ),
  badge: {
    outline: { fill: 'none', stroke: C.ink, text: C.ink },
    solid: { fill: C.ink, text: C.ember },
  },
  fire: { pool: '#FFB648' },
}

/** A brand-kit logo in the theme's colours, scaled to `height`: the width it comes out at, and a way to place it. */
function logo(t: Theme, file: string, height: number) {
  const src = t.logo(readFileSync(join(LOGOS, file), 'utf8').trim())
  const [, , vw, vh] = src.match(/viewBox="([^"]+)"/)![1].split(' ').map(Number)
  const width = r((height * vw) / vh)
  return { width, height, at: (x: number, y: number) => src.replace('<svg ', `<svg x="${r(x)}" y="${r(y)}" width="${width}" height="${height}" `) }
}

/* ── Fire ───────────────────────────────────────────────────────────────── */

// The site's hero, on paper: a glow rising from the bottom edge with embers drifting up out of it.
// It's all soft, stacked transparency, which PDF viewers and print RIPs don't draw alike (some turn the embers
// into hard flat discs), so each side's fire is rendered to an image and the vector artwork is laid over it.
function fireDefs({ fire }: Theme) {
  const stops = (s: Stop[]) => s.map(([offset, color, opacity]) => `<stop offset="${offset}" stop-color="${color}"${opacity < 1 ? ` stop-opacity="${opacity}"` : ''}/>`).join('')
  const pool: Stop[] = [
    [0, fire.pool, 1],
    [0.25, fire.pool, 0.56],
    [0.5, fire.pool, 0.25],
    [0.75, fire.pool, 0.06],
    [1, fire.pool, 0],
  ]
  const particles = fire.embers ? `<radialGradient id="fwc-ember">${stops(fire.embers.soft)}</radialGradient><radialGradient id="fwc-hot">${stops(fire.embers.hot)}</radialGradient>` : ''
  return `<defs><radialGradient id="fwc-pool">${stops(pool)}</radialGradient>${particles}</defs>`
}

/** A pool of light: an ellipse that is `alpha` strong at its heart and fades to nothing at its rim. */
const glow = (cx: number, cy: number, rx: number, ry: number, alpha: number) =>
  `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(rx)}" ry="${r(ry)}" fill="url(#fwc-pool)" opacity="${alpha}"/>`

/** Seeded generator (mulberry32): the scatter looks random but comes out identical on every build. */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Box = [x0: number, y0: number, x1: number, y1: number]

/**
 * The hero's ember particles, frozen mid-flight. They rise from below the bottom edge around `focus`: big and
 * bright low down, small and faint by the top. `keepOut` boxes stay clear, so nothing drifts behind the type.
 */
function embers(t: Theme, seed: number, count: number, focus: number, spread: number, keepOut: Box[]) {
  if (!t.fire.embers) return ''
  const rand = random(seed)
  let out = ''
  for (let i = 0; i < count; i++) {
    const rise = rand() ** 1.7 // 0 at the bottom edge, 1 at the top; most stay low
    const x = focus + (rand() + rand() + rand() - 1.5) * spread * (0.7 + 0.6 * rise)
    const y = (H + BLEED) * (1 - rise)
    const depth = rand()
    const size = rand()
    const heat = rand()
    const streak = rand()
    const shrink = 1.2 - 0.7 * rise
    // Three depths: a few large out-of-focus ones behind, the hero's soft dots, and hot ones with a pale core in front.
    const [radius, alpha, fill] =
      depth < 0.16
        ? [(1.5 + 2.2 * size) * shrink, (0.12 + 0.14 * heat) * (1 - 0.5 * rise), 'fwc-ember']
        : depth < 0.62
          ? [(0.4 + 0.5 * size) * shrink, (0.55 + 0.45 * heat) * (1 - 0.5 * rise), 'fwc-ember']
          : [(0.46 + 0.62 * size) * shrink, (0.72 + 0.28 * heat) * (1 - 0.4 * rise), 'fwc-hot']
    if (keepOut.some(([x0, y0, x1, y1]) => x + radius > x0 && x - radius < x1 && y + radius > y0 && y - radius < y1)) continue
    // One hot ember in three is caught moving: drawn thin and long, leaning the way it drifts away from the fire.
    if (fill === 'fwc-hot' && streak < 0.34) {
      const lean = ((x - focus) / spread) * 22
      out += `<ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(radius * 0.42)}" ry="${r(radius * (1.5 + 3 * streak))}" transform="rotate(${r(lean)} ${r(x)} ${r(y)})" fill="url(#${fill})" opacity="${r(alpha)}"/>`
    } else {
      out += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(radius)}" fill="url(#${fill})" opacity="${r(alpha)}"/>`
    }
  }
  return out
}

/* ── QR codes ───────────────────────────────────────────────────────────── */

function vcard() {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${PERSON.family};${PERSON.given};;;`,
    `FN:${BACK_TEXT[LANG].name.join(' ')}`,
    'ORG:Flintworks',
    PERSON.phone && `TEL;TYPE=CELL:${PERSON.phone.replace(/\s/g, '')}`,
    `EMAIL:${PERSON.email}`,
    `URL:https://${WEB}`,
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n')
}

const QUIET = 4 // modules of clear space around the code, as the QR spec asks

/** Ink modules on a light tile `size` mm square: dark-on-light is what every phone camera reads reliably. */
function qrTile(data: string, x: number, y: number, size: number, tile: string) {
  qrcode.stringToBytes = (s) => [...Buffer.from(s, 'utf8')]
  const qr = qrcode(0, 'M')
  qr.addData(data)
  qr.make()
  const n = qr.getModuleCount()
  // One path in module units, with each row's runs merged so no seams show between neighbours.
  let d = ''
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!qr.isDark(row, col)) continue
      let run = 1
      while (col + run < n && qr.isDark(row, col + run)) run++
      d += `M${col} ${row}h${run}v1h${-run}z`
      col += run - 1
    }
  }
  const m = size / (n + 2 * QUIET)
  return (
    `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="1.2" fill="${tile}"/>` +
    `<path transform="translate(${r(x + QUIET * m)} ${r(y + QUIET * m)}) scale(${r(m)})" fill="${C.ink}" d="${d}"/>`
  )
}

/* ── Sides ──────────────────────────────────────────────────────────────── */

// `fire` is the glow and embers, which become an image (see Fire above). `ink` is everything that has to stay
// sharp (logos, type, the QR code): opaque vector artwork laid over that image.
type Side = { fire: string; ink: string }

const SHEET = `x="${-BLEED}" y="${-BLEED}" width="${W + 2 * BLEED}" height="${H + 2 * BLEED}"`
const BASE = H - MARGIN // the baseline everything on a back sits down on
const ROW_PITCH = 3.9

/** The hero's pill badge, a dot and a mono label: outlined like the site's quiet button, or solid like its main one. */
function pill(t: Theme, text: string, style: keyof Theme['badge']) {
  const badge = t.badge[style]
  const height = 4.6
  const pad = 2.5
  const dot = 0.45
  const gap = 1.5
  // Tracking follows every letter but the last.
  const textWidth = (text.length * (MONO_ADVANCE + PILL_TRACKING) - PILL_TRACKING) * LABEL_SIZE
  const width = r(pad + 2 * dot + gap + textWidth + pad)
  const at = (x: number, y: number) =>
    `<rect x="${r(x)}" y="${r(y)}" width="${width}" height="${height}" rx="${height / 2}" fill="${badge.fill}"${badge.stroke ? ` stroke="${badge.stroke}" stroke-width=".16"` : ''}/>` +
    `<circle cx="${r(x + pad + dot)}" cy="${r(y + height / 2)}" r="${dot}" fill="${badge.text}"/>` +
    `<text class="pill${style === 'solid' ? ' pill--solid' : ''}" x="${r(x + pad + 2 * dot + gap)}" y="${r(y + height / 2 + LABEL_CAP / 2)}" fill="${badge.text}">${esc(text)}</text>`
  return { width, height, at }
}

// Brand side: the lockup and the hero's badge above a fire, with embers rising past them.
// The dark cards differ in one thing you can see across a table: the personal badge is outlined, the company one is filled.
function front(t: Theme, badgeStyle: keyof Theme['badge']): Side {
  const lockup = logo(t, 'flintworks-logo-on-dark.svg', 8.2)
  const badge = pill(t, TAGLINE, badgeStyle)
  const gap = 4.4
  const top = (H - lockup.height - gap - badge.height) / 2 - 2.4
  const lockupX = (W - lockup.width) / 2
  const badgeX = (W - badge.width) / 2
  const badgeY = top + lockup.height + gap
  const clear = (lockup.height * 52) / 92 / 2 // the brand kit's clear space: half the mark's width
  return {
    fire:
      glow(W / 2, H + 12, 70, 52, 0.4) +
      glow(W / 2, H + 9, 38, 26, 0.6) +
      glow(W / 2, H + 5, 22, 11, 0.7) +
      embers(t, 8, 150, W / 2, W * 0.42, [
        [lockupX - clear, top - clear, lockupX + lockup.width + clear, top + lockup.height + clear],
        [badgeX - 1, badgeY - 1, badgeX + badge.width + 1, badgeY + badge.height + 1],
      ]),
    ink: lockup.at(lockupX, top) + badge.at(badgeX, badgeY),
  }
}

/** Contact lines stacked up from the bottom margin: a mono letter, then the value. */
function contactRows(t: Theme, rows: [label: string, value: string][]) {
  const first = BASE - (rows.length - 1) * ROW_PITCH
  const ink = rows
    .map(
      ([label, value], i) =>
        `<text class="label" x="${MARGIN}" y="${r(first + i * ROW_PITCH)}" fill="${t.accent}">${label}</text>` +
        `<text class="value" x="${MARGIN + 3.6}" y="${r(first + i * ROW_PITCH)}" fill="${t.fg}">${esc(value)}</text>`,
    )
    .join('')
  return { first, ink }
}

/** The corner both backs share: a captioned QR tile bottom right, with the fire burning under it. */
function codeCorner(t: Theme, data: string, caption: string, tile: number) {
  const x = W - MARGIN - tile
  const y = BASE - tile
  const cx = x + tile / 2
  return {
    x,
    y,
    cx,
    keepOut: [x - 1.5, y - 6, W, BASE + 1.5] as Box,
    fire:
      glow(cx - 6, H + 12, 60, 44, 0.34) +
      glow(cx - 4, H + 7, 30, 16, 0.55) +
      // The site's ember-glow shadow, around the code.
      glow(cx, y + tile / 2, tile * 1.15, tile * 1.15, 0.34),
    ink:
      `<text class="caption" x="${x}" y="${r(y - 2.2)}" textLength="${tile}" lengthAdjust="spacing" fill="${t.quiet}">${esc(caption)}</text>` +
      qrTile(data, x, y, tile, t.tile),
  }
}

// Personal back: the mark, the name set like the hero headline, how to reach them, and a QR code that saves all of it.
function personBack(t: Theme): Side {
  const text = BACK_TEXT[LANG]
  const rows = contactRows(t, [
    ['T', PERSON.phone || PHONE_PLACEHOLDER],
    ['E', PERSON.email],
    ['W', WEB],
  ])
  const nameBase = rows.first - 5.7
  const lead = NAME_SIZE * 0.98
  const mark = logo(t, 'flintworks-mark-on-dark.svg', 8)
  const code = codeCorner(t, vcard(), text.saveContact, 23)
  return {
    fire:
      code.fire +
      embers(t, 28, 130, code.cx - 10, 32, [
        [0, nameBase - lead - NAME_SIZE, 46, H],
        [MARGIN - 2, MARGIN - 2, MARGIN + mark.width + 2, MARGIN + mark.height + 2],
        code.keepOut,
      ]),
    ink:
      mark.at(MARGIN, MARGIN) +
      `<text class="name" x="${MARGIN}" y="${r(nameBase - lead)}" fill="${t.fg}">${esc(text.name[0])}</text>` +
      `<text class="name" x="${MARGIN}" y="${r(nameBase)}" fill="${t.highlight}">${esc(text.name[1])}</text>` +
      rows.ink +
      code.ink,
  }
}

// Company back: what Flintworks builds as a numbered list, where it is, how to reach it, and a QR code to the website.
function companyBack(t: Theme): Side {
  const text = BACK_TEXT[LANG]
  const rows = contactRows(t, [
    ['T', COMPANY.phone],
    ['E', COMPANY.email],
    ['W', WEB],
  ])
  // Header: the mark with the list's eyebrow beside it, and the place set against the right margin like a dateline.
  const mark = logo(t, 'flintworks-mark-on-dark.svg', 6)
  const headBase = MARGIN + mark.height / 2 + LABEL_CAP / 2
  const eyebrowX = MARGIN + mark.width + 2.6
  const tracking = EYEBROW_TRACKING * LABEL_SIZE
  // The list sits between the header and the contact lines.
  const pitch = 4.5
  const indent = 5
  const listEnd = rows.first - 5.5
  const listStart = listEnd - (text.services.length - 1) * pitch
  const code = codeCorner(t, `https://${WEB}`, text.website, 17)
  // Syne Bold averages about 0.6 em a letter; the embers keep that much clear after each line, plus a margin.
  const lineEnd = (s: string) => MARGIN + indent + s.length * 0.6 * SERVICE_SIZE + 3
  return {
    fire:
      code.fire +
      embers(t, 41, 150, code.cx - 12, 34, [
        [0, 0, W, MARGIN + mark.height + 2],
        ...text.services.map((s, i): Box => [0, listStart + i * pitch - SERVICE_SIZE, lineEnd(s), listStart + i * pitch + 1.2]),
        [0, rows.first - VALUE_SIZE - 1, 40, H],
        code.keepOut,
      ]),
    ink:
      mark.at(MARGIN, MARGIN) +
      `<text class="eyebrow" x="${r(eyebrowX)}" y="${r(headBase)}" fill="${t.accent}">${esc(text.servicesEyebrow)}</text>` +
      // Tracking trails the last letter too, so the anchor sits that much past the margin.
      `<text class="eyebrow" text-anchor="end" x="${r(W - MARGIN + tracking)}" y="${r(headBase)}" fill="${t.quiet}">${esc(text.place)}</text>` +
      text.services
        .map(
          (s, i) =>
            `<text class="label" x="${MARGIN}" y="${r(listStart + i * pitch)}" fill="${t.accent}">${String(i + 1).padStart(2, '0')}</text>` +
            `<text class="service" x="${MARGIN + indent}" y="${r(listStart + i * pitch)}" fill="${t.fg}">${esc(s)}</text>`,
        )
        .join('') +
      rows.ink +
      code.ink,
  }
}

/** Artwork as an SVG in millimetres: with the bleed for print, cropped to the trim for previews. */
function svg(body: string, bleed: boolean) {
  const b = bleed ? BLEED : 0
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-b} ${-b} ${W + 2 * b} ${H + 2 * b}">${body}</svg>`
}

/* ── Pages ──────────────────────────────────────────────────────────────── */

const head = (css: string) => `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${TYPE_CSS}${css}</style></head>`

// Print file: one page per side at the bleed size, front first. Chrome snaps PDF pages to a coarse grid
// (the sheet comes out about 0.1 mm off), so the page itself takes the card's colour and no white sliver can show at an edge.
function printHtml(sides: string[], bg: string) {
  const w = W + 2 * BLEED
  const h = H + 2 * BLEED
  return `${head(`@page{size:${w}mm ${h}mm;margin:0}html,body{margin:0;background:${bg}}body>svg{display:block;width:${w}mm;height:${h}mm;break-inside:avoid}`)}<body>${sides.map((s) => svg(s, true)).join('')}</body></html>`
}

function sideHtml(side: string, width: number, height: number) {
  return `${head(`html,body{margin:0}body>svg{display:block;width:${width}px;height:${height}px}`)}<body>${svg(side, false)}</body></html>`
}

// Both sides at the trim size, laid on paper, for a look before anything goes to the printer.
function previewHtml(sides: string[], width: number, height: number) {
  const card = Math.round(width * 0.45)
  return `${head(`
    html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}
    body{background:#D8D4CC;display:flex;align-items:center;justify-content:space-evenly}
    body>svg{display:block;width:${card}px;height:${Math.round((card * H) / W)}px;box-shadow:0 ${Math.round(card * 0.012)}px ${Math.round(card * 0.05)}px rgba(20,16,10,.38)}
  `)}<body>${sides.map((s) => svg(s, false)).join('')}</body></html>`
}

/* ── Build ──────────────────────────────────────────────────────────────── */

function write(name: string, data: Buffer) {
  writeFileSync(join(OUT, name), data)
  console.log('  ', `business-card/${name}`)
}

async function main() {
  rmSync(OUT, { recursive: true, force: true })
  mkdirSync(OUT, { recursive: true })

  // A personal card without a phone number isn't ready for the printer: its files get a -draft suffix.
  const cards = [
    { name: 'personal', theme: DARK, sides: [front(DARK, 'outline'), personBack(DARK)], draft: !PERSON.phone },
    { name: 'company', theme: DARK, sides: [front(DARK, 'solid'), companyBack(DARK)], draft: false },
    { name: 'company-ember', theme: EMBER, sides: [front(EMBER, 'solid'), companyBack(EMBER)], draft: false },
  ]

  const cdp = await launchChrome()
  try {
    const R = await makeRenderer(cdp)

    // Fire first: each side's glow and embers become an image, then the vector artwork goes over it.
    // Cards that burn the same fire on the same ground share the image.
    const fw = (W + 2 * BLEED) * FIRE_PX
    const fh = (H + 2 * BLEED) * FIRE_PX
    const baked = new Map<string, string>()
    async function compose(t: Theme, { fire, ink }: Side) {
      const key = t.bg + fire
      if (!baked.has(key)) {
        const png = await R.png(svg(`${fireDefs(t)}<rect ${SHEET} fill="${t.bg}"/>${fire}`, true), fw, fh, t.bg)
        baked.set(key, `<image ${SHEET} href="data:image/png;base64,${png.toString('base64')}"/>`)
      }
      return baked.get(key) + INK_DEFS + ink
    }

    const pw = 1800
    const ph = (pw * H) / W
    for (const card of cards) {
      const sides = [await compose(card.theme, card.sides[0]), await compose(card.theme, card.sides[1])]
      const file = `flintworks-business-card-${card.name}`
      const suffix = card.draft ? '-draft' : ''
      write(`${file}${suffix}.pdf`, await R.pdf(printHtml(sides, card.theme.bg)))
      write(`${file}-front${suffix}.png`, await R.page(sideHtml(sides[0], pw, ph), pw, ph))
      write(`${file}-back${suffix}.png`, await R.page(sideHtml(sides[1], pw, ph), pw, ph))
      write(`preview-${card.name}${suffix}.png`, await R.page(previewHtml(sides, 2800, 1000), 2800, 1000))
    }
  } finally {
    cdp.close()
  }

  if (cards.some((c) => c.draft)) console.log('\nDRAFT: no phone number yet. Fill in PERSON.phone and re-run before sending anything to print.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
