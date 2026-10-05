// "Built by Flintworks" badge for client sites — a self-contained HTML + CSS snippet.
// No JavaScript, no external requests, no fonts: the wordmark ships as outlined SVG.
// Collapsed it's just the mark; on hover/focus it spells out the name and links to a quote.

import { GLYPHS } from './glyphs'
import { FACETS, STRIKE_POINT } from './knapped'
import { sparkPath } from './geometry'

export type BadgeTheme = 'dark' | 'light' | 'ghost'
export type BadgeWordmark = 'wide' | 'terminal'
export type BadgeLabel = 'name' | 'quote'
export type BadgeOptions = { theme: BadgeTheme; wordmark: BadgeWordmark; label: BadgeLabel; project: string }

const EASE = 'cubic-bezier(.2,.8,.2,1)'

// Everything that happens when the badge opens. Hover, keyboard focus and the preview-only
// `fwb--open` class all trigger it; touch screens (no hover) get it permanently, unanimated.
const OPEN = ':is(:hover,:focus-visible,.fwb--open)'

const OPEN_RULES: [scope: string, sel: string, decl: string][] = [
  ['', '', 'padding-right:.8em'],
  ['', ' .fwb__reveal', 'max-width:var(--fwb-w);margin-left:.55em'],
  ['', ' .fwb__arrow', 'opacity:1;transform:none;transition-delay:.3s'],
  ['', ' .fwb__cta', 'opacity:.6;transition-delay:.35s'],
  ['.fwb--wide', ' .fwb__name path', 'opacity:1;transform:none;transition-delay:calc(60ms + var(--i) * 28ms)'],
  ['.fwb--terminal', ' .fwb__cursor', 'width:.5em;margin-left:.12em'],
]

export const BADGE_CSS = [
  `.fwb{--fwb-bg:#0A0A0B;--fwb-fg:#F0F0F5;--fwb-line:rgba(255,255,255,.1);--fwb-ember:#FF4D00;box-sizing:border-box;display:inline-flex;align-items:center;height:2.5em;padding:0 .5em;border-radius:999px;font-size:14px;line-height:1;text-decoration:none;color:var(--fwb-fg);background:var(--fwb-bg);box-shadow:inset 0 0 0 1px var(--fwb-line);vertical-align:middle;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:padding .5s ${EASE}}`,
  `.fwb *{box-sizing:border-box}`,
  `.fwb--light{--fwb-bg:#FFFFFF;--fwb-fg:#0A0A0B;--fwb-line:rgba(10,10,11,.12)}`,
  `.fwb--ghost{--fwb-bg:transparent;--fwb-fg:currentColor;--fwb-line:color-mix(in srgb,currentColor 22%,transparent);color:inherit}`,
  `.fwb:focus-visible{outline:2px solid var(--fwb-ember);outline-offset:3px}`,
  // Mark
  `.fwb__mark{width:1.5em;height:1.5em;flex:none;overflow:visible;transition:transform .55s cubic-bezier(.3,1.6,.5,1)}`,
  `.fwb__f{fill:var(--fwb-fg)}`,
  `.fwb__ember{fill:var(--fwb-ember)}`,
  `.fwb__spark{fill:var(--fwb-ember);opacity:0;transform-box:fill-box;transform-origin:center}`,
  `.fwb${OPEN} .fwb__mark{transform:rotate(-12deg)}`,
  `.fwb${OPEN} .fwb__ember{animation:fwb-ignite .6s ease-out both}`,
  `.fwb${OPEN} .fwb__spark{animation:fwb-spark .7s ease-out .05s both}`,
  // Reveal: max-width animates to --fwb-w, the content width precomputed when the snippet is generated,
  // so the pill itself grows smoothly with no JS measuring (and never overshoots, since max-width only caps).
  `.fwb__reveal{display:block;max-width:0;overflow:hidden;margin-left:0;transition:max-width .5s ${EASE},margin .5s ${EASE}}`,
  `.fwb__clip{display:flex;align-items:center;gap:.55em;width:max-content;white-space:nowrap}`,
  `.fwb__name{display:block;flex:none;overflow:visible;fill:var(--fwb-fg)}`,
  `.fwb--wide .fwb__name path{opacity:0;transform:translateY(300px);transition:opacity .2s,transform .35s ${EASE}}`,
  `.fwb__cta{font:500 .72em/1 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:.02em;color:var(--fwb-fg);opacity:0;transition:opacity .3s}`,
  `.fwb__arrow{width:.7em;height:.7em;flex:none;fill:none;stroke:var(--fwb-ember);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;opacity:0;transform:translate(-3px,3px);transition:opacity .25s,transform .35s ${EASE}}`,
  // Terminal: the track opens in one step per character, so the name types itself (and backspaces on leave).
  `.fwb--terminal .fwb__reveal{transition-timing-function:steps(var(--fwb-steps),end);transition-duration:calc(var(--fwb-steps) * 45ms)}`,
  `.fwb--terminal .fwb__cta{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;opacity:.6;transition:none}`,
  `.fwb--terminal .fwb__arrow{opacity:1;transform:none;transition:none}`,
  `.fwb__cursor{display:none}`,
  `.fwb--terminal .fwb__cursor{display:block;flex:none;width:0;height:1.05em;margin-left:0;background:var(--fwb-ember)}`,
  `.fwb--terminal${OPEN} .fwb__cursor{animation:fwb-blink 1s steps(1) calc(var(--fwb-steps) * 45ms) infinite}`,
  ...OPEN_RULES.map(([scope, sel, decl]) => `.fwb${scope}${OPEN}${sel}{${decl}}`),
  `@media (hover:none){${OPEN_RULES.map(([scope, sel, decl]) => `.fwb${scope}${sel}{${decl.replace(/;?transition-delay:[^;]+/, '')}}`).join('')}}`,
  `@media (prefers-reduced-motion:reduce){.fwb,.fwb *{transition-duration:0s!important;transition-delay:0s!important;animation:none!important}}`,
  `@keyframes fwb-ignite{0%{fill:#FFE1C2}100%{fill:var(--fwb-ember)}}`,
  `@keyframes fwb-spark{0%{opacity:0;transform:scale(0) rotate(0)}30%{opacity:1;transform:scale(1.15) rotate(45deg)}100%{opacity:0;transform:scale(.2) rotate(90deg)}}`,
  `@keyframes fwb-blink{50%{opacity:0}}`,
].join('\n')

export const BADGE_URL = 'https://flintworks.hu/'

export function badgeHref(project: string) {
  const source = project.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'client-site'
  return `${BADGE_URL}?utm_source=${source}&utm_medium=badge&utm_campaign=built-by`
}

const NAME_HEIGHT: Record<BadgeWordmark, number> = { wide: 0.68, terminal: 0.82 }
const CTA_TEXT: Record<BadgeWordmark, string> = { wide: '· Get a quote', terminal: '// get a quote' }
// Generous per-character advance for the CTA's system font (in em of the CTA's own size). Overestimating
// only makes the reveal finish a touch early; underestimating would clip the arrow.
const CTA_ADVANCE: Record<BadgeWordmark, number> = { wide: 0.6, terminal: 0.62 }
const CTA_SIZE = 0.72
const GAP = 0.55
const ARROW = 0.7

export function badgeHtml({ theme, wordmark, label, project }: BadgeOptions, open = false) {
  const g = GLYPHS[wordmark]
  const [x0, y0, x1, y1] = g.bbox
  const h = NAME_HEIGHT[wordmark]
  const w = Math.round(((h * (x1 - x0)) / (y1 - y0)) * 100) / 100
  const facets = FACETS.map((f) =>
    f.ember ? `<path class="fwb__ember" d="${f.d}"/>` : `<path class="fwb__f" fill-opacity="${f.tone}" d="${f.d}"/>`,
  ).join('')
  const spark = `<path class="fwb__spark" d="${sparkPath(STRIKE_POINT[0], STRIKE_POINT[1], 13, 13, 0.2)}"/>`
  const letters = g.letters.map((l, i) => `<path style="--i:${i}" d="${l.d}"/>`).join('')
  const cta = label === 'quote' ? `<span class="fwb__cta">${CTA_TEXT[wordmark]}</span>` : ''
  const ctaWidth = label === 'quote' ? GAP + CTA_TEXT[wordmark].length * CTA_ADVANCE[wordmark] * CTA_SIZE : 0
  const revealWidth = Math.ceil((w + ctaWidth + GAP + ARROW) * 100) / 100
  // Rough character count so the terminal variant types roughly one character per step.
  const steps = g.letters.length + 2 + (label === 'quote' ? CTA_TEXT[wordmark].length : 0)
  const classes = ['fwb', `fwb--${theme}`, `fwb--${wordmark}`, open && 'fwb--open'].filter(Boolean).join(' ')
  return [
    `<a class="${classes}" href="${badgeHref(project)}" target="_blank" rel="noopener" aria-label="Built by Flintworks — like this site? Get a quote" style="--fwb-steps:${steps};--fwb-w:${revealWidth}em">`,
    `<svg class="fwb__mark" viewBox="0 0 100 100" aria-hidden="true">${facets}${spark}</svg>`,
    `<span class="fwb__reveal"><span class="fwb__clip">`,
    `<svg class="fwb__name" viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" style="width:${w}em;height:${h}em" aria-hidden="true">${letters}</svg>`,
    cta,
    `<svg class="fwb__arrow" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9L9 3M4.5 3H9V7.5"/></svg>`,
    `</span></span>`,
    `<span class="fwb__cursor" aria-hidden="true"></span>`,
    `</a>`,
  ].join('')
}

export function badgeSnippet(o: BadgeOptions) {
  return [
    `<!-- Flintworks "built by" badge · HTML + CSS only, no JS, no external requests.`,
    `     Theme: swap fwb--${o.theme} for fwb--dark | fwb--light | fwb--ghost (ghost inherits your text colour).`,
    `     Size: set font-size on .fwb (default 14px). Include the <style> once per page. -->`,
    `<style>`,
    BADGE_CSS,
    `</style>`,
    badgeHtml(o),
  ].join('\n')
}
