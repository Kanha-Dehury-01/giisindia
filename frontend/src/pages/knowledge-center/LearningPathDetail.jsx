import { useParams } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import { useStructuredData } from '../../hooks/useStructuredData'
import { buildBreadcrumbList } from '../../utils/structuredData'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import RevealOnScroll from '../../components/motion/RevealOnScroll'
import RoadmapSteps from '../../components/knowledge/RoadmapSteps'
import { findLearningPathBySlug } from '../../data/learningPathsPlaceholder'

export default function LearningPathDetail() {
  const { slug } = useParams()
  const path = findLearningPathBySlug(slug)

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: 'Knowledge Center', to: '/knowledge-center' },
    { label: 'Learning Paths', to: '/knowledge-center/learning-paths' },
    { label: path?.title ?? slug },
  ]

  useSeo({ title: path ? `${path.title} | GIIS India` : 'Learning Path Not Found | GIIS India', description: path?.description })
  useStructuredData(path ? [buildBreadcrumbList(breadcrumbItems)] : null)

  if (!path) {
    return (
      <div className="container py-16">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Knowledge Center', to: '/knowledge-center' }, { label: 'Not Found' }]} />
        <EmptyState title="Learning path not found" action={<Button to="/knowledge-center/learning-paths">Browse Learning Paths</Button>} />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />

      <header className="bg-bg-inverse py-12 text-text-inverse md:py-16">
        <div className="container">
          <p className="font-display text-sm font-semibold text-accent-on-dark uppercase">Learning Path</p>
          <h1 className="mt-2 max-w-2xl text-text-inverse">{path.title}</h1>
          <p className="mt-4 max-w-xl text-text-inverse-muted">{path.description}</p>
          <p className="mt-2 text-sm text-text-inverse-muted">
            <span className="font-semibold">Who it's for:</span> {path.target_audience}
          </p>
        </div>
      </header>

      <div className="container max-w-2xl py-12 md:py-16">
        <RevealOnScroll>
          <h2>Your Roadmap</h2>
        </RevealOnScroll>
        <div className="mt-6">
          <RoadmapSteps steps={path.steps} />
        </div>

        <div className="mt-10 rounded-[var(--card-radius)] border border-dashed border-border bg-surface-muted p-8 text-center">
          <h3 className="text-base">Ready to start this path?</h3>
          <Button to="/enquire?source=learning_path" variant="primary" className="mt-4">
            Talk to an Advisor
          </Button>
        </div>
      </div>
    </div>
  )
}
