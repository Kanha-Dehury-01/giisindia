import { Link, useSearchParams } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import RevealOnScroll from '../../components/motion/RevealOnScroll'
import { StaggerGroup, StaggerItem } from '../../components/motion/StaggerGroup'
import KnowledgeSearchBar from '../../components/knowledge/KnowledgeSearchBar'
import { PLACEHOLDER_KNOWLEDGE_CONTENT, KNOWLEDGE_CONTENT_TYPES } from '../../data/knowledgeContentPlaceholder'

const CONTENT_TYPE_URL_PREFIX = {
  fundamental: 'fundamentals',
  domain: 'domains',
  technology: 'technologies',
  guide: 'guides',
  resource: 'resources',
}

const TYPE_LABEL_LOOKUP = Object.fromEntries(KNOWLEDGE_CONTENT_TYPES.map((t) => [t.value, t.label]))

const EXTRA_LINKS = [
  { label: 'Career Paths', to: '/knowledge-center/careers', description: 'What each cybersecurity role actually does.' },
  { label: 'Learning Paths', to: '/knowledge-center/learning-paths', description: 'Beginner-to-specialist roadmaps.' },
  { label: 'Certifications', to: '/certifications', description: 'Explore certifications by level and domain.' },
  { label: 'Glossary', to: '/knowledge-center/glossary', description: 'A-Z cybersecurity terms, explained.' },
]

// The Knowledge Center hub: a comprehensive learning library, not a blog
// (spec §17) — organized by content type, each linking through to real
// articles, with the global search as the primary entry point.
export default function KnowledgeCenter() {
  const [params] = useSearchParams()
  const activeType = params.get('type')
  const visibleTypes = activeType ? KNOWLEDGE_CONTENT_TYPES.filter((t) => t.value === activeType) : KNOWLEDGE_CONTENT_TYPES

  useSeo({
    title: activeType ? `${TYPE_LABEL_LOOKUP[activeType] ?? 'Knowledge Center'} | GIIS India` : 'Knowledge Center | GIIS India',
    description: 'A comprehensive cybersecurity learning library — fundamentals through advanced concepts, careers, learning paths, and a full glossary.',
  })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Knowledge Center' }]} />

      <header className="bg-bg-inverse py-16 text-center text-text-inverse md:py-24">
        <div className="container flex flex-col items-center">
          <p className="font-display text-sm font-semibold text-accent-on-dark uppercase">Knowledge Center</p>
          <h1 className="mt-3 max-w-2xl text-text-inverse">What do you want to learn about?</h1>
          <p className="mt-4 max-w-xl text-text-inverse-muted">
            Cybersecurity fundamentals through advanced concepts, technologies, certifications, and career paths —
            GIIS-authored and editorially reviewed.
          </p>
          <div className="mt-8 w-full">
            <div className="mx-auto flex justify-center">
              <KnowledgeSearchBar />
            </div>
          </div>
        </div>
      </header>

      {activeType && (
        <div className="container pt-8">
          <Link to="/knowledge-center" className="text-sm font-semibold text-accent hover:underline">
            &larr; All Content Types
          </Link>
        </div>
      )}

      {visibleTypes.map((type, index) => {
        const items = PLACEHOLDER_KNOWLEDGE_CONTENT.filter((c) => c.content_type === type.value)
        if (items.length === 0) return null
        return (
          <section key={type.value} className={index % 2 === 0 ? 'py-12 md:py-16' : 'section-grid-light py-12 md:py-16'}>
            <div className="container">
              <RevealOnScroll>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <h2>{type.label}</h2>
                  {!activeType && (
                    <Link to={`/knowledge-center?type=${type.value}`} className="text-sm font-semibold text-accent hover:underline">
                      View All &rarr;
                    </Link>
                  )}
                </div>
              </RevealOnScroll>
              <StaggerGroup as="div" className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <StaggerItem key={item.id}>
                    <Link
                      to={`/knowledge-center/${CONTENT_TYPE_URL_PREFIX[item.content_type]}/${item.slug}`}
                      className="group flex h-full flex-col gap-2 rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <p className="text-xs font-semibold text-accent uppercase">{item.category}</p>
                      <h3 className="text-base group-hover:text-accent">{item.title}</h3>
                      <p className="line-clamp-2 text-sm text-text-muted">{item.short_description}</p>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
          </section>
        )
      })}

      <section className="bg-surface-muted py-12 md:py-16">
        <div className="container">
          <RevealOnScroll>
            <h2>More Ways to Explore</h2>
          </RevealOnScroll>
          <StaggerGroup as="div" className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {EXTRA_LINKS.map((link) => (
              <StaggerItem key={link.to}>
                <Link
                  to={link.to}
                  className="group flex h-full flex-col gap-2 rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="font-display text-base font-semibold text-text group-hover:text-accent">{link.label}</span>
                  <span className="text-sm text-text-muted">{link.description}</span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </div>
  )
}
