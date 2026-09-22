// Placeholder hero content, shaped EXACTLY like the `hero_slides` table
// (docs/ARCHITECTURE.md §E) so swapping to a real `/api/homepage` fetch in
// Phase 8 is a one-line change in Home.jsx, not a component rewrite.
// Copy below matches spec §9's three concepts verbatim — not fabricated
// marketing claims, since these are direct section briefs, not factual
// statistics.
export const HERO_SLIDES = [
  {
    id: 1,
    eyebrow: 'Cybersecurity Education',
    heading: 'Build the skills to defend the digital world.',
    description: 'Industry-aligned cybersecurity training from GIIS, the educational wing of Threatsys.',
    cta_label: 'Explore Courses',
    cta_url: '/courses',
    svg_asset_key: 'network_shield',
  },
  {
    id: 2,
    eyebrow: 'Industry-Aligned Learning',
    heading: 'Learn cybersecurity beyond the classroom.',
    description: 'Practical labs, real tools, and mentorship connected to the Threatsys ecosystem.',
    cta_label: 'See the Learning Experience',
    cta_url: '/why-giis',
    svg_asset_key: 'student_terminal',
  },
  {
    id: 3,
    eyebrow: 'Career Readiness',
    heading: 'Learn. Practice. Certify. Build your career.',
    description: 'From fundamentals to certification, every GIIS program is built around your next role.',
    cta_label: 'Talk to an Advisor',
    cta_url: '/enquire?source=hero',
    svg_asset_key: 'learn_certify_career',
  },
]
