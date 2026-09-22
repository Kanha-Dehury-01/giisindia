// Motion foundation tokens — the ONLY place duration/easing/spring/distance
// values are defined. Every animated component imports from here; no
// component is allowed to inline a duration, easing curve, or spring
// config (motion-foundations skill, rule 5/6). These also mirror the CSS
// --motion-* variables in src/styles/tokens.css so JS and CSS animation
// never drift apart.

export const motionTokens = {
  duration: {
    instant: 0.08,
    fast: 0.18,
    normal: 0.3,
    slow: 0.5,
    crawl: 1.2, // hero SVG scene beats only — matches --motion-duration-scene
  },
  easing: {
    smooth: [0.22, 1, 0.36, 1],
    sharp: [0.4, 0, 0.2, 1],
    bounce: [0.34, 1.56, 0.64, 1],
    linear: [0, 0, 1, 1],
  },
  distance: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 48,
  },
  scale: {
    subtle: 0.98,
    press: 0.95,
    pop: 1.04,
  },
}

export const springs = {
  snappy: { type: 'spring', stiffness: 300, damping: 30 },
  gentle: { type: 'spring', stiffness: 120, damping: 14 },
  bouncy: { type: 'spring', stiffness: 400, damping: 10 },
  instant: { type: 'spring', stiffness: 600, damping: 35 },
  release: { type: 'spring', stiffness: 200, damping: 20, restDelta: 0.001 },
}
