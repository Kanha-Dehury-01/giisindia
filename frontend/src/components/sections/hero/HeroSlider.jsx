import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Button from '../../ui/Button'
import TextReveal from '../../motion/TextReveal'
import ParallaxLayer from '../../motion/ParallaxLayer'
import SceneRadarDefense from '../../motion/hero-scenes/SceneRadarDefense'
import SceneStudentTerminal from '../../motion/hero-scenes/SceneStudentTerminal'
import SceneCareerJourney from '../../motion/hero-scenes/SceneCareerJourney'
import { motionTokens } from '../../../lib/motion-tokens'
import { useReducedMotion } from '../../../context/ReducedMotionContext'
import { HERO_SLIDES } from './heroSlidesData'

const SCENES = {
  radar_defense: SceneRadarDefense,
  student_terminal: SceneStudentTerminal,
  learn_certify_career: SceneCareerJourney,
}

const AUTOPLAY_MS = 7000
const SWIPE_OFFSET_THRESHOLD = 60
const SWIPE_VELOCITY_THRESHOLD = 300

/**
 * Full-width three-slide hero (spec §9). Autoplay pauses on hover, focus,
 * reduced-motion, and while the tab is hidden — never fights the visitor
 * for control. Keyboard (arrow keys) and touch (swipe) both drive the
 * same `goTo`, so every input method reaches every slide.
 */
export default function HeroSlider({ slides = HERO_SLIDES }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const reduced = useReducedMotion()
  const containerRef = useRef(null)

  const goTo = useCallback(
    (next) => {
      setIndex(((next % slides.length) + slides.length) % slides.length)
    },
    [slides.length],
  )

  // Autoplay
  useEffect(() => {
    if (!playing || reduced) return undefined
    const timer = setInterval(() => goTo(index + 1), AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [playing, reduced, index, goTo])

  // Pause on tab hidden (motion-advanced rule 2)
  useEffect(() => {
    const onVisibility = () => setPlaying(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Keyboard navigation
  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goTo(index + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goTo(index - 1)
    }
  }

  const slide = slides[index]
  const Scene = SCENES[slide.svg_asset_key]

  return (
    <section
      ref={containerRef}
      aria-roledescription="carousel"
      aria-label="GIIS highlights"
      className="relative overflow-hidden bg-bg-inverse text-text-inverse"
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
      onFocus={() => setPlaying(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPlaying(true)
      }}
      onKeyDown={onKeyDown}
    >
      <ParallaxLayer speed={0.2} className="pointer-events-none absolute inset-0 opacity-40">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 70% 30%, var(--navy-700), transparent 60%)' }}
        />
      </ParallaxLayer>

      <div className="container relative grid min-h-[560px] items-center gap-10 py-20 md:min-h-[640px] md:grid-cols-2 md:py-28">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: motionTokens.distance.md }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 1 } : { opacity: 0, y: -motionTokens.distance.md }}
              transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
            >
              <p className="font-display text-sm font-semibold tracking-wide text-accent-on-dark uppercase">
                {slide.eyebrow}
              </p>
              <h1 className="mt-4 max-w-xl text-text-inverse">
                <TextReveal text={slide.heading} />
              </h1>
              <p className="mt-4 max-w-md text-text-inverse-muted">{slide.description}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button to={slide.cta_url} variant="primary">
                  {slide.cta_label}
                </Button>
                <Button to="/enquire" variant="secondary">
                  Enquire Now
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          className="relative mx-auto h-64 w-64 md:h-80 md:w-80"
          drag={reduced ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            const swipedLeft = info.offset.x < -SWIPE_OFFSET_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD
            const swipedRight = info.offset.x > SWIPE_OFFSET_THRESHOLD || info.velocity.x > SWIPE_VELOCITY_THRESHOLD
            if (swipedLeft) goTo(index + 1)
            if (swipedRight) goTo(index - 1)
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={reduced ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: motionTokens.duration.normal }}
              className="h-full w-full"
            >
              <Scene reduced={reduced} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Indicators + play/pause — never hover-only, per spec §40 */}
      <div className="container relative flex items-center gap-4 pb-8">
        <div role="tablist" aria-label="Slides" className="flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}: ${s.eyebrow}`}
              onClick={() => goTo(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${i === index ? 'bg-accent-on-dark' : 'bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
        {!reduced && (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
            className="ml-2 text-xs text-text-inverse-muted hover:text-text-inverse"
          >
            {playing ? 'Pause' : 'Play'}
          </button>
        )}
      </div>
    </section>
  )
}
