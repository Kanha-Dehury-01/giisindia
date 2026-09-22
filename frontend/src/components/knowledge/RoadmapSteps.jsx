import { motion } from 'motion/react'
import { motionTokens } from '../../lib/motion-tokens'
import { useReducedMotion } from '../../context/ReducedMotionContext'

/**
 * Visual step roadmap for career progressions and learning paths (spec
 * §19/§20). A connecting line draws on once as the steps reveal in
 * sequence — not an ambient/looping animation, just a one-time entrance
 * tied to scroll (motion-patterns rule 7: viewport once:true).
 */
export default function RoadmapSteps({ steps }) {
  const reduced = useReducedMotion()

  return (
    <ol className="relative">
      <div aria-hidden="true" className="absolute top-0 bottom-0 left-[15px] w-px bg-border md:left-[19px]" />
      {steps.map((step, i) => (
        <motion.li
          key={i}
          className="relative flex gap-5 pb-8 last:pb-0"
          initial={reduced ? { opacity: 1 } : { opacity: 0, x: -motionTokens.distance.md }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: motionTokens.duration.normal, delay: reduced ? 0 : i * 0.08, ease: motionTokens.easing.smooth }}
        >
          <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xs font-bold text-text-inverse md:h-10 md:w-10">
            {i + 1}
          </span>
          <div className="pt-1">
            <h3 className="text-base">{step.step_title ?? step.step}</h3>
            <p className="mt-1 text-sm text-text-muted">{step.step_description ?? step.description}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  )
}
