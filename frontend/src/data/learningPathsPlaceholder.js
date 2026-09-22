// Shaped like `learning_paths` + `learning_path_steps` (docs/ARCHITECTURE.md
// §E). The 7 paths and the Fundamentals→Career step flow are named
// directly in spec §20 — not fabricated. Step descriptions are
// placeholders. Full learning-path UI is Phase 6; this exists now so
// Phase 5 search can include learning-path results.

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const STEP_TYPES = [
  ['fundamentals', 'Fundamentals'],
  ['networking', 'Networking'],
  ['linux', 'Linux'],
  ['security_fundamentals', 'Security Fundamentals'],
  ['specialization', 'Specialization'],
  ['certification', 'Certification'],
  ['practical_experience', 'Practical Experience'],
  ['career', 'Career'],
]

const PATH_TITLES = [
  'Cybersecurity Beginner',
  'Ethical Hacking',
  'SOC Analyst',
  'Cloud Security',
  'Digital Forensics',
  'GRC',
  'Penetration Testing',
]

export const PLACEHOLDER_LEARNING_PATHS = PATH_TITLES.map((title, i) => ({
  id: i + 1,
  title: `${title} Learning Path`,
  slug: slugify(`${title} learning path`),
  description: '[ADD LEARNING PATH DESCRIPTION]',
  target_audience: '[ADD TARGET AUDIENCE]',
  steps: STEP_TYPES.map(([step_type, label]) => ({
    step_type,
    step_title: label,
    step_description: '[ADD STEP DESCRIPTION]',
  })),
}))

export function findLearningPathBySlug(slug) {
  return PLACEHOLDER_LEARNING_PATHS.find((p) => p.slug === slug)
}
