import type { ReactNode } from 'react'

type BadgeVariant = 'ember' | 'surface' | 'muted' | 'coming-soon' | 'in-dev'

interface EmberBadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  ember: 'bg-ember text-white',
  surface: 'bg-surface border border-border text-text-body',
  muted: 'bg-border text-text-muted',
  'coming-soon': 'bg-border/80 text-text-muted border border-border',
  'in-dev': 'bg-ember/10 text-ember border border-ember/30',
}

export function EmberBadge({ children, variant = 'ember', className = '' }: EmberBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
