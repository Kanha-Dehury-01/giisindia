import { motion } from 'motion/react'
import { motionTokens } from '../../lib/motion-tokens'
import { useReducedMotion } from '../../context/ReducedMotionContext'

/**
 * Fades + rises an element into view once, on scroll. This is the ONLY
 * scroll-reveal implementation in the app — every homepage section wraps
 * its content in this rather than each rolling its own whileInView call
 * (motion-patterns rule 7/8: once:true, tokens only).
 */
export default function RevealOnScroll({ children, as = 'div', distance = motionTokens.distance.lg, delay = 0, className }) {
  const reduced = useReducedMotion()
  const Component = motion[as] ?? motion.div

  if (reduced) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth, delay }}
    >
      {children}
    </Component>
  )
}
