/** Sidebar structure — filtered per-link by the signed-in user's permissions (server-enforced regardless; this only hides controls a user can't use). */
export const NAV_SECTIONS = [
  {
    label: 'Overview',
    links: [{ label: 'Dashboard', to: '/admin' }],
  },
  {
    label: 'Courses',
    links: [
      { label: 'Courses', to: '/admin/courses', permission: 'courses.manage' },
      { label: 'Course Categories', to: '/admin/course-categories', permission: 'courses.manage' },
    ],
  },
  {
    label: 'Knowledge Center',
    links: [
      { label: 'Articles', to: '/admin/knowledge', permission: 'knowledge.manage' },
      { label: 'Careers', to: '/admin/careers', permission: 'knowledge.manage' },
      { label: 'Learning Paths', to: '/admin/learning-paths', permission: 'knowledge.manage' },
      { label: 'Certifications', to: '/admin/certifications', permission: 'knowledge.manage' },
      { label: 'Glossary', to: '/admin/glossary', permission: 'knowledge.manage' },
    ],
  },
  {
    label: 'Marketing',
    links: [
      { label: 'Testimonials', to: '/admin/testimonials', permission: 'testimonials.manage' },
      { label: 'Leadership & Faculty', to: '/admin/team', permission: 'testimonials.manage' },
      { label: 'FAQs', to: '/admin/faqs', permission: 'faqs.manage' },
      { label: 'Events & Workshops', to: '/admin/events', permission: 'events.manage' },
      { label: 'Resources', to: '/admin/resources', permission: 'events.manage' },
    ],
  },
  {
    label: 'Operations',
    links: [
      { label: 'Enquiries', to: '/admin/enquiries', permission: 'enquiries.view' },
      { label: 'Media Library', to: '/admin/media', permission: 'media.upload' },
    ],
  },
  {
    label: 'System',
    links: [
      { label: 'SEO', to: '/admin/seo', permission: 'seo.edit_basic' },
      { label: 'Redirects', to: '/admin/redirects', permission: 'redirects.manage' },
      { label: 'Site Settings', to: '/admin/settings', permission: 'settings.manage' },
      { label: 'Users', to: '/admin/users', permission: 'users.manage' },
      { label: 'Audit Log', to: '/admin/audit-log', permission: 'audit_log.view' },
    ],
  },
]
