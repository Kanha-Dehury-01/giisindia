// Placeholder course data, shaped exactly like the `courses` table (+ its
// child tables: course_curriculum, course_skills, course_tools,
// course_learning_outcomes, course_faqs — docs/ARCHITECTURE.md §E).
// Titles and categories are the real 23 GIIS programs from the project
// brief — nothing fabricated there. `certification_name` and
// `related_career_slugs` are reasonable structural inferences from each
// course's own title/category (e.g. a course named "CompTIA Security+"
// preps for the CompTIA Security+ cert — that's the title, not a new
// claim). Descriptions, durations, curriculum specifics, outcomes, and
// FAQs ARE placeholders (spec §51: "do not invent detailed course
// claims") pending GIIS-supplied content in database/seed.sql (Phase 8)
// and admin CMS entry (Phase 7). `is_best_seller`/`is_featured` flags
// here are illustrative only — the real ones are admin-controlled.
//
// Used by the homepage's Top Courses section and the course catalogue/
// detail pages (Phase 3-4); replaced by a real /api/courses fetch once
// Phase 8 lands.

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[()+/]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const SIGNATURE_TITLES = [
  ['Certified Global Ethical Hacker Elite (CGEH Elite)', 'beginner'],
  ['Certified Global Ethical Hacker Elite Plus (CGEH Elite Plus)', 'beginner'],
  ['Certified Global Ethical Hacker Elite Plus+ (CGEH Elite Plus+)', 'intermediate'],
  ['Certified Global Ethical Hacker Advance (CGEH Adv)', 'intermediate'],
  ['Certified Global Ethical Hacker Advance+ (CGEH Adv+)', 'intermediate'],
  ['Certified Global Ethical Hacker Super (CGEH Sup)', 'advanced'],
  ['Certified Global Ethical Hacker Super+ (CGEH Sup+)', 'advanced'],
  ['Certified Global Ethical Hacker Masters (CGEH Mas)', 'advanced'],
  ['Certified Global Ethical Hacker Masters+ (CGEH Mas+)', 'advanced'],
  ['Master in Cyber Security (MCS)', 'advanced'],
]

const PROFESSIONAL_TITLES = [
  ['Certified Global ISO 27001 Lead Auditor Training', 'intermediate', ['grc-professional']],
  ['Certified Global SOC Analyst (CGSA) – The Ultimate SOC Training', 'beginner', ['soc-analyst']],
  ['Certified Information Systems Auditor (CISA) Training', 'advanced', ['grc-professional']],
  ['Certified Penetration Testing Professional (CPENT) Training', 'advanced', ['penetration-tester', 'ethical-hacker']],
  ['Certified Cloud Security Expert (CCSE) Certification Training', 'intermediate', ['cloud-security-specialist']],
  ['Certified Chief Information Security Officer (CCISO) Training Program', 'advanced', ['ciso']],
  ['Certified Information Privacy Professional/Europe (CIPP/E) Certification Training', 'intermediate', ['grc-professional']],
  ['Certified Information Systems Security Officer (CISSO) Certification Training Program', 'advanced', ['security-consultant']],
  ['Certified Information Security Manager (CISM) Training Program', 'advanced', ['security-consultant', 'ciso']],
  ['CompTIA Security+ SY0-601 Certification Training Program', 'beginner', ['cybersecurity-analyst']],
  ['AWS Certified Security Specialist Training', 'intermediate', ['cloud-security-specialist']],
  ['CompTIA A+ Certification Training', 'beginner', ['cybersecurity-analyst']],
  ['ISO 27001 Lead Auditor (LA) Certification Training', 'intermediate', ['grc-professional']],
]

const PLACEHOLDER_LEARNING_OUTCOMES = [
  '[ADD LEARNING OUTCOME]',
  '[ADD LEARNING OUTCOME]',
  '[ADD LEARNING OUTCOME]',
  '[ADD LEARNING OUTCOME]',
]

const PLACEHOLDER_CURRICULUM = [
  { module_title: '[ADD MODULE TITLE]', module_description: '[ADD MODULE DESCRIPTION]' },
  { module_title: '[ADD MODULE TITLE]', module_description: '[ADD MODULE DESCRIPTION]' },
  { module_title: '[ADD MODULE TITLE]', module_description: '[ADD MODULE DESCRIPTION]' },
  { module_title: '[ADD MODULE TITLE]', module_description: '[ADD MODULE DESCRIPTION]' },
]

const PLACEHOLDER_SKILLS = ['[ADD SKILL]', '[ADD SKILL]', '[ADD SKILL]', '[ADD SKILL]', '[ADD SKILL]']
const PLACEHOLDER_TOOLS = ['[ADD TOOL]', '[ADD TOOL]', '[ADD TOOL]', '[ADD TOOL]']

const PLACEHOLDER_FAQS = [
  { question: '[ADD COURSE FAQ QUESTION]', answer: '[ADD FAQ ANSWER]' },
  { question: '[ADD COURSE FAQ QUESTION]', answer: '[ADD FAQ ANSWER]' },
  { question: '[ADD COURSE FAQ QUESTION]', answer: '[ADD FAQ ANSWER]' },
]

let nextId = 1
function buildCourse(title, category, level, relatedCareerSlugs = [], extra = {}) {
  // Certification-prep courses (the Professional & Certification line) are
  // literally named after the certification they prepare for — restating
  // that in certification_name is the title, not a new claim.
  const certificationName = category === 'Professional & Certification Training' ? title.replace(/ Training( Program)?$/, '') : null

  return {
    id: nextId++,
    title,
    slug: slugify(title),
    short_description: '[GIIS COURSE DESCRIPTION]',
    long_description: '[ADD FULL COURSE OVERVIEW — what this program covers and why it exists.]',
    category,
    level,
    duration_text: '[ADD COURSE DURATION]',
    mode: 'classroom',
    certification_name: certificationName,
    eligibility: '[ADD ELIGIBILITY CRITERIA]',
    is_featured: false,
    is_best_seller: false,
    is_new: false,
    is_duplicate_suspect: false,
    learning_outcomes: PLACEHOLDER_LEARNING_OUTCOMES,
    curriculum: PLACEHOLDER_CURRICULUM,
    skills: PLACEHOLDER_SKILLS,
    tools: PLACEHOLDER_TOOLS,
    faqs: PLACEHOLDER_FAQS,
    related_career_slugs: relatedCareerSlugs,
    ...extra,
  }
}

export const PLACEHOLDER_COURSES = [
  ...SIGNATURE_TITLES.map(([title, level]) =>
    buildCourse(title, 'GIIS Signature Programs', level, ['ethical-hacker']),
  ),
  ...PROFESSIONAL_TITLES.map(([title, level, careers]) =>
    buildCourse(title, 'Professional & Certification Training', level, careers, {
      // Flags the two ISO 27001 Lead Auditor listings per spec §5 note —
      // kept as distinct rows until GIIS confirms whether they're duplicates.
      is_duplicate_suspect: title.includes('ISO 27001 Lead Auditor'),
    }),
  ),
]

// A handful flagged best-seller/featured purely to exercise the homepage/
// catalogue layout — real flags are admin-set once Phase 7/8 land.
;[0, 1, 10, 13].forEach((i) => {
  if (PLACEHOLDER_COURSES[i]) PLACEHOLDER_COURSES[i].is_best_seller = true
})
;[3, 15].forEach((i) => {
  if (PLACEHOLDER_COURSES[i]) PLACEHOLDER_COURSES[i].is_new = true
})

export const COURSE_CATEGORIES = Array.from(new Set(PLACEHOLDER_COURSES.map((c) => c.category)))
export const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced']

export function findCourseBySlug(slug) {
  return PLACEHOLDER_COURSES.find((c) => c.slug === slug)
}
