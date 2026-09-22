import { useEffect, useRef } from 'react'
import { animate } from 'motion'
import { motionTokens } from '../../lib/motion-tokens'
import { useReducedMotion } from '../../context/ReducedMotionContext'

/**
 * Counts up to `to` once. Only meaningful for genuinely numeric stats —
 * callers must check `Number.isFinite` before rendering this (see
 * StatTile.jsx) rather than trying to animate a placeholder string like
 * "[UPDATE BEFORE LAUNCH]".
 */
export default function AnimatedCounter({ to, suffix = '' }) {
  const nodeRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !nodeRef.current) {
      if (nodeRef.current) nodeRef.current.textContent = `${to}${suffix}`
      return undefined
    }
    const controls = animate(0, to, {
      duration: motionTokens.duration.crawl,
      ease: motionTokens.easing.smooth,
      onUpdate: (value) => {
        if (nodeRef.current) nodeRef.current.textContent = `${Math.round(value)}${suffix}`
      },
    })
    return () => controls.stop()
  }, [to, suffix, reduced])

  return <span ref={nodeRef}>0{suffix}</span>
}
