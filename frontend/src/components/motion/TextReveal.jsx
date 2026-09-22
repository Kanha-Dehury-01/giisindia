import { motion } from 'motion/react'
import { springs } from '../../lib/motion-tokens'
import { useReducedMotion } from '../../context/ReducedMotionContext'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}
const word = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
}

/** Word-by-word reveal for hero headings. Falls back to a plain opacity fade under reduced motion. */
export default function TextReveal({ text, as: Tag = 'span', className }) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <Tag className={className}>{text}</Tag>
  }

  return (
    <motion.span className={className} variants={container} initial="hidden" animate="visible" aria-label={text}>
      {text.split(' ').map((w, i) => (
        <motion.span key={`${w}-${i}`} className="mr-[0.25em] inline-block" variants={word} aria-hidden="true">
          {w}
        </motion.span>
      ))}
    </motion.span>
  )
}
