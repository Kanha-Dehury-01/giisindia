import { motion } from 'motion/react'
import { motionTokens } from '../../../lib/motion-tokens'

const CENTER = { x: 110, y: 110 }
const RINGS = [40, 65, 92]

// Threats sit at varying angles/radii; each is "swept" and neutralized in
// order as the radar beam passes, telling a detect → neutralize → defend
// story in one pass (not a looping/ambient animation — motion-advanced
// rule 2 and spec §38 both rule out endless background motion here).
const THREATS = [
  { angle: -55, radius: 78, sweepDelay: 0.35 },
  { angle: 15, radius: 60, sweepDelay: 0.75 },
  { angle: 95, radius: 82, sweepDelay: 1.15 },
  { angle: 160, radius: 55, sweepDelay: 1.55 },
  { angle: 230, radius: 70, sweepDelay: 1.9 },
]

function polar(angleDeg, radius) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CENTER.x + radius * Math.cos(rad), y: CENTER.y + radius * Math.sin(rad) }
}

/**
 * Slide 1 — "Build the skills to defend the digital world."
 * A radar sweep rotates once around the field, detecting and neutralizing
 * scattered threats as it passes them, then a shield assembles at the
 * center with a bright pulse. Replaces the earlier static node-network
 * concept with a clearer detect → respond → defend narrative, in the
 * brighter gold-200/300 range for the sweep and pulse accents (still
 * "bright supporting accent," not a primary surface — spec §6).
 */
export default function SceneRadarDefense({ reduced }) {
  return (
    <svg viewBox="0 0 220 220" className="h-full w-full" role="img" aria-label="Radar sweep detecting and neutralizing threats, then a shield forming">
      <defs>
        <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--gold-200)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--gold-300)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sweep-beam" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--gold-200)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--gold-300)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="shield-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--gold-300)" />
          <stop offset="100%" stopColor="var(--gold-500)" />
        </linearGradient>
      </defs>

      {/* Radar rings */}
      <g fill="none" stroke="var(--gold-400)" strokeWidth="1" opacity="0.35">
        {RINGS.map((r) => (
          <circle key={r} cx={CENTER.x} cy={CENTER.y} r={r} />
        ))}
      </g>

      {reduced ? (
        // Reduced motion: final secured state only — rings + shield, no sweep/threats.
        <path
          d="M110 78 L148 92 V128 C148 156 132 176 110 186 C88 176 72 156 72 128 V92 Z"
          fill="url(#shield-fill)"
          stroke="var(--gold-200)"
          strokeWidth="2"
        />
      ) : (
        <>
          {/* One-shot rotating sweep beam — fades out just before the shield
              forms so it doesn't linger crossing through the final frame. */}
          <motion.g
            initial={{ rotate: -100, opacity: 1 }}
            animate={{ rotate: 240, opacity: 0 }}
            transition={{
              rotate: { duration: motionTokens.duration.crawl * 1.8, ease: motionTokens.easing.smooth },
              opacity: { duration: motionTokens.duration.normal, delay: motionTokens.duration.crawl * 1.8 - 0.2, ease: motionTokens.easing.smooth },
            }}
            style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
          >
            <path d={`M ${CENTER.x} ${CENTER.y} L ${CENTER.x + 95} ${CENTER.y - 26} A 95 95 0 0 1 ${CENTER.x + 95} ${CENTER.y + 26} Z`} fill="url(#sweep-beam)" opacity="0.5" />
            <line x1={CENTER.x} y1={CENTER.y} x2={CENTER.x + 95} y2={CENTER.y} stroke="var(--gold-200)" strokeWidth="1.5" />
          </motion.g>

          {/* Threats: appear, then flash-neutralize as the sweep reaches them */}
          {THREATS.map((threat, i) => {
            const pos = polar(threat.angle, threat.radius)
            return (
              <g key={i}>
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="4"
                  fill="var(--red-600)"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0] }}
                  transition={{
                    duration: 0.5,
                    times: [0, 0.2, 0.8, 1],
                    delay: threat.sweepDelay,
                    ease: motionTokens.easing.sharp,
                  }}
                />
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="4"
                  fill="none"
                  stroke="var(--gold-200)"
                  strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: [0, 0.9, 0], scale: [0.6, 2.2, 2.2] }}
                  transition={{ duration: 0.45, delay: threat.sweepDelay + 0.15, ease: motionTokens.easing.sharp }}
                />
              </g>
            )
          })}

          {/* Glow pulse behind the shield, once it's safe to form */}
          <motion.circle
            cx={CENTER.x}
            cy={CENTER.y}
            r="50"
            fill="url(#radar-glow)"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.8, 0.3], scale: [0.5, 1.3, 1.1] }}
            transition={{ duration: motionTokens.duration.slow, delay: 2.15, ease: motionTokens.easing.smooth }}
          />

          {/* Shield assembles at the center */}
          <motion.path
            d="M110 78 L148 92 V128 C148 156 132 176 110 186 C88 176 72 156 72 128 V92 Z"
            fill="url(#shield-fill)"
            stroke="var(--gold-200)"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: motionTokens.duration.slow, delay: 2.3, ease: motionTokens.easing.bounce }}
            style={{ transformOrigin: `${CENTER.x}px 132px` }}
          />
          <motion.path
            d="M96 130 L106 141 L126 116"
            fill="none"
            stroke="var(--navy-900)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: motionTokens.duration.normal, delay: 2.7, ease: motionTokens.easing.smooth }}
          />
        </>
      )}
    </svg>
  )
}
