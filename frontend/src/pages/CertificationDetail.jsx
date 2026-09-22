import { useParams } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'
import { useStructuredData } from '../hooks/useStructuredData'
import { buildBreadcrumbList } from '../utils/structuredData'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import RevealOnScroll from '../components/motion/RevealOnScroll'
import RelatedContentRail from '../components/knowledge/RelatedContentRail'
import { findCertificationBySlug } from '../data/certificationsPlaceholder'
import { PLACEHOLDER_COURSES } from '../data/coursesPlaceholder'
import { PLACEHOLDER_CAREERS } from '../data/careersPlaceholder'

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function CertificationDetail() {
  const { slug } = useParams()
  const cert = findCertificationBySlug(slug)

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: 'Certifications', to: '/certifications' },
    { label: cert?.name ?? slug },
  ]

  useSeo({ title: cert ? `${cert.name} | GIIS India` : 'Certification Not Found | GIIS India', description: cert?.short_description })
  useStructuredData(cert ? [buildBreadcrumbList(breadcrumbItems)] : null)

  if (!cert) {
    return (
      <div className="container py-16">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Certifications', to: '/certifications' }, { label: 'Not Found' }]} />
        <EmptyState title="Certification not found" action={<Button to="/certifications">Browse Certifications</Button>} />
      </div>
    )
  }

  const relatedCourse = PLACEHOLDER_COURSES.find((c) => c.certification_name === cert.name)
  const relatedCareers = PLACEHOLDER_CAREERS.filter((c) => c.related_certification_slugs.includes(cert.slug))

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />

      <header className="border-b border-border bg-surface-muted py-12 md:py-16">
        <div className="container">
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">{capitalize(cert.level)}</Badge>
            <Badge variant="outline">{cert.domain}</Badge>
          </div>
          <h1 className="mt-4 max-w-2xl">{cert.name}</h1>
          <p className="mt-4 max-w-xl text-text-muted">{cert.short_description}</p>
        </div>
      </header>

      <div className="container grid gap-12 py-12 md:py-16 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <RevealOnScroll as="section">
            <h2>What It Is</h2>
            <p className="mt-4 text-text-muted">{cert.body}</p>
          </RevealOnScroll>
          <RevealOnScroll as="section" className="mt-12">
            <h2>Prerequisites</h2>
            <p className="mt-4 text-text-muted">{cert.prerequisites}</p>
          </RevealOnScroll>
          <RevealOnScroll as="section" className="mt-12">
            <h2>Skills Covered</h2>
            <p className="mt-4 text-text-muted">{cert.skills}</p>
          </RevealOnScroll>
          <RevealOnScroll as="section" className="mt-12">
            <h2>Career Relevance</h2>
            <p className="mt-4 text-text-muted">{cert.career_relevance}</p>
          </RevealOnScroll>
        </div>

        <aside className="h-fit rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 lg:sticky lg:top-24">
          <h2 className="text-base">Related</h2>
          {relatedCourse && (
            <RelatedContentRail heading="GIIS Program" items={[{ label: relatedCourse.title, url: `/courses/${relatedCourse.slug}` }]} />
          )}
          <RelatedContentRail heading="Career Paths" items={relatedCareers.map((c) => ({ label: c.title, url: `/knowledge-center/careers/${c.slug}` }))} />
          <Button to="/enquire?source=certification" variant="primary" className="mt-6 w-full">
            Enquire Now
          </Button>
        </aside>
      </div>
    </div>
  )
}
