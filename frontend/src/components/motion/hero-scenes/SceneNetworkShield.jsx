import { motion } from 'motion/react'
import { motionTokens } from '../../../lib/motion-tokens'

const NODES = [
  { x: 40, y: 60 },
  { x: 100, y: 30 },
  { x: 160, y: 70 },
  { x: 70, y: 130 },
  { x: 150, y: 140 },
  { x: 110, y: 100 },
]

const LINKS = [
  [0, 1],
  [1, 2],
  [0, 3],
  [3, 5],
  [2, 4],
  [5, 4],
  [1, 5],
]

/**
 * Slide 1 — "Build the skills to defend the digital world."
 * Network nodes light up, data flows along the links, then a shield
 * forms at the center as the links converge. Reduced motion renders the
 * completed shield with static nodes — nothing is hidden, just not
 * animated (docs/ARCHITECTURE.md §J).
 */
export default function SceneNetworkShield({ reduced }) {
  return (
    <svg viewBox="0 0 220 220" className="h-full w-full" role="img" aria-label="Network nodes converging into a shield">
      <g stroke="var(--gold-400)" strokeWidth="1" opacity="0.5">
        {LINKS.map(([a, b], i) => {
          const from = NODES[a]
          const to = NODES[b]
          return reduced ? (
            <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
          ) : (
            <motion.line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: motionTokens.duration.slow, delay: 0.15 + i * 0.06, ease: motionTokens.easing.smooth }}
            />
          )
        })}
      </g>

      <g>
        {NODES.map((node, i) =>
          reduced ? (
            <circle key={i} cx={node.x} cy={node.y} r="5" fill="var(--gold-400)" />
          ) : (
            <motion.circle
              key={i}
              cx={node.x}
              cy={node.y}
              r="5"
              fill="var(--gold-400)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: motionTokens.duration.normal, delay: i * 0.08, ease: motionTokens.easing.bounce }}
            />
          ),
        )}
      </g>

      {/* Shield forms at the network's center once the links have connected */}
      {reduced ? (
        <path
          d="M110 95 L145 108 V140 C145 165 130 182 110 190 C90 182 75 165 75 140 V108 Z"
          fill="var(--navy-800)"
          stroke="var(--gold-400)"
          strokeWidth="2"
        />
      ) : (
        <motion.path
          d="M110 95 L145 108 V140 C145 165 130 182 110 190 C90 182 75 165 75 140 V108 Z"
          fill="var(--navy-800)"
          stroke="var(--gold-400)"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: motionTokens.duration.slow, delay: 0.9, ease: motionTokens.easing.smooth }}
          style={{ transformOrigin: '110px 140px' }}
        />
      )}
      <path d="M110 118 L124 126 V142 C124 152 118 159 110 163 C102 159 96 152 96 142 V126 Z" fill="none" stroke="var(--gold-400)" strokeWidth="1.5" opacity={reduced ? 1 : undefined} />
    </svg>
  )
}
