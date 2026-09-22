import { motion } from 'motion/react'
import { motionTokens, springs } from '../../lib/motion-tokens'
import { useReducedMotion } from '../../context/ReducedMotionContext'

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }, // within motion-patterns rule 5 (0.05-0.10s)
  },
}

const item = {
  hidden: { opacity: 0, y: motionTokens.distance.md },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
}

const itemReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: motionTokens.duration.fast } },
}

/**
 * Wraps a grid/list of cards (course grid, career cards, stat tiles) so
 * they enter as a wave rather than all at once. Used with <StaggerItem>
 * around each direct child.
 */
export function StaggerGroup({ as = 'div', className, children }) {
  const Component = motion[as] ?? motion.div
  return (
    <Component className={className} variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
      {children}
    </Component>
  )
}

export function StaggerItem({ as = 'div', className, children }) {
  const reduced = useReducedMotion()
  const Component = motion[as] ?? motion.div
  return (
    <Component className={className} variants={reduced ? itemReduced : item}>
      {children}
    </Component>
  )
}
