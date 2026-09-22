import { Link } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PageHeader from '../../components/ui/PageHeader'
import { StaggerGroup, StaggerItem } from '../../components/motion/StaggerGroup'
import { PLACEHOLDER_LEARNING_PATHS } from '../../data/learningPathsPlaceholder'

export default function LearningPaths() {
  useSeo({
    title: 'Learning Paths | GIIS India',
    description: 'Beginner-to-specialist cybersecurity learning paths — Cybersecurity Beginner, Ethical Hacking, SOC Analyst, Cloud Security, Digital Forensics, GRC, Penetration Testing.',
  })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Knowledge Center', to: '/knowledge-center' }, { label: 'Learning Paths' }]} />
      <PageHeader
        eyebrow="Learning Paths"
        title="Beginner-to-Specialist Learning Paths"
        description="Fundamentals → Networking → Linux → Security Fundamentals → Specialization → Certification → Practical Experience → Career."
      />

      <div className="container py-10 md:py-14">
        <StaggerGroup as="div" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLACEHOLDER_LEARNING_PATHS.map((path) => (
            <StaggerItem key={path.id}>
              <Link
                to={`/knowledge-center/learning-paths/${path.slug}`}
                className="group flex h-full flex-col gap-2 rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-base group-hover:text-accent">{path.title}</h3>
                <p className="line-clamp-2 text-sm text-text-muted">{path.description}</p>
                <span className="mt-2 text-sm font-semibold text-accent">View Path &rarr;</span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </div>
  )
}
