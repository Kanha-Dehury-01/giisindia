import { useParams } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import { useStructuredData } from '../../hooks/useStructuredData'
import { buildBreadcrumbList, buildArticleSchema } from '../../utils/structuredData'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import RelatedContentRail from '../../components/knowledge/RelatedContentRail'
import { PLACEHOLDER_KNOWLEDGE_CONTENT, findKnowledgeContentByTypeAndSlug, KNOWLEDGE_CONTENT_TYPES } from '../../data/knowledgeContentPlaceholder'
import { PLACEHOLDER_CAREERS } from '../../data/careersPlaceholder'
import { PLACEHOLDER_COURSES } from '../../data/coursesPlaceholder'
import { PLACEHOLDER_GLOSSARY } from '../../data/glossaryPlaceholder'

const TYPE_LABELS = Object.fromEntries(KNOWLEDGE_CONTENT_TYPES.map((t) => [t.value, t.label]))

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Shared template for the five article-shaped content types (fundamental/
// domain/technology/guide/resource — docs/ARCHITECTURE.md §E). One real
// page template, five routes; career paths, learning paths,
// certifications, and glossary terms each have their own distinct
// structure (Phase 6) and their own file.
export default function ArticleDetail({ contentType }) {
  const { slug } = useParams()
  const article = findKnowledgeContentByTypeAndSlug(contentType, slug)
  const label = TYPE_LABELS[contentType] ?? 'Knowledge Center'

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: 'Knowledge Center', to: '/knowledge-center' },
    { label, to: `/knowledge-center?type=${contentType}` },
    { label: article?.title ?? slug },
  ]

  useSeo({
    title: article ? `${article.title} | GIIS Knowledge Center` : 'Article Not Found | GIIS India',
    description: article?.short_description,
  })

  useStructuredData(
    article ? [buildBreadcrumbList(breadcrumbItems), buildArticleSchema(article, window.location.href)] : null,
  )

  if (!article) {
    return (
      <div className="container py-16">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Knowledge Center', to: '/knowledge-center' }, { label: 'Not Found' }]} />
        <EmptyState
          title="Article not found"
          description="This page may have moved. Search the Knowledge Center to find what you're looking for."
          action={<Button to="/knowledge-center">Back to Knowledge Center</Button>}
        />
      </div>
    )
  }

  const relatedConcepts = PLACEHOLDER_KNOWLEDGE_CONTENT.filter(
    (c) => c.category === article.category && c.id !== article.id,
  ).slice(0, 4)
  const relatedCareers = PLACEHOLDER_CAREERS.filter((c) => article.related_career_slugs?.includes(c.slug))
  const relatedCourses = PLACEHOLDER_COURSES.filter((c) => article.related_course_slugs?.includes(c.slug))
  const relatedGlossary = PLACEHOLDER_GLOSSARY.filter((g) =>
    article.tags?.some((tag) => g.term.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(g.term.toLowerCase())),
  )

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />

      <header className="border-b border-border bg-surface-muted py-12 md:py-16">
        <div className="container">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{label}</Badge>
            <Badge variant="outline">{capitalize(article.difficulty)}</Badge>
          </div>
          <h1 className="mt-4 max-w-3xl">{article.title}</h1>
          <p className="mt-4 max-w-2xl text-text-muted">{article.short_description}</p>
          <p className="mt-4 text-xs text-text-muted">
            Last reviewed/updated: {article.last_updated}
            {article.author && ` · By ${article.author}`}
          </p>
        </div>
      </header>

      <div className="container grid gap-12 py-12 md:py-16 lg:grid-cols-[1fr_300px]">
        <article className="min-w-0 max-w-[72ch] text-text-muted">
          <p>{article.body}</p>
        </article>

        <aside className="h-fit rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 lg:sticky lg:top-24">
          <h2 className="text-base">Related Content</h2>
          <RelatedContentRail heading="Related Concepts" items={relatedConcepts.map((c) => ({ label: c.title, url: `/knowledge-center/${{ fundamental: 'fundamentals', domain: 'domains', technology: 'technologies', guide: 'guides', resource: 'resources' }[c.content_type]}/${c.slug}` }))} />
          <RelatedContentRail heading="Related Career Paths" items={relatedCareers.map((c) => ({ label: c.title, url: `/knowledge-center/careers/${c.slug}` }))} />
          <RelatedContentRail heading="Related GIIS Courses" items={relatedCourses.map((c) => ({ label: c.title, url: `/courses/${c.slug}` }))} />
          <RelatedContentRail heading="Related Glossary Terms" items={relatedGlossary.map((g) => ({ label: g.term, url: `/knowledge-center/glossary/${g.slug}` }))} />
          <Button to="/enquire" variant="primary" className="mt-6 w-full">
            Talk to an Advisor
          </Button>
        </aside>
      </div>
    </div>
  )
}
