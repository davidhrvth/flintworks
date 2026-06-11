import type { ReactNode, ElementType } from 'react'

interface GradientTextProps {
  children: ReactNode
  className?: string
  as?: ElementType
}

export function GradientText({ children, className = '', as: Tag = 'span' }: GradientTextProps) {
  return (
    <Tag className={`text-ember-gradient ${className}`}>
      {children}
    </Tag>
  )
}
