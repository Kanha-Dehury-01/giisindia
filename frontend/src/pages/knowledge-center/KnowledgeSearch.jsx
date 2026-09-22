import { useSearchParams } from 'react-router-dom'
import StubPage from '../../components/ui/StubPage'

export default function KnowledgeSearch() {
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''

  return (
    <StubPage
      eyebrow="Search"
      title={query ? `Results for "${query}"` : 'Search the Knowledge Center'}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Knowledge Center', to: '/knowledge-center' },
        { label: 'Search' },
      ]}
      phaseNote="Real search (title/description/content/keywords/tags/category, ranked, category-tabbed results) lands in Phase 5, backed by PHP + MySQL full-text search."
    />
  )
}
