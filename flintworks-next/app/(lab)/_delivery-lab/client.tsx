'use client'

import type { ComponentType } from 'react'
import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Bullseye } from '@/components/delivery-lab/Bullseye'
import { CalendarStamp } from '@/components/delivery-lab/CalendarStamp'
import { ChecklistPen } from '@/components/delivery-lab/ChecklistPen'
import { MilestoneRail } from '@/components/delivery-lab/MilestoneRail'
import { DeliveryTracker } from '@/components/sections/DeliveryTracker'
import { ShopBuild } from '@/components/delivery-lab/ShopBuild'
import { VanDelivery } from '@/components/delivery-lab/VanDelivery'

// Side-by-side candidates for the home page's "02 Delivered on time" panel, each in the same
// row layout and card as the live page so they can be judged in place.

const OPTIONS: { name: string; hint: string; Visual: ComponentType }[] = [
  { name: 'Milestone rail', hint: 'Slide along the track to scrub. Click for sparks.', Visual: MilestoneRail },
  { name: 'Delivery tracker', hint: 'Hover a step to send the order there. Click to celebrate.', Visual: DeliveryTracker },
  { name: 'Calendar & stamp', hint: 'Click the pad to tear off a day, or click a date to jump to it.', Visual: CalendarStamp },
  { name: 'Van pulls up to the shop', hint: 'The van drives to your cursor. Park it to open the shop. Click to honk.', Visual: VanDelivery },
  { name: 'Shop builds itself', hint: 'Your cursor is a welding torch. Touch the blueprint to build. Click when done to clear.', Visual: ShopBuild },
  { name: 'Checklist', hint: 'The pencil is your cursor. Click a row to tick it.', Visual: ChecklistPen },
  { name: 'Bullseye', hint: 'The target follows your cursor; arrows still find the middle. Click to fire.', Visual: Bullseye },
]

export default function DeliveryLab() {
  const { t } = useTranslation()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <header className="max-w-2xl mb-16">
        <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember mb-4 block">
          Visual lab
        </span>
        <h1 className="font-display font-bold text-4xl lg:text-5xl text-text-heading mb-4">02 · Delivered on time</h1>
        <p className="text-text-body text-lg leading-relaxed">
          Seven candidates for the home page panel, each at its real size next to the real copy. Move your
          cursor over them; leave them alone and they play by themselves.
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
              <div className="lg:order-2">
                <div className="flex items-center gap-4 mb-4">
                  <span
                    className="font-display font-bold text-7xl lg:text-8xl select-none pointer-events-none"
                    style={{ color: 'rgba(255,77,0,0.06)' }}
                    aria-hidden="true"
                  >
                    02
                  </span>
                  <div className="p-2.5 rounded-lg bg-ember/10 border border-ember/20">
                    <Clock size={20} className="text-ember" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-3xl lg:text-4xl text-text-heading mb-4">
                  {t('home.whyFlintworks.items.02.title')}
                </h3>
                <p className="text-text-body text-lg leading-relaxed max-w-lg">
                  {t('home.whyFlintworks.items.02.body')}
                </p>
              </div>
              <div
                className="relative overflow-hidden glass rounded-xl border border-border/50 h-48 lg:h-56 lg:order-1"
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
