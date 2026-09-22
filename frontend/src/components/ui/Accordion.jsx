import { useId, useState } from 'react'
import { motion } from 'motion/react'
import { motionTokens } from '../../lib/motion-tokens'
import { useReducedMotion } from '../../context/ReducedMotionContext'

/**
 * Single accessible accordion item: native disclosure semantics
 * (aria-expanded/aria-controls/region), keyboard-operable by default
 * since it's a real <button>. Reveal uses scaleY + opacity, never
 * height/max-height (motion-foundations rule 4 bans animating layout
 * properties; motion-patterns' own accordion pattern uses this exact
 * scaleY + transformOrigin approach).
 */
export default function AccordionItem({ question, answer, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const reduced = useReducedMotion()
  const id = useId()

  return (
    <div className="border-b border-border">
      <h3>
        <button
          type="button"
          id={`accordion-trigger-${id}`}
          aria-expanded={open}
          aria-controls={`accordion-panel-${id}`}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-base font-semibold"
        >
          {question}
          <span aria-hidden="true" className={`shrink-0 transition-transform ${open ? 'rotate-45' : ''}`}>
            +
          </span>
        </button>
      </h3>
      <motion.div
        id={`accordion-panel-${id}`}
        role="region"
        aria-labelledby={`accordion-trigger-${id}`}
        aria-hidden={!open}
        initial={false}
        animate={{ opacity: open ? 1 : 0, scaleY: open ? 1 : 0 }}
        transition={{ duration: reduced ? motionTokens.duration.instant : motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
        style={{ transformOrigin: 'top', overflow: 'hidden' }}
      >
        <p className="pb-5 text-sm text-text-muted">{answer}</p>
      </motion.div>
    </div>
  )
}
