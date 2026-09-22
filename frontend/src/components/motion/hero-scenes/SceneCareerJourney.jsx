import { motion } from 'motion/react'
import { motionTokens } from '../../../lib/motion-tokens'

const STEPS = [
  { x: 25, label: 'Learn' },
  { x: 70, label: 'Practice' },
  { x: 115, label: 'Certify' },
  { x: 160, label: 'Career' },
]

/**
 * Slide 3 — "Learn. Practice. Certify. Build your career."
 * A horizontal path draws left to right, with a marker landing on each
 * step in sequence, ending on a career/badge glyph.
 */
export default function SceneCareerJourney({ reduced }) {
  return (
    <svg viewBox="0 0 220 220" className="h-full w-full" role="img" aria-label="Learning path progressing from learning to career">
      {reduced ? (
        <line x1="25" y1="130" x2="160" y2="130" stroke="var(--gold-400)" strokeWidth="2" opacity="0.5" />
      ) : (
        <motion.line
          x1="25"
          y1="130"
          x2="160"
          y2="130"
          stroke="var(--gold-400)"
          strokeWidth="2"
          opacity="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: motionTokens.duration.crawl, ease: motionTokens.easing.smooth }}
        />
      )}

      {STEPS.map((step, i) => (
        <g key={step.label}>
          {reduced ? (
            <circle cx={step.x} cy="130" r={i === STEPS.length - 1 ? 12 : 8} fill={i === STEPS.length - 1 ? 'var(--gold-400)' : 'var(--navy-800)'} stroke="var(--gold-400)" strokeWidth="2" />
          ) : (
            <motion.circle
              cx={step.x}
              cy="130"
              r={i === STEPS.length - 1 ? 12 : 8}
              fill={i === STEPS.length - 1 ? 'var(--gold-400)' : 'var(--navy-800)'}
              stroke="var(--gold-400)"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: motionTokens.duration.normal, delay: 0.3 + i * 0.3, ease: motionTokens.easing.bounce }}
              style={{ transformOrigin: `${step.x}px 130px` }}
            />
          )}
          <text x={step.x} y="160" textAnchor="middle" fontSize="11" fill="var(--slate-400)" fontFamily="var(--font-body)">
            {step.label}
          </text>
        </g>
      ))}

      {/* Career badge above the final step */}
      {reduced ? (
        <path d="M160 90 L172 96 V110 C172 118 167 124 160 128 C153 124 148 118 148 110 V96 Z" fill="var(--navy-800)" stroke="var(--gold-400)" strokeWidth="2" />
      ) : (
        <motion.path
          d="M160 90 L172 96 V110 C172 118 167 124 160 128 C153 124 148 118 148 110 V96 Z"
          fill="var(--navy-800)"
          stroke="var(--gold-400)"
          strokeWidth="2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.duration.normal, delay: 1.4, ease: motionTokens.easing.smooth }}
        />
      )}
    </svg>
  )
}
