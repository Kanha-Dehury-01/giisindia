// Shaped like the `glossary_terms` table (docs/ARCHITECTURE.md §E). Term
// names are real, standard cybersecurity vocabulary (not fabricated
// facts); definitions are placeholders pending GIIS-authored content
// (Phase 8/7). Full A-Z glossary UI is Phase 6 — this exists now so
// Phase 5's cross-content search can include glossary results.

function slugify(term) {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const TERMS = [
  'Firewall',
  'Phishing',
  'Malware',
  'Zero-Day Vulnerability',
  'Encryption',
  'VPN (Virtual Private Network)',
  'SOC (Security Operations Center)',
  'Penetration Testing',
  'Ransomware',
  'Multi-Factor Authentication (MFA)',
  'SIEM (Security Information and Event Management)',
  'Zero Trust',
]

export const PLACEHOLDER_GLOSSARY = TERMS.map((term, i) => ({
  id: i + 1,
  term,
  slug: slugify(term),
  definition: '[ADD GLOSSARY DEFINITION]',
  display_letter: term.charAt(0).toUpperCase(),
})).sort((a, b) => a.term.localeCompare(b.term))

export function findGlossaryTermBySlug(slug) {
  return PLACEHOLDER_GLOSSARY.find((t) => t.slug === slug)
}
