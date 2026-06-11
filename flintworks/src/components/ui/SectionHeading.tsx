import type { ReactNode } from 'react'
import { AnimatedSection } from './AnimatedSection'

interface SectionHeadingProps {
  eyebrow?: string
  heading: ReactNode
  subtext?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  eyebrow,
  heading,
  subtext,
  align = 'left',
  className = '',
}: SectionHeadingProps) {
  return (
    <AnimatedSection className={`mb-12 ${align === 'center' ? 'text-center' : ''} ${className}`}>
      {eyebrow && (
        <p className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-ember mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-heading leading-tight">
        {heading}
      </h2>
      {subtext && (
        <p className="mt-4 text-text-body text-lg max-w-2xl leading-relaxed">
          {subtext}
        </p>
      )}
    </AnimatedSection>
  )
}
