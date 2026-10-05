import type { Metadata } from 'next'
import { Instrument_Serif, Unbounded } from 'next/font/google'
import LogoLab from './client'

// Extra faces only this page needs for the wordmark studies.
const unbounded = Unbounded({
  subsets: ['latin'],
  variable: '--font-unbounded',
  weight: ['500', '600', '700'],
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument',
  weight: '400',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Logo Lab',
  robots: { index: false, follow: false },
}

export default function LogoLabPage() {
  return (
    <div className={`${unbounded.variable} ${instrumentSerif.variable}`}>
        <LogoLab />
    </div>
  )
}
