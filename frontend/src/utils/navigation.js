// Single source of truth for primary/secondary nav + footer links, so
// Header, Footer and the sitemap in docs/ARCHITECTURE.md §A never drift
// apart. Update here, not in the components.

export const PRIMARY_NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Courses', to: '/courses' },
  { label: 'Why GIIS', to: '/why-giis' },
  { label: 'Leadership', to: '/leadership' },
  { label: 'Career & Placement', to: '/careers/placement' },
  { label: 'Knowledge Center', to: '/knowledge-center' },
]

export const SECONDARY_NAV = [
  { label: 'Resources', to: '/resources' },
  { label: 'Events', to: '/events' },
]

export const FOOTER_COLUMNS = [
  {
    heading: 'GIIS',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Why GIIS', to: '/why-giis' },
      { label: 'Leadership', to: '/leadership' },
    ],
  },
  {
    heading: 'Courses',
    links: [
      { label: 'All Courses', to: '/courses' },
      { label: 'Featured Courses', to: '/courses?featured=1' },
      { label: 'Certifications', to: '/certifications' },
    ],
  },
  {
    heading: 'Knowledge Center',
    links: [
      { label: 'Fundamentals', to: '/knowledge-center?type=fundamental' },
      { label: 'Career Paths', to: '/knowledge-center/careers' },
      { label: 'Learning Paths', to: '/knowledge-center/learning-paths' },
      { label: 'Glossary', to: '/knowledge-center/glossary' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Events', to: '/events' },
      { label: 'FAQs', to: '/faq' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms & Conditions', to: '/terms-and-conditions' },
      { label: 'Cookie Policy', to: '/cookie-policy' },
      { label: 'Disclaimer', to: '/disclaimer' },
    ],
  },
]
