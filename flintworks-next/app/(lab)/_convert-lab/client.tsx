'use client'

import type { ComponentType } from 'react'
import { TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Checkout } from '@/components/convert-lab/Checkout'
import { LeakyFunnel } from '@/components/convert-lab/LeakyFunnel'
import { GrowthCurve } from '@/components/sections/GrowthCurve'
import { AttentionHeatmap } from '@/components/convert-lab/AttentionHeatmap'
import { WordOfMouth } from '@/components/convert-lab/WordOfMouth'

// Side-by-side candidates for the home page's "03 Designed to convert" panel, each in the same
// row layout and card as the live page so they can be judged in place.

const OPTIONS: { name: string; hint: string; Visual: ComponentType }[] = [
  {
    name: 'Checkout',
    hint: 'The buy button leans toward your cursor. Click to buy. When you leave, a ghost shopper takes over.',
    Visual: Checkout,
  },
  {
    name: 'Plug the leaks',
    hint: 'Hover over a leak to weld it shut and watch more of the flow reach the end. Click to seal one instantly.',
    Visual: LeakyFunnel,
  },
  {
    name: 'Bend the curve',
    hint: 'Picked. A live chart that never stops. Hover to slow it and read it; click to ship an improvement now.',
    Visual: GrowthCurve,
  },
  {
    name: 'Attention heatmap',
    hint: 'Your cursor leaves heat, and all of it drifts to the button. Click the button to convert.',
    Visual: AttentionHeatmap,
  },
  {
    name: 'Word of mouth',
    hint: 'You are the spark. Touch a person to win a customer, then watch them tell their friends. Click for a bigger spark.',
    Visual: WordOfMouth,
  },
]

export default function ConvertLab() {
  const { t } = useTranslation()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <header className="max-w-2xl mb-16">
        <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember mb-4 block">
          Visual lab
        </span>
        <h1 className="font-display font-bold text-4xl lg:text-5xl text-text-heading mb-4">03 · Designed to convert</h1>
        <p className="text-text-body text-lg leading-relaxed">
          Five candidates for the home page panel, each at its real size next to the real copy. Move your
          cursor over them. If you leave them alone, they play by themselves.
        </p>
      </header>

      <div className="space-y-24">
        {OPTIONS.map(({ name, hint, Visual }, i) => (
          <section key={name}>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-8 pb-4 border-b border-border">
              <span className="font-mono text-sm text-ember">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="font-display font-bold text-xl text-text-heading">{name}</h2>
              <p className="text-sm text-text-muted">{hint}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span
                    className="font-display font-bold text-7xl lg:text-8xl select-none pointer-events-none"
                    style={{ color: 'rgba(255,77,0,0.06)' }}
                    aria-hidden="true"
                  >
                    03
                  </span>
                  <div className="p-2.5 rounded-lg bg-ember/10 border border-ember/20">
                    <TrendingUp size={20} className="text-ember" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-3xl lg:text-4xl text-text-heading mb-4">
                  {t('home.whyFlintworks.items.03.title')}
                </h3>
                <p className="text-text-body text-lg leading-relaxed max-w-lg">
                  {t('home.whyFlintworks.items.03.body')}
                </p>
              </div>
              <div
                className="relative overflow-hidden glass rounded-xl border border-border/50 h-48 lg:h-56"
                aria-hidden="true"
              >
                <Visual />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
