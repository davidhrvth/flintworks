import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowOnHover?: boolean
  onClick?: () => void
}

export function GlowCard({
  children,
  className = '',
  glowOnHover = true,
  onClick,
}: GlowCardProps) {
  return (
    <motion.div
      className={`glass rounded-xl border border-white/5 transition-all duration-300 ${
        glowOnHover ? 'hover:border-ember/20 ember-glow-hover' : ''
      } ${className}`}
      whileHover={glowOnHover ? { scale: 1.01, y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      {children}
    </motion.div>
  )
}
