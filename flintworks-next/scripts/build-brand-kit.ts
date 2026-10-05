/**
 * Builds the Flintworks brand kit (../brand-kit) from the same geometry the logo lab
 * (app/(lab)/_logo-lab — rename to logo-lab to bring the page back) uses.
 *
 *   npx tsx scripts/build-brand-kit.ts
 *
 * Needs Google Chrome (PNG rendering) and ffmpeg (MP4/GIF) on this machine. Everything else is
 * generated from components/logo-lab/{knapped,glyphs,badge,anim}.ts, so edits there flow through.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { ANIM_CSS, type AnimVariant } from '../components/logo-lab/anim'
import { BADGE_CSS, BADGE_URL, badgeHref, badgeHtml, type BadgeOptions } from '../components/logo-lab/badge'
import { sparkPath } from '../components/logo-lab/geometry'
import { GLYPHS } from '../components/logo-lab/glyphs'
import { FACETS, OUTLINE, STRIKE_POINT } from '../components/logo-lab/knapped'
import { launchChrome, makeRenderer } from './chrome'

const OUT = resolve(__dirname, '../../brand-kit')

const C = {
  ink: '#0A0A0B',
  bone: '#F0F0F5',
  ember: '#FF4D00',
  flame: '#FF8C42',
  paper: '#F3F0EA',
  muted: '#6B6B7A',
}

/* ── Colour styles ──────────────────────────────────────────────────────── */

type Style = { ink: string; bg: string; mono: boolean }

// Tonal facets are baked to solid colours against the background they're designed for, so exported
// files contain no transparency tricks and print predictably. Mono styles are true one-colour.
const STYLES = {
  'on-dark': { ink: C.bone, bg: C.ink, mono: false },
  'on-light': { ink: C.ink, bg: '#FFFFFF', mono: false },
  black: { ink: '#000000', bg: '#FFFFFF', mono: true },
  white: { ink: '#FFFFFF', bg: '#000000', mono: true },
} satisfies Record<string, Style>
type StyleKey = keyof typeof STYLES

function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return `#${pa.map((v, i) => Math.round(v * t + pb[i] * (1 - t)).toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

const EMBER_GRADIENT = (id: string) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="50" y1="46" x2="62" y2="90"><stop offset="0" stop-color="${C.flame}"/><stop offset="1" stop-color="${C.ember}"/></linearGradient>`

function markParts(st: Style, id = 'fw-ember') {
  const defs = st.mono ? '' : EMBER_GRADIENT(id)
  const paths = FACETS.map((f) => {
    const fill = f.ember ? (st.mono ? st.ink : `url(#${id})`) : st.mono ? st.ink : mix(st.ink, st.bg, f.tone)
    return `<path fill="${fill}" d="${f.d}"/>`
  }).join('')
  return { defs, paths }
}

const svg = (viewBox: string, body: string, title = 'Flintworks') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`

const r = (n: number) => Math.round(n * 1000) / 1000

/* ── Static logos ───────────────────────────────────────────────────────── */

const W = GLYPHS.wide
const [WX0, WY0, WX1, WY1] = W.bbox
const letters = (fill: string) => `<g fill="${fill}">${W.letters.map((l) => `<path d="${l.d}"/>`).join('')}</g>`

// Horizontal lockup, in mark units (mark box = 100): same proportions as the lab's lockup.
const LOCK_S = 0.056
const LOCK_X = 134
const LOCK_TX = r(LOCK_X - WX0 * LOCK_S)
const LOCK_TY = r(50 - ((WY0 + WY1) / 2) * LOCK_S)
const LOCK_W = r(LOCK_X + (WX1 - WX0) * LOCK_S - 24)
const LOCK_VIEWBOX = `24 4 ${LOCK_W} 92`

// Stacked lockup: mark over the name, name centred under it.
const STACK_S = 20 / W.capHeight
const STACK_WIDTH = (WX1 - WX0) * STACK_S
const STACK_TX = r(50 - STACK_WIDTH / 2 - WX0 * STACK_S)
const STACK_BASE = 96 + 26 + 20
const STACK_VIEWBOX = `${r(50 - STACK_WIDTH / 2)} 4 ${r(STACK_WIDTH)} ${STACK_BASE - 4 + 1}`

function markSvg(k: StyleKey) {
  const { defs, paths } = markParts(STYLES[k])
  return svg('24 4 52 92', `${defs ? `<defs>${defs}</defs>` : ''}${paths}`)
}

function lockupSvg(k: StyleKey) {
  const st = STYLES[k]
  const { defs, paths } = markParts(st)
  return svg(LOCK_VIEWBOX, `${defs ? `<defs>${defs}</defs>` : ''}${paths}<g transform="translate(${LOCK_TX} ${LOCK_TY}) scale(${LOCK_S})">${letters(st.ink)}</g>`)
}

function stackedSvg(k: StyleKey) {
  const st = STYLES[k]
  const { defs, paths } = markParts(st)
  return svg(STACK_VIEWBOX, `${defs ? `<defs>${defs}</defs>` : ''}${paths}<g transform="translate(${STACK_TX} ${STACK_BASE}) scale(${r(STACK_S)})">${letters(st.ink)}</g>`)
}

function wordmarkSvg(k: StyleKey) {
  return svg(`${WX0} ${WY0} ${WX1 - WX0} ${WY1 - WY0}`, letters(STYLES[k].ink))
}

/** Square icon: `bg` tile (full-bleed or rounded) with the mark scaled to `k` of the height. */
function tileSvg(bg: string, k: number, radius = 0) {
  const { defs, paths } = markParts(STYLES['on-dark'])
  const t = r(50 - 50 * k)
  return svg(
    '0 0 100 100',
    `<defs>${defs}</defs><rect width="100" height="100" rx="${radius}" fill="${bg}"/><g transform="translate(${t} ${t}) scale(${k})">${paths}</g>`,
  )
}

// Adapts to the browser's colour scheme: ink facets on light tabs, bone facets on dark tabs.
function faviconSvg() {
  const paths = FACETS.map((f) =>
    f.ember ? `<path fill="url(#e)" d="${f.d}"/>` : `<path class="i" fill-opacity="${f.tone}" d="${f.d}"/>`,
  ).join('')
  return svg(
    '0 0 100 100',
    `<style>.i{fill:${C.ink}}@media (prefers-color-scheme:dark){.i{fill:${C.bone}}}</style><defs>${EMBER_GRADIENT('e')}</defs>${paths}`,
  )
}

/* ── Animated logos ─────────────────────────────────────────────────────── */

const PARTICLES: [number, number][] = [
  [14, 12],
  [4, 20],
  [20, 2],
]
const ANIM_VIEWBOX = `2 -22 ${r(LOCK_W + 30)} 144`

function animatedSvg(variant: AnimVariant, k: 'on-dark' | 'on-light') {
  const st = STYLES[k]
  const [sx, sy] = STRIKE_POINT
  const facets = FACETS.map((f, i) => {
    const vars = `--i:${f.ember && variant === 'knap' ? 6 : i};--dx:${r(f.out[0] * 22)}px;--dy:${r(f.out[1] * 22)}px;--r:${i % 2 ? 10 : -10}deg`
    if (!f.ember) return `<path class="fwa-f" style="${vars}" fill="${mix(st.ink, st.bg, f.tone)}" d="${f.d}"/>`
    return (
      `<g class="fwa-f" style="${vars}">` +
      `<path fill="${mix(st.ink, st.bg, 0.2)}" d="${f.d}"/>` +
      `<path class="fwa-glow" fill="${C.ember}" filter="url(#b)" d="${f.d}"/>` +
      `<path class="fwa-ember" fill="url(#g)" d="${f.d}"/>` +
      `<path class="fwa-hot" fill="#FFE1C2" d="${f.d}"/>` +
      `</g>`
    )
  }).join('')
  const wordmark = W.letters.map((l, j) => `<path class="fwa-l" style="--j:${j}" d="${l.d}"/>`).join('')
  // Groups that position things via the transform attribute opt out of the fill-box origin rule.
  const fixed = 'style="transform-box:view-box;transform-origin:0 0"'
  return svg(
    ANIM_VIEWBOX,
    `<style>${ANIM_CSS}</style>` +
      `<defs>${EMBER_GRADIENT('g')}` +
      `<linearGradient id="s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF" stop-opacity="0"/><stop offset=".5" stop-color="#FFF" stop-opacity=".55"/><stop offset="1" stop-color="#FFF" stop-opacity="0"/></linearGradient>` +
      `<filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>` +
      `<clipPath id="c"><path d="${OUTLINE}"/></clipPath></defs>` +
      `<g class="fwa" data-v="${variant}" data-w="wide" data-play="1">` +
      `<g class="fwa-body">${facets}<g clip-path="url(#c)"><g transform="rotate(20 50 50)" ${fixed}><rect class="fwa-sheen" x="-70" y="-30" width="34" height="160" fill="url(#s)"/></g></g></g>` +
      `<path class="fwa-striker" fill="${C.flame}" d="${sparkPath(sx, sy, 10, 10, 0.2)}"/>` +
      `<path class="fwa-burst" fill="${C.flame}" d="${sparkPath(sx, sy, 16, 16, 0.18)}"/>` +
      PARTICLES.map(([px, py], n) => `<circle class="fwa-p" style="--px:${px}px;--py:${py}px" cx="${sx}" cy="${sy}" r="${r(1.6 - n * 0.3)}" fill="${C.flame}"/>`).join('') +
      `<g transform="translate(${LOCK_TX} ${LOCK_TY}) scale(${LOCK_S})" ${fixed} fill="${st.ink}">${wordmark}</g>` +
      `</g>`,
  )
}

/* ── Badge ──────────────────────────────────────────────────────────────── */

const BADGE_DEFAULT: BadgeOptions = { theme: 'dark', wordmark: 'wide', label: 'name', project: 'your-project' }

function badgeJs() {
  // Render the markup once per label with placeholders the script fills at runtime.
  const tpl = (label: BadgeOptions['label']) =>
    badgeHtml({ ...BADGE_DEFAULT, label, project: 'x' })
      .replace('class="fwb fwb--dark ', 'class="fwb fwb--{theme} ')
      .replace(badgeHref('x'), '{href}')
  return `/*! Flintworks "built by" badge · drop-in script
 * Usage:  <div data-flintworks-badge data-theme="dark" data-project="northside-coffee"></div>
 *         <script src="/flintworks-badge.js" defer></script>
 * data-theme: dark | light | ghost (default dark) · data-label: name | quote (default name)
 * data-project: tracking name (default: the site's hostname)
 */
(function () {
  var CSS = ${JSON.stringify(BADGE_CSS)};
  var TPL = { name: ${JSON.stringify(tpl('name'))}, quote: ${JSON.stringify(tpl('quote'))} };
  var BASE = ${JSON.stringify(BADGE_URL)};
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'client-site'; }
  function mount() {
    if (!document.getElementById('fwb-style')) {
      var st = document.createElement('style');
      st.id = 'fwb-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    var els = document.querySelectorAll('[data-flintworks-badge]:not([data-fwb-ready])');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var theme = el.getAttribute('data-theme');
      if (theme !== 'light' && theme !== 'ghost') theme = 'dark';
      var label = el.getAttribute('data-label') === 'quote' ? 'quote' : 'name';
      var href = BASE + '?utm_source=' + slug(el.getAttribute('data-project') || location.hostname) + '&utm_medium=badge&utm_campaign=built-by';
      el.innerHTML = TPL[label].replace('{theme}', theme).replace('{href}', href);
      el.setAttribute('data-fwb-ready', '');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
`
}

function badgePreview() {
  const footer = (dark: boolean, brand: string, badge: string) => `
  <footer style="background:${dark ? '#101418' : '#F7F4EF'};color:${dark ? '#9AA3AD' : '#55514B'}">
    <span><b style="color:${dark ? '#E8ECEF' : '#1E1B18'}">${brand}</b> · © 2026 · Privacy · Imprint</span>
    ${badge}
  </footer>`
  const noJs = (theme: BadgeOptions['theme'], label: BadgeOptions['label'] = 'name') => badgeHtml({ ...BADGE_DEFAULT, theme, label })
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Flintworks badge preview</title>
<style>
  body{margin:0;padding:40px 24px;font:14px/1.5 system-ui,sans-serif;background:#0A0A0B;color:#C4C4CF}
  h2{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#FF4D00;margin:40px 0 12px}
  footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 24px;border-radius:12px;margin-bottom:12px}
</style>
<style>${BADGE_CSS}</style>
</head><body>
<p>Hover the badges (or tab to them). Links go to ${BADGE_URL}.</p>
<h2>HTML + CSS snippet (no JS)</h2>
${footer(false, 'Northside Coffee', noJs('dark'))}
${footer(true, 'Atlas Freight', noJs('ghost'))}
${footer(false, 'Kávé & Co.', noJs('light', 'quote'))}
<h2>Drop-in script</h2>
${footer(false, 'Northside Coffee', '<div data-flintworks-badge data-theme="dark" data-project="northside-coffee"></div>')}
${footer(true, 'Atlas Freight', '<div data-flintworks-badge data-theme="ghost" data-label="quote" data-project="atlas-freight"></div>')}
<script src="flintworks-badge.js" defer></script>
</body></html>
`
}

/* ── ICO (PNG-compressed entries) ───────────────────────────────────────── */

function ico(images: { size: number; data: Buffer }[]) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = 6 + 16 * images.length
  const dir = images.map(({ size, data }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    return e
  })
  return Buffer.concat([header, ...dir, ...images.map((i) => i.data)])
}

/* ── Build ──────────────────────────────────────────────────────────────── */

function write(path: string, data: string | Buffer) {
  const full = join(OUT, path)
  mkdirSync(join(full, '..'), { recursive: true })
  writeFileSync(full, data)
  console.log('  ', path)
}

function run(cmd: string, args: string[]) {
  return new Promise<void>((res, rej) => {
    const p = spawn(cmd, args, { stdio: 'ignore' })
    p.on('exit', (code) => (code === 0 ? res() : rej(new Error(`${cmd} exited ${code}`))))
  })
}

const SOCIAL_FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=block">'

function socialHtml(width: number, height: number, lockupWidth: number, opts: { tagline?: boolean; url?: boolean; align?: 'center' | 'right' } = {}) {
  const align = opts.align ?? 'center'
  return `<!doctype html><html><head>${SOCIAL_FONTS}<style>
    html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}
    body{background:radial-gradient(ellipse 60% 80% at 50% 115%,rgba(255,77,0,.22) 0%,transparent 70%),${C.ink};display:flex;flex-direction:column;justify-content:center;align-items:${align === 'center' ? 'center' : 'flex-end'};padding:0 ${align === 'right' ? Math.round(width * 0.08) : 0}px;box-sizing:border-box;gap:${Math.round(lockupWidth * 0.05)}px;font-family:'JetBrains Mono',monospace}
    .lockup svg{display:block;width:${lockupWidth}px;height:auto}
    .tag{color:${C.muted};font-size:${Math.round(lockupWidth * 0.026)}px;letter-spacing:.32em;text-transform:uppercase}
    .url{position:absolute;left:${Math.round(width * 0.04)}px;bottom:${Math.round(height * 0.06)}px;color:${C.muted};font-size:${Math.round(width * 0.013)}px}
  </style></head><body>
    <div class="lockup">${lockupSvg('on-dark')}</div>
    ${opts.tagline ? '<div class="tag">We forge the future</div>' : ''}
    ${opts.url ? '<div class="url">flintworks.hu</div>' : ''}
  </body></html>`
}

async function main() {
  // Only the generated folders are wiped, so the hand-written README survives a rebuild.
  for (const dir of ['logo', 'favicon', 'social', 'animation', 'badge']) rmSync(join(OUT, dir), { recursive: true, force: true })
  mkdirSync(OUT, { recursive: true })
  const lockAspect = LOCK_W / 92
  const [, , stackW, stackH] = STACK_VIEWBOX.split(' ').map(Number)

  console.log('SVG')
  for (const k of Object.keys(STYLES) as StyleKey[]) {
    write(`logo/svg/flintworks-mark-${k}.svg`, markSvg(k))
    write(`logo/svg/flintworks-logo-${k}.svg`, lockupSvg(k))
    write(`logo/svg/flintworks-logo-stacked-${k}.svg`, stackedSvg(k))
    write(`logo/svg/flintworks-wordmark-${k}.svg`, wordmarkSvg(k))
  }

  const cdp = await launchChrome()
  try {
    const R = await makeRenderer(cdp)

    console.log('PNG')
    for (const k of Object.keys(STYLES) as StyleKey[]) {
      const markHeights = k === 'on-dark' || k === 'on-light' ? [256, 512, 1024] : [1024]
      for (const h of markHeights) write(`logo/png/flintworks-mark-${k}-${h}.png`, await R.png(markSvg(k), Math.round((h * 52) / 92), h))
      const lockWidths = k === 'on-dark' || k === 'on-light' ? [800, 1600, 3200] : [1600]
      for (const w of lockWidths) write(`logo/png/flintworks-logo-${k}-${w}w.png`, await R.png(lockupSvg(k), w, Math.round(w / lockAspect)))
      write(`logo/png/flintworks-logo-stacked-${k}-1200w.png`, await R.png(stackedSvg(k), 1200, Math.round((1200 * stackH) / stackW)))
    }

    console.log('Favicons & app icons')
    write('favicon/favicon.svg', faviconSvg())
    const roundTile = tileSvg(C.ink, 0.74, 22)
    const icoImages = []
    for (const size of [16, 32, 48]) icoImages.push({ size, data: await R.png(roundTile, size, size) })
    write('favicon/favicon.ico', ico(icoImages))
    write('favicon/apple-touch-icon.png', await R.png(tileSvg(C.ink, 0.62), 180, 180))
    write('favicon/icon-192.png', await R.png(roundTile, 192, 192))
    write('favicon/icon-512.png', await R.png(roundTile, 512, 512))
    write('favicon/icon-maskable-512.png', await R.png(tileSvg(C.ink, 0.52), 512, 512))
    write(
      'favicon/site.webmanifest',
      JSON.stringify(
        {
          name: 'Flintworks',
          short_name: 'Flintworks',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          theme_color: C.ink,
          background_color: C.ink,
          display: 'standalone',
        },
        null,
        2,
      ) + '\n',
    )
    write(
      'favicon/head-snippet.html',
      `<!-- Put the favicon/ files in your site's public root, then add this to <head>: -->
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${C.ink}">
`,
    )

    console.log('Social')
    write('social/og-image-1200x630.png', await R.page(socialHtml(1200, 630, 640, { tagline: true, url: true }), 1200, 630))
    write('social/linkedin-banner-1584x396.png', await R.page(socialHtml(1584, 396, 560, { tagline: true, align: 'right' }), 1584, 396))
    write('social/x-header-1500x500.png', await R.page(socialHtml(1500, 500, 620, { tagline: true }), 1500, 500))
    write('social/avatar-1080.png', await R.png(tileSvg(C.ink, 0.56), 1080, 1080))

    console.log('Animation')
    const variants: AnimVariant[] = ['knap', 'strike', 'sweep']
    for (const v of variants) for (const k of ['on-dark', 'on-light'] as const) write(`animation/flintworks-intro-${v}-${k}.svg`, animatedSvg(v, k))
    write(
      'animation/preview.html',
      `<!doctype html><html><head><meta charset="utf-8"><title>Flintworks intro animations</title>
<style>body{margin:0;padding:32px;background:#0A0A0B;color:#C4C4CF;font:14px system-ui,sans-serif}
.row{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:16px}.cell{border-radius:12px;padding:40px}
.cell img{display:block;width:100%}button{margin-bottom:24px;padding:8px 14px;border-radius:8px;border:1px solid #333;background:#111;color:#eee;cursor:pointer}</style></head>
<body><button onclick="document.querySelectorAll('img').forEach(i=>{const s=i.src;i.src='';i.src=s})">Replay</button>
${variants.map((v) => `<h3>${v}</h3><div class="row"><div class="cell" style="background:#0A0A0B;box-shadow:inset 0 0 0 1px #222"><img src="flintworks-intro-${v}-on-dark.svg" alt=""></div><div class="cell" style="background:#fff"><img src="flintworks-intro-${v}-on-light.svg" alt=""></div></div>`).join('\n')}
</body></html>
`,
    )

    // Video: pause every CSS animation, then seek frame by frame — deterministic, no dropped frames.
    const FPS = 30
    const DURATION = 2.5
    const VW = 1920
    const VH = 1080
    for (const v of variants) {
      const frames = mkdtempSync(join(tmpdir(), `fw-${v}-`))
      const markup = animatedSvg(v, 'on-dark')
      await R.load(
        `<!doctype html><html><head><style>html,body{margin:0;background:${C.ink};width:${VW}px;height:${VH}px;display:grid;place-items:center}svg{width:${Math.round(VW * 0.58)}px;height:auto}</style></head><body>${markup}</body></html>`,
        VW,
        VH,
        false,
      )
      await R.evaluate('document.getAnimations().forEach((a) => a.pause())')
      const total = Math.round(FPS * DURATION)
      for (let f = 0; f <= total; f++) {
        await R.evaluate(`document.getAnimations().forEach((a) => { a.currentTime = ${(f * 1000) / FPS} })`)
        writeFileSync(join(frames, `f${String(f).padStart(4, '0')}.png`), await R.capture(VW, VH))
      }
      const mp4 = join(OUT, `animation/flintworks-intro-${v}.mp4`)
      await run('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, 'f%04d.png'), '-vf', 'tpad=stop_mode=clone:stop_duration=1.5,format=yuv420p', '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-movflags', '+faststart', mp4])
      console.log('  ', `animation/flintworks-intro-${v}.mp4`)
      const gif = join(OUT, `animation/flintworks-intro-${v}.gif`)
      await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-vf', 'fps=25,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a', gif])
      console.log('  ', `animation/flintworks-intro-${v}.gif`)
      rmSync(frames, { recursive: true, force: true })
    }
  } finally {
    cdp.close()
  }

  console.log('Badge')
  write('badge/flintworks-badge.html', `<!-- Badge markup only. Load flintworks-badge.css on the page (or use snippet.html, which has both). -->\n${badgeHtml(BADGE_DEFAULT)}\n`)
  write('badge/flintworks-badge.css', BADGE_CSS + '\n')
  write(
    'badge/snippet.html',
    `<!-- Flintworks "built by" badge — HTML + CSS only, no JavaScript, no fonts, no external requests.
     1. Replace "your-project" in the link with the client project's name (it shows up in your analytics).
     2. Theme: change fwb--dark to fwb--light or fwb--ghost (ghost takes the footer's text colour).
     3. Size: set font-size on .fwb (default 14px). Include the <style> once per page. -->
<style>
${BADGE_CSS}
</style>
${badgeHtml(BADGE_DEFAULT)}
`,
  )
  write('badge/flintworks-badge.js', badgeJs())
  write('badge/preview.html', badgePreview())
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
