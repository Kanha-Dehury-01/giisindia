import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { useReducedMotion } from '../../context/ReducedMotionContext'

/**
 * Subtle scroll-linked depth for hero background layers only (spec §9:
 * "scroll-linked movement where appropriate" — not applied broadly, per
 * §38's ban on constant/ambient motion). `speed` < 1 moves slower than
 * scroll (background), > 1 moves faster (foreground accents).
 */
export default function ParallaxLayer({ speed = 0.3, className, children }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 120 * speed])

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}
