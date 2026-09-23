// JSON-LD builders. Used only where the page genuinely qualifies for the
// schema type (docs/ARCHITECTURE.md §L) — never added speculatively.
// Each builder returns a plain object; render it via <StructuredData data={...} />.

export function buildBreadcrumbList(items, origin = typeof window !== 'undefined' ? window.location.origin : '') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
      .filter((item) => item.to)
      .map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: `${origin}${item.to}`,
      })),
  }
}

// Course schema fields we can honestly fill from real data only — no
// fabricated price/rating/duration. `provider` is always GIIS/Threatsys;
// everything else is read straight from the course record, so a
// placeholder-marked field just renders as placeholder text in the
// structured data too (acceptable — it's not indexed as a real claim
// until an editor replaces the placeholder; nothing here invents a value
// the course object doesn't already have).
export function buildCourseSchema(course, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.short_description,
    provider: {
      '@type': 'Organization',
      name: 'GIIS',
      sameAs: typeof window !== 'undefined' ? window.location.origin : undefined,
    },
    url,
    ...(course.certification_name ? { educationalCredentialAwarded: course.certification_name } : {}),
  }
}

// Article schema — only for Knowledge Center content with a real author/
// reviewer and publish/update date (docs/ARCHITECTURE.md §L). Never
// applied to career/learning-path/certification pages, which aren't
// article-shaped content.
export function buildArticleSchema(content, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description: content.short_description,
    author: { '@type': 'Person', name: content.author },
    ...(content.reviewer ? { reviewedBy: { '@type': 'Person', name: content.reviewer } } : {}),
    datePublished: content.publish_date,
    dateModified: content.last_updated,
    publisher: { '@type': 'Organization', name: 'GIIS' },
    url,
  }
}

export function buildOrganizationSchema(origin = typeof window !== 'undefined' ? window.location.origin : '') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GIIS',
    url: origin,
    parentOrganization: { '@type': 'Organization', name: 'Threatsys' },
  }
}

// Site-wide WebSite schema with a SearchAction pointing at the real
// Knowledge Center search endpoint — genuinely functional, not decorative
// (spec §32: no structured data "simply for manipulation").
export function buildWebsiteSchema(origin = typeof window !== 'undefined' ? window.location.origin : '') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GIIS India',
    url: origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}/knowledge-center/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

// FAQPage schema — only where the visible accordion content on the page
// IS this exact Q&A list, never a subset (docs/ARCHITECTURE.md §L). The
// homepage's FAQ preview deliberately does not use this.
export function buildFaqPageSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

// Person schema — leadership/faculty profiles with a real name and bio
// only (never fabricated credentials).
export function buildPersonSchema(member, origin = typeof window !== 'undefined' ? window.location.origin : '') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.name,
    jobTitle: member.designation,
    description: member.biography,
    worksFor: { '@type': 'Organization', name: 'GIIS', url: origin },
  }
}

// Event schema — only for a real, dated event/workshop/webinar.
export function buildEventSchema(event, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.start_date,
    endDate: event.end_date ?? undefined,
    eventAttendanceMode: event.is_online
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: event.is_online
      ? { '@type': 'VirtualLocation', url }
      : { '@type': 'Place', name: event.location ?? 'GIIS' },
    organizer: { '@type': 'Organization', name: 'GIIS' },
    url,
  }
}
