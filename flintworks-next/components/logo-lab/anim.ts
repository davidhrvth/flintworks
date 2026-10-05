// Intro animation definitions — pure CSS strings so both the React lab and the brand-kit build use them.

export type AnimVariant = 'knap' | 'strike' | 'sweep'

export const ANIM_VARIANTS: { key: AnimVariant; name: string; note: string }[] = [
  { key: 'knap', name: 'Knap', note: 'The flakes fly back together into the stone, the last one lands and catches fire.' },
  { key: 'strike', name: 'Strike', note: 'The stone is there, cold. A spark streaks in, hits the edge — the face ignites and the mark jolts.' },
  { key: 'sweep', name: 'Sweep', note: 'Faces click in one by one, clockwise, a highlight glints across, then the ember lights.' },
]

// Per-variant timing: --ig is when the ember facet ignites, --wt is when the name starts writing.
export const ANIM_CSS = `
.fwa{display:inline-flex;align-items:center}
.fwa:not([data-play]){visibility:hidden}
.fwa *{transform-box:fill-box;transform-origin:center}
.fwa[data-v=knap]{--ig:1.1s;--wt:1.2s}
.fwa[data-v=strike]{--ig:.8s;--wt:1s}
.fwa[data-v=sweep]{--ig:1.2s;--wt:1.15s}
.fwa-hot,.fwa-glow,.fwa-burst,.fwa-p,.fwa-striker{opacity:0}
.fwa[data-play] .fwa-ember{animation:fwa-in .35s ease-out var(--ig) both}
.fwa[data-play] .fwa-hot{animation:fwa-flash .6s ease-out var(--ig) both}
.fwa[data-play] .fwa-glow{animation:fwa-flash 1.1s ease-out var(--ig) both}
.fwa[data-play] .fwa-burst{animation:fwa-burst .65s ease-out var(--ig) both}
.fwa[data-play] .fwa-p{animation:fwa-particle .75s cubic-bezier(.2,.8,.3,1) var(--ig) both}

.fwa[data-play][data-v=knap] .fwa-f{animation:fwa-knap .7s cubic-bezier(.2,1.3,.35,1) calc(var(--i) * 70ms) both}

.fwa[data-play][data-v=strike] .fwa-f{animation:fwa-in .4s ease-out calc(var(--i) * 40ms) both}
.fwa[data-play][data-v=strike] .fwa-striker{animation:fwa-strike .5s cubic-bezier(.5,0,.9,.4) .3s both,fwa-out .1s linear .8s forwards}
.fwa[data-play][data-v=strike] .fwa-body{animation:fwa-shake .3s linear var(--ig) both}

.fwa[data-play][data-v=sweep] .fwa-f{animation:fwa-pop .45s cubic-bezier(.3,1.5,.5,1) calc(var(--i) * 70ms) both}
.fwa[data-play][data-v=sweep] .fwa-sheen{animation:fwa-sheen .75s ease-in-out .6s both}

.fwa[data-play][data-w=wide] .fwa-l{animation:fwa-letter .55s cubic-bezier(.2,.8,.2,1) calc(var(--wt) + var(--j) * 45ms) both}
.fwa[data-play][data-w=terminal] .fwa-l{animation:fwa-in 1ms step-end calc(var(--wt) + var(--j) * 60ms) both}
.fwa[data-play][data-w=terminal] .fwa-cursor{animation:fwa-type 600ms steps(10,start) var(--wt) both,fwa-blink 1.1s steps(1) calc(var(--wt) + 900ms) infinite}

@keyframes fwa-in{from{opacity:0}to{opacity:1}}
@keyframes fwa-out{to{opacity:0}}
@keyframes fwa-flash{0%{opacity:0}15%{opacity:.95}100%{opacity:0}}
@keyframes fwa-burst{0%{opacity:0;transform:scale(0) rotate(0)}25%{opacity:1;transform:scale(1.2) rotate(30deg)}100%{opacity:0;transform:scale(.3) rotate(80deg)}}
@keyframes fwa-particle{0%{opacity:0;transform:none}10%{opacity:1}100%{opacity:0;transform:translate(var(--px),var(--py)) scale(.3)}}
@keyframes fwa-knap{from{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(var(--r)) scale(.85)}to{opacity:1;transform:none}}
@keyframes fwa-strike{0%{opacity:0;transform:translate(38px,-80px) scale(.5) rotate(-120deg)}20%{opacity:1}100%{opacity:1;transform:none}}
@keyframes fwa-shake{0%,100%{transform:none}25%{transform:translate(-1.5px,1px)}50%{transform:translate(1.5px,-1px)}75%{transform:translate(-1px,0)}}
@keyframes fwa-pop{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:none}}
@keyframes fwa-sheen{from{transform:translateX(0)}to{transform:translateX(170px)}}
@keyframes fwa-letter{from{opacity:0;transform:translateY(320px)}to{opacity:1;transform:none}}
@keyframes fwa-type{from{transform:translateX(-6000px)}to{transform:none}}
@keyframes fwa-blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.fwa *{animation:none!important}.fwa-hot,.fwa-glow,.fwa-burst,.fwa-p,.fwa-striker{display:none}}
`
