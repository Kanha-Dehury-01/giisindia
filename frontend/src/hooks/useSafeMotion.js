import { useReducedMotion } from '../context/ReducedMotionContext'
import { motionTokens } from '../lib/motion-tokens'

/**
 * Standard enter/exit motion for any element that reveals on mount/scroll.
 * When reduced motion is preferred, the transform collapses to 0 and only
 * an opacity fade remains — per motion-foundations rule 3, transforms are
 * fully disabled, never just "toned down".
 */
export function useSafeMotion(fullY = motionTokens.distance.md) {
  const reduced = useReducedMotion()
  return {
    initial: { opacity: 0, y: reduced ? 0 : fullY },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduced ? 0 : -fullY },
    reduced,
  }
}
