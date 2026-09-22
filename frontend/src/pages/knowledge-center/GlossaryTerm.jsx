import { useParams } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import { useStructuredData } from '../../hooks/useStructuredData'
import { buildBreadcrumbList } from '../../utils/structuredData'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import RelatedContentRail from '../../components/knowledge/RelatedContentRail'
import { findGlossaryTermBySlug } from '../../data/glossaryPlaceholder'
import { PLACEHOLDER_KNOWLEDGE_CONTENT } from '../../data/knowledgeContentPlaceholder'

const CONTENT_TYPE_URL_PREFIX = { fundamental: 'fundamentals', domain: 'domains', technology: 'technologies', guide: 'guides', resource: 'resources' }

export default function GlossaryTerm() {
  const { slug } = useParams()
  const term = findGlossaryTermBySlug(slug)

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: 'Knowledge Center', to: '/knowledge-center' },
    { label: 'Glossary', to: '/knowledge-center/glossary' },
    { label: term?.term ?? slug },
  ]

  useSeo({ title: term ? `${term.term} | GIIS Glossary` : 'Term Not Found | GIIS India', description: term?.definition })
  useStructuredData(term ? [buildBreadcrumbList(breadcrumbItems)] : null)

  if (!term) {
    return (
      <div className="container py-16">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Knowledge Center', to: '/knowledge-center' }, { label: 'Not Found' }]} />
        <EmptyState title="Term not found" action={<Button to="/knowledge-center/glossary">Browse Glossary</Button>} />
      </div>
    )
  }

  // Related guides: any Knowledge Center article whose tags mention this
  // term (same cross-reference logic ArticleDetail uses in reverse).
  const relatedGuides = PLACEHOLDER_KNOWLEDGE_CONTENT.filter((c) =>
    c.tags?.some((tag) => term.term.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(term.term.toLowerCase())),
  ).slice(0, 4)

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />

      <div className="container max-w-2xl py-12 md:py-16">
        <p className="font-display text-sm font-semibold text-accent uppercase">Glossary</p>
        <h1 className="mt-2">{term.term}</h1>
        <p className="mt-4 text-lg text-text-muted">{term.definition}</p>

        <RelatedContentRail
          heading="Related Guides"
          items={relatedGuides.map((g) => ({ label: g.title, url: `/knowledge-center/${CONTENT_TYPE_URL_PREFIX[g.content_type]}/${g.slug}` }))}
        />

        <Button to="/knowledge-center/glossary" variant="ghost" className="mt-8">
          &larr; Back to Glossary
        </Button>
      </div>
    </div>
  )
}
