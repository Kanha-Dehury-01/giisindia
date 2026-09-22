// Shaped like the `certifications` table (docs/ARCHITECTURE.md §E).
// Certification names are real, industry-standard credentials (CISA,
// CPENT, etc. — public knowledge, not fabricated), matching the
// Professional & Certification Training course line. Prerequisites/
// skills/career-relevance text are placeholders pending verified content
// (spec §22: "do not invent certification requirements"). Full
// certification explorer UI is Phase 6; this exists now so Phase 5
// search can include certification results.

function slugify(name) {
  return name.toLowerCase().replace(/[()+/]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const CERTIFICATIONS = [
  ['Certified Global SOC Analyst (CGSA)', 'beginner', 'Security Operations'],
  ['CompTIA Security+', 'beginner', 'General Security'],
  ['CompTIA A+', 'beginner', 'IT Fundamentals'],
  ['Certified Information Systems Auditor (CISA)', 'advanced', 'Governance, Risk & Compliance'],
  ['Certified Penetration Testing Professional (CPENT)', 'advanced', 'Offensive Security'],
  ['Certified Cloud Security Expert (CCSE)', 'intermediate', 'Cloud Security'],
  ['Certified Chief Information Security Officer (CCISO)', 'advanced', 'Security Leadership'],
  ['Certified Information Privacy Professional/Europe (CIPP/E)', 'intermediate', 'Privacy & Compliance'],
  ['Certified Information Systems Security Officer (CISSO)', 'advanced', 'General Security'],
  ['Certified Information Security Manager (CISM)', 'advanced', 'Security Leadership'],
  ['AWS Certified Security – Specialty', 'intermediate', 'Cloud Security'],
  ['ISO 27001 Lead Auditor', 'intermediate', 'Governance, Risk & Compliance'],
]

export const PLACEHOLDER_CERTIFICATIONS = CERTIFICATIONS.map(([name, level, domain], i) => ({
  id: i + 1,
  name,
  slug: slugify(name),
  short_description: '[ADD CERTIFICATION SUMMARY]',
  body: '[ADD: what it is, who it is for, prerequisites, skills, career relevance.]',
  level,
  domain,
  prerequisites: '[ADD PREREQUISITES]',
  skills: '[ADD SKILLS COVERED]',
  career_relevance: '[ADD CAREER RELEVANCE]',
}))

export function findCertificationBySlug(slug) {
  return PLACEHOLDER_CERTIFICATIONS.find((c) => c.slug === slug)
}
