import { motion } from 'motion/react'
import { motionTokens } from '../../../lib/motion-tokens'

/**
 * Slide 2 — "Learn cybersecurity beyond the classroom."
 * A terminal window draws on, command lines type in sequence (as
 * staggered bars, not literal text — keeps it abstract/technical rather
 * than a gimmick), then a lock icon confirms the system is secured.
 */
export default function SceneStudentTerminal({ reduced }) {
  const lines = [0, 1, 2, 3]

  return (
    <svg viewBox="0 0 220 220" className="h-full w-full" role="img" aria-label="Terminal session securing a system">
      {reduced ? (
        <rect x="30" y="40" width="160" height="110" rx="8" fill="var(--navy-800)" stroke="var(--gold-400)" strokeWidth="2" />
      ) : (
        <motion.rect
          x="30"
          y="40"
          width="160"
          height="110"
          rx="8"
          fill="var(--navy-800)"
          stroke="var(--gold-400)"
          strokeWidth="2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
        />
      )}

      {/* Window chrome dots */}
      <circle cx="42" cy="52" r="3" fill="var(--gold-400)" opacity="0.7" />
      <circle cx="52" cy="52" r="3" fill="var(--gold-400)" opacity="0.5" />
      <circle cx="62" cy="52" r="3" fill="var(--gold-400)" opacity="0.3" />

      <g>
        {lines.map((i) =>
          reduced ? (
            <rect key={i} x="42" y={68 + i * 16} width={100 - i * 14} height="6" rx="3" fill="var(--gold-400)" opacity="0.6" />
          ) : (
            <motion.rect
              key={i}
              x="42"
              y={68 + i * 16}
              height="6"
              rx="3"
              fill="var(--gold-400)"
              opacity="0.6"
              initial={{ width: 0 }}
              animate={{ width: 100 - i * 14 }}
              transition={{ duration: motionTokens.duration.normal, delay: 0.3 + i * 0.15, ease: motionTokens.easing.sharp }}
            />
          ),
        )}
      </g>

      {/* Lock badge confirming the secured system, appears after the "typing" completes */}
      <g>
        {reduced ? (
          <>
            <circle cx="165" cy="165" r="26" fill="var(--navy-900)" stroke="var(--gold-400)" strokeWidth="2" />
            <rect x="156" y="163" width="18" height="14" rx="2" fill="var(--gold-400)" />
            <path d="M160 163 V157 a5 5 0 0 1 10 0 V163" fill="none" stroke="var(--gold-400)" strokeWidth="2.5" />
          </>
        ) : (
          <motion.g
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: motionTokens.duration.normal, delay: 1.1, ease: motionTokens.easing.bounce }}
            style={{ transformOrigin: '165px 165px' }}
          >
            <circle cx="165" cy="165" r="26" fill="var(--navy-900)" stroke="var(--gold-400)" strokeWidth="2" />
            <rect x="156" y="163" width="18" height="14" rx="2" fill="var(--gold-400)" />
            <path d="M160 163 V157 a5 5 0 0 1 10 0 V163" fill="none" stroke="var(--gold-400)" strokeWidth="2.5" />
          </motion.g>
        )}
      </g>
    </svg>
  )
}
