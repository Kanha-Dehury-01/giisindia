import { useParams } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import { useStructuredData } from '../../hooks/useStructuredData'
import { buildBreadcrumbList } from '../../utils/structuredData'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import RevealOnScroll from '../../components/motion/RevealOnScroll'
import RoadmapSteps from '../../components/knowledge/RoadmapSteps'
import RelatedContentRail from '../../components/knowledge/RelatedContentRail'
import { findCareerBySlug } from '../../data/careersPlaceholder'
import { PLACEHOLDER_CERTIFICATIONS } from '../../data/certificationsPlaceholder'
import { PLACEHOLDER_COURSES } from '../../data/coursesPlaceholder'

function SkillList({ title, skills }) {
  if (!skills?.length) return null
  return (
    <div>
      <h3 className="text-sm font-semibold text-text-muted uppercase">{title}</h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <li key={i} className="rounded-full border border-border bg-surface-muted px-3 py-1 text-sm text-text">
            {skill}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CareerPathDetail() {
  const { slug } = useParams()
  const career = findCareerBySlug(slug)

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: 'Knowledge Center', to: '/knowledge-center' },
    { label: 'Career Paths', to: '/knowledge-center/careers' },
    { label: career?.title ?? slug },
  ]

  useSeo({ title: career ? `${career.title} Career Path | GIIS India` : 'Career Path Not Found | GIIS India', description: career?.description })
  useStructuredData(career ? [buildBreadcrumbList(breadcrumbItems)] : null)

  if (!career) {
    return (
      <div className="container py-16">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Knowledge Center', to: '/knowledge-center' }, { label: 'Not Found' }]} />
        <EmptyState title="Career path not found" action={<Button to="/knowledge-center/careers">Browse Career Paths</Button>} />
      </div>
    )
  }

  const relatedCourses = PLACEHOLDER_COURSES.filter((c) => career.related_course_slugs.includes(c.slug))
  const relatedCertifications = PLACEHOLDER_CERTIFICATIONS.filter((c) => career.related_certification_slugs.includes(c.slug))

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />

      <header className="bg-bg-inverse py-12 text-text-inverse md:py-16">
        <div className="container">
          <p className="font-display text-sm font-semibold text-accent-on-dark uppercase">Career Path</p>
          <h1 className="mt-2 max-w-2xl text-text-inverse">{career.title}</h1>
          <p className="mt-4 max-w-xl text-text-inverse-muted">{career.description}</p>
          <Button to="/enquire?source=career_path" variant="primary" className="mt-6">
            Talk to an Advisor
          </Button>
        </div>
      </header>

      <div className="container grid gap-12 py-12 md:py-16 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <RevealOnScroll as="section">
            <h2>Skills by Level</h2>
            <div className="mt-4 flex flex-col gap-6">
              <SkillList title="Beginner" skills={career.beginner_skills} />
              <SkillList title="Intermediate" skills={career.intermediate_skills} />
              <SkillList title="Advanced" skills={career.advanced_skills} />
            </div>
          </RevealOnScroll>

          <RevealOnScroll as="section" className="mt-12">
            <h2>Tools &amp; Technologies</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {career.tools.map((tool, i) => (
                <span key={i} className="rounded-full border border-border bg-surface-muted px-4 py-1.5 text-sm text-text">
                  {tool}
                </span>
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll as="section" className="mt-12">
            <h2>Learning Roadmap</h2>
            <div className="mt-6">
              <RoadmapSteps steps={career.roadmap} />
            </div>
          </RevealOnScroll>

          <RevealOnScroll as="section" className="mt-12">
            <h2>Career Progression</h2>
            <p className="mt-4 text-text-muted">{career.career_progression}</p>
          </RevealOnScroll>
        </div>

        <aside className="h-fit rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 lg:sticky lg:top-24">
          <h2 className="text-base">Related</h2>
          <RelatedContentRail heading="Certifications" items={relatedCertifications.map((c) => ({ label: c.name, url: `/certifications/${c.slug}` }))} />
          <RelatedContentRail heading="GIIS Courses" items={relatedCourses.map((c) => ({ label: c.title, url: `/courses/${c.slug}` }))} />
        </aside>
      </div>
    </div>
  )
}
