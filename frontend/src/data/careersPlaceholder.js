// Shaped like the `careers` table + junction tables (docs/ARCHITECTURE.md
// §E). Career titles from spec §15 — real role titles, not fabricated.
// Descriptions/skills/tools/roadmap text are placeholders pending GIIS/CMS
// content (Phase 7/8) — spec §15: "do not make salary claims unless
// supplied and verified," so no compensation field exists here at all.

import { PLACEHOLDER_CERTIFICATIONS } from './certificationsPlaceholder'
import { PLACEHOLDER_COURSES } from './coursesPlaceholder'

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const ROADMAP_STEPS = ['Fundamentals', 'Core Skills', 'Specialization', 'Certification', 'Practical Experience']

const TITLES = [
  'SOC Analyst',
  'Cybersecurity Analyst',
  'Ethical Hacker',
  'Penetration Tester',
  'Security Engineer',
  'Security Consultant',
  'Digital Forensics Analyst',
  'Cloud Security Specialist',
  'GRC Professional',
  'CISO',
]

export const PLACEHOLDER_CAREERS = TITLES.map((title, i) => {
  const slug = slugify(title)
  // Reuses the same related_career_slugs links courses already declare
  // (docs/ARCHITECTURE.md's course_career_links junction) — one source
  // of truth for the course↔career relationship, read from both sides.
  const relatedCourses = PLACEHOLDER_COURSES.filter((c) => c.related_career_slugs?.includes(slug))

  return {
    id: i + 1,
    title,
    slug,
    description: '[ADD ROLE DESCRIPTION — what this role does day-to-day.]',
    beginner_skills: ['[ADD SKILL]', '[ADD SKILL]', '[ADD SKILL]'],
    intermediate_skills: ['[ADD SKILL]', '[ADD SKILL]', '[ADD SKILL]'],
    advanced_skills: ['[ADD SKILL]', '[ADD SKILL]'],
    tools: ['[ADD TOOL]', '[ADD TOOL]', '[ADD TOOL]'],
    career_progression: '[ADD CAREER PROGRESSION — typical next roles from here.]',
    roadmap: ROADMAP_STEPS.map((step) => ({ step, description: '[ADD ROADMAP STEP DESCRIPTION]' })),
    related_course_slugs: relatedCourses.map((c) => c.slug),
    related_certification_slugs: [],
  }
})

// Explicit career → certification associations (structural linking, not a
// factual claim about requirements — spec §22). Kept as a plain lookup
// rather than derived by string-matching slugs, which was error-prone.
const CERTIFICATION_LINKS = {
  'soc-analyst': ['certified-global-soc-analyst-cgsa'],
  'cybersecurity-analyst': ['comptia-security', 'comptia-a'],
  'ethical-hacker': ['certified-penetration-testing-professional-cpent'],
  'penetration-tester': ['certified-penetration-testing-professional-cpent'],
  'security-engineer': ['comptia-security'],
  'security-consultant': ['certified-information-systems-security-officer-cisso', 'certified-information-security-manager-cism'],
  'digital-forensics-analyst': [],
  'cloud-security-specialist': ['certified-cloud-security-expert-ccse', 'aws-certified-security-specialty'],
  'grc-professional': ['certified-information-systems-auditor-cisa', 'iso-27001-lead-auditor'],
  ciso: ['certified-chief-information-security-officer-cciso', 'certified-information-security-manager-cism'],
}

PLACEHOLDER_CAREERS.forEach((career) => {
  const slugs = CERTIFICATION_LINKS[career.slug] ?? []
  career.related_certification_slugs = PLACEHOLDER_CERTIFICATIONS.filter((c) => slugs.includes(c.slug)).map((c) => c.slug)
})

export function findCareerBySlug(slug) {
  return PLACEHOLDER_CAREERS.find((c) => c.slug === slug)
}
