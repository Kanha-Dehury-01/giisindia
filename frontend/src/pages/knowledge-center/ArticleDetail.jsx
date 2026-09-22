import { useParams } from 'react-router-dom'
import StubPage from '../../components/ui/StubPage'

const TYPE_LABELS = {
  fundamental: 'Fundamentals',
  domain: 'Cybersecurity Domains',
  technology: 'Technologies & Tools',
  guide: 'Educational Guides',
  resource: 'Resources & Insights',
}

// Shared template for the five knowledge_content.content_type values that
// render as a plain long-form article (fundamentals/domains/technologies/
// guides/resources) — see docs/ARCHITECTURE.md §E. One real page template,
// five routes; career paths, learning paths, certifications, and glossary
// terms each have their own distinct structure and their own file.
export default function ArticleDetail({ contentType }) {
  const { slug } = useParams()
  const label = TYPE_LABELS[contentType] ?? 'Knowledge Center'

  return (
    <StubPage
      eyebrow={label}
      title={slug}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Knowledge Center', to: '/knowledge-center' },
        { label },
        { label: slug },
      ]}
      phaseNote="Full article template with related-content rail (concepts/careers/learning paths/certifications/courses/glossary) lands in Phase 5, driven by /api/knowledge/{slug}."
    />
  )
}
