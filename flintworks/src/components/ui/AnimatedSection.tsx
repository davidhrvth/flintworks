import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion()

  const directionMap = {
    up: { y: 24, x: 0 },
    down: { y: -24, x: 0 },
    left: { y: 0, x: 24 },
    right: { y: 0, x: -24 },
    none: { y: 0, x: 0 },
  }

  const { x, y } = directionMap[direction]

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y, x }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    >
      {children}
    </motion.div>
  )
}
