// Career titles from spec §15 — real role titles, not fabricated; the
// descriptions/skills/salary are what stay placeholder pending GIIS/CMS
// content in Phase 6.
function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const PLACEHOLDER_CAREERS = [
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
].map((title, i) => ({ id: i + 1, title, slug: slugify(title) }))
