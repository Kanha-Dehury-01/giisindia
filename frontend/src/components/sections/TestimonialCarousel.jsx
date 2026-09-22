import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import RevealOnScroll from '../motion/RevealOnScroll'
import { motionTokens } from '../../lib/motion-tokens'
import { useReducedMotion } from '../../context/ReducedMotionContext'
import { PLACEHOLDER_TESTIMONIALS } from '../../data/testimonialsPlaceholder'

// Text-based only (spec §14 explicitly bans video testimonials). Depth
// comes from the card treatment + motion, not imagery.
export default function TestimonialCarousel({ testimonials = PLACEHOLDER_TESTIMONIALS }) {
  const [index, setIndex] = useState(0)
  const reduced = useReducedMotion()
  const t = testimonials[index]

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <span aria-hidden="true" className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 font-display text-[10rem] leading-none text-accent/10 select-none">
        &rdquo;
      </span>
      <div className="container relative max-w-2xl text-center">
        <RevealOnScroll>
          <p className="font-display text-sm font-semibold text-accent uppercase">Student Testimonials</p>
        </RevealOnScroll>

        <div className="mt-8 min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.figure
              key={t.id}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: motionTokens.distance.md }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 1 } : { opacity: 0, y: -motionTokens.distance.md }}
              transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
            >
              <blockquote>
                <p className="text-xl font-medium text-text md:text-2xl">&ldquo;{t.quote}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-6 text-sm text-text-muted">
                <span className="font-semibold text-text">{t.student_name}</span>
                {t.program && <span> &middot; {t.program}</span>}
                {t.batch_year && <span> &middot; {t.batch_year}</span>}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div role="tablist" aria-label="Testimonials" className="mt-6 flex justify-center gap-2">
          {testimonials.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show testimonial ${i + 1} of ${testimonials.length}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${i === index ? 'bg-accent' : 'bg-border hover:bg-slate-400'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
