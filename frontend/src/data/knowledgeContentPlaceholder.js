// Shaped like `knowledge_content` + `knowledge_tags` + `knowledge_relationships`
// (docs/ARCHITECTURE.md §E). Titles/tags/categories are real, standard
// cybersecurity topic names (not fabricated facts) — the body content
// GIIS would author is what's placeholder-marked, per spec §51/§17
// ("GIIS-authored/editorially reviewed... do not automatically scrape
// and republish third-party content").

function slugify(title) {
  return title.toLowerCase().replace(/[()&,/]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

let nextId = 1
function item(content_type, title, category, tags, difficulty, relatedCareerSlugs = [], relatedCourseSlugs = []) {
  return {
    id: nextId++,
    title,
    slug: slugify(title),
    content_type, // fundamental | domain | technology | guide | resource
    category,
    short_description: '[ADD SHORT DESCRIPTION]',
    body: '[ADD GIIS-AUTHORED ARTICLE BODY — editorially reviewed, with sources/references where needed.]',
    tags,
    difficulty,
    author: '[ADD AUTHOR]',
    reviewer: null,
    publish_date: '2026-01-15',
    last_updated: '2026-01-15',
    related_career_slugs: relatedCareerSlugs,
    related_course_slugs: relatedCourseSlugs,
  }
}

export const PLACEHOLDER_KNOWLEDGE_CONTENT = [
  // Fundamentals
  item('fundamental', 'What Is Cybersecurity?', 'Fundamentals', ['cybersecurity', 'basics'], 'beginner'),
  item('fundamental', 'The CIA Triad: Confidentiality, Integrity, Availability', 'Fundamentals', ['cia-triad', 'basics'], 'beginner'),
  item('fundamental', 'Introduction to Networking for Security', 'Fundamentals', ['networking', 'basics'], 'beginner'),

  // Domains
  item('domain', 'Network Security', 'Cybersecurity Domains', ['network-security'], 'intermediate', ['security-engineer']),
  item('domain', 'Cloud Security', 'Cybersecurity Domains', ['cloud-security', 'aws', 'azure'], 'intermediate', ['cloud-security-specialist'], ['certified-cloud-security-expert-ccse-certification-training']),
  item('domain', 'Application Security', 'Cybersecurity Domains', ['appsec', 'devsecops'], 'intermediate', ['security-engineer']),
  item('domain', 'Digital Forensics & Incident Response', 'Cybersecurity Domains', ['forensics', 'incident-response'], 'advanced', ['digital-forensics-analyst']),

  // Technologies & Tools
  item('technology', 'SIEM (Security Information and Event Management)', 'Technologies & Tools', ['siem', 'soc'], 'intermediate', ['soc-analyst']),
  item('technology', 'Firewalls Explained', 'Technologies & Tools', ['firewall', 'network-security'], 'beginner'),
  item('technology', 'Penetration Testing Tools Overview', 'Technologies & Tools', ['pentest', 'tools'], 'intermediate', ['penetration-tester']),

  // Guides
  item('guide', 'How to Start a Career in Cybersecurity', 'Educational Guides', ['career', 'beginner-guide'], 'beginner'),
  item('guide', 'Penetration Testing: A Practical Guide', 'Educational Guides', ['pentest', 'ethical-hacking'], 'intermediate', ['penetration-tester', 'ethical-hacker'], ['certified-penetration-testing-professional-cpent-training']),
  item('guide', 'Understanding the SOC Analyst Workflow', 'Educational Guides', ['soc', 'career'], 'beginner', ['soc-analyst'], ['certified-global-soc-analyst-cgsa-the-ultimate-soc-training']),

  // Resources / Insights
  item('resource', 'Top Cybersecurity Certifications to Consider', 'Resources & Insights', ['certifications', 'career'], 'beginner'),
  item('resource', 'Cybersecurity Career Trends', 'Resources & Insights', ['career', 'industry'], 'beginner'),
]

export const KNOWLEDGE_CONTENT_TYPES = [
  { value: 'fundamental', label: 'Fundamentals' },
  { value: 'domain', label: 'Cybersecurity Domains' },
  { value: 'technology', label: 'Technologies & Tools' },
  { value: 'guide', label: 'Educational Guides' },
  { value: 'resource', label: 'Resources & Insights' },
]

export function findKnowledgeContentBySlug(slug) {
  return PLACEHOLDER_KNOWLEDGE_CONTENT.find((c) => c.slug === slug)
}

export function findKnowledgeContentByTypeAndSlug(contentType, slug) {
  return PLACEHOLDER_KNOWLEDGE_CONTENT.find((c) => c.content_type === contentType && c.slug === slug)
}
