import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import EmptyState from '../../components/ui/EmptyState'
import KnowledgeSearchBar from '../../components/knowledge/KnowledgeSearchBar'
import ContentTypeFilterTabs from '../../components/knowledge/ContentTypeFilterTabs'
import SearchResultCard from '../../components/knowledge/SearchResultCard'
import { StaggerGroup, StaggerItem } from '../../components/motion/StaggerGroup'
import { searchKnowledgeCenter, countByCategory, RESULT_CATEGORIES } from '../../utils/knowledgeSearch'

// Real search (spec §18): ranked by exact title match, then keyword/tag
// match, then category match, then content match — see
// utils/knowledgeSearch.js. Category tabs filter client-side now; Phase 8
// ports the same ranking to a PHP + MySQL FULLTEXT query behind
// GET /api/knowledge/search.
export default function KnowledgeSearch() {
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''
  const [activeCategory, setActiveCategory] = useState('all')

  useSeo({
    title: query ? `"${query}" — Search Results | GIIS India` : 'Search the Knowledge Center | GIIS India',
  })

  const results = searchKnowledgeCenter(query, activeCategory)
  const counts = query ? countByCategory(query) : {}

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Knowledge Center', to: '/knowledge-center' }, { label: 'Search' }]} />

      <header className="border-b border-border bg-surface-muted py-10 md:py-14">
        <div className="container">
          <h1>{query ? `Results for "${query}"` : 'Search the Knowledge Center'}</h1>
          <div className="mt-6">
            <KnowledgeSearchBar defaultValue={query} size="md" />
          </div>
        </div>
      </header>

      <div className="container py-10 md:py-14">
        {query ? (
          <>
            <ContentTypeFilterTabs categories={RESULT_CATEGORIES} active={activeCategory} counts={counts} onChange={setActiveCategory} />

            <p className="mt-6 text-sm text-text-muted" role="status">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>

            {results.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title={`No results for "${query}"`}
                  description="Try a broader term — for example, search 'penetration testing' instead of a specific tool name — or browse the Knowledge Center directly."
                  action={
                    <a href="/knowledge-center" className="text-sm font-semibold text-accent hover:underline">
                      Browse Knowledge Center &rarr;
                    </a>
                  }
                />
              </div>
            ) : (
              <StaggerGroup as="div" className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((result) => (
                  <StaggerItem key={result.id}>
                    <SearchResultCard result={result} />
                  </StaggerItem>
                ))}
              </StaggerGroup>
            )}
          </>
        ) : (
          <EmptyState title="Enter a search term above" description="Try 'penetration testing', 'SOC analyst', or 'cloud security'." />
        )}
      </div>
    </div>
  )
}
