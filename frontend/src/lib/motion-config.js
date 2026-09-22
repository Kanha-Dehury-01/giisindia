import { motionTokens } from './motion-tokens'

// Runtime gates for whether motion should run at all. Reduced-motion is
// read from the app's single ReducedMotionContext (src/context/
// ReducedMotionContext.jsx), not re-queried here, to keep exactly one
// source of truth per docs/ARCHITECTURE.md §J. `isLowEnd` is the one
// additional signal this module owns (device capability, not a user
// preference, so it doesn't belong in that context).
export const motionConfig = {
  isLowEnd() {
    return typeof navigator !== 'undefined' && navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4
  },

  shouldAnimate({ reducedMotion, essential = false } = {}) {
    if (reducedMotion) return false
    if (!essential && this.isLowEnd()) return false
    return true
  },

  duration({ reducedMotion } = {}) {
    return reducedMotion || this.isLowEnd() ? motionTokens.duration.instant : motionTokens.duration.normal
  },
}
