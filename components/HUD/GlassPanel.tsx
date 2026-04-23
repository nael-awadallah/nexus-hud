'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  label?: string
  style?: React.CSSProperties
  delay?: number
}

export default function GlassPanel({
  children,
  className = '',
  label,
  style,
  delay = 0,
}: GlassPanelProps) {
  return (
    <motion.div
      className={`glass-panel ${className}`}
      style={style}
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.012 }}
    >
      {label && <div className="panel-label">{label}</div>}
      {children}
    </motion.div>
  )
}
