// Placeholder course data, shaped exactly like the `courses` table
// (docs/ARCHITECTURE.md §E). Titles and categories are the real 23 GIIS
// programs from the project brief — nothing fabricated there. Descriptions,
// durations, and levels ARE placeholders (spec §51: "do not invent detailed
// course claims") pending GIIS-supplied content in database/seed.sql
// (Phase 8) and admin CMS entry (Phase 7). `is_best_seller`/`is_featured`
// flags here are illustrative only — the real ones are admin-controlled.
//
// Used by the homepage's Top Courses section (Phase 3) and will be
// replaced by a real /api/courses fetch once Phase 8 lands; the catalogue
// page (Phase 4) reuses this same file until then.

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[()+/]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const SIGNATURE_TITLES = [
  'Certified Global Ethical Hacker Elite (CGEH Elite)',
  'Certified Global Ethical Hacker Elite Plus (CGEH Elite Plus)',
  'Certified Global Ethical Hacker Elite Plus+ (CGEH Elite Plus+)',
  'Certified Global Ethical Hacker Advance (CGEH Adv)',
  'Certified Global Ethical Hacker Advance+ (CGEH Adv+)',
  'Certified Global Ethical Hacker Super (CGEH Sup)',
  'Certified Global Ethical Hacker Super+ (CGEH Sup+)',
  'Certified Global Ethical Hacker Masters (CGEH Mas)',
  'Certified Global Ethical Hacker Masters+ (CGEH Mas+)',
  'Master in Cyber Security (MCS)',
]

const PROFESSIONAL_TITLES = [
  'Certified Global ISO 27001 Lead Auditor Training',
  'Certified Global SOC Analyst (CGSA) – The Ultimate SOC Training',
  'Certified Information Systems Auditor (CISA) Training',
  'Certified Penetration Testing Professional (CPENT) Training',
  'Certified Cloud Security Expert (CCSE) Certification Training',
  'Certified Chief Information Security Officer (CCISO) Training Program',
  'Certified Information Privacy Professional/Europe (CIPP/E) Certification Training',
  'Certified Information Systems Security Officer (CISSO) Certification Training Program',
  'Certified Information Security Manager (CISM) Training Program',
  'CompTIA Security+ SY0-601 Certification Training Program',
  'AWS Certified Security Specialist Training',
  'CompTIA A+ Certification Training',
  'ISO 27001 Lead Auditor (LA) Certification Training',
]

let nextId = 1
function buildCourse(title, category, extra = {}) {
  return {
    id: nextId++,
    title,
    slug: slugify(title),
    short_description: '[GIIS COURSE DESCRIPTION]',
    category,
    level: 'intermediate',
    duration_text: '[ADD COURSE DURATION]',
    mode: 'classroom',
    certification_name: null,
    is_best_seller: false,
    is_featured: false,
    is_new: false,
    is_duplicate_suspect: false,
    ...extra,
  }
}

export const PLACEHOLDER_COURSES = [
  ...SIGNATURE_TITLES.map((title) => buildCourse(title, 'GIIS Signature Programs')),
  ...PROFESSIONAL_TITLES.map((title) =>
    buildCourse(title, 'Professional & Certification Training', {
      // Flags the two ISO 27001 Lead Auditor listings per spec §5 note —
      // kept as distinct rows until GIIS confirms whether they're duplicates.
      is_duplicate_suspect: title.includes('ISO 27001 Lead Auditor'),
    }),
  ),
]

// A handful flagged best-seller/featured purely to exercise the homepage
// section's layout — real flags are admin-set once Phase 7/8 land.
;[0, 1, 10, 13].forEach((i) => {
  if (PLACEHOLDER_COURSES[i]) PLACEHOLDER_COURSES[i].is_best_seller = true
})
