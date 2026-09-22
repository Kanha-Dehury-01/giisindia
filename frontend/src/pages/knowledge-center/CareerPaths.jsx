import { Link } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PageHeader from '../../components/ui/PageHeader'
import { StaggerGroup, StaggerItem } from '../../components/motion/StaggerGroup'
import { PLACEHOLDER_CAREERS } from '../../data/careersPlaceholder'

export default function CareerPaths() {
  useSeo({
    title: 'Cybersecurity Career Paths | GIIS India',
    description: 'SOC Analyst, Ethical Hacker, Penetration Tester, and more — what each role does, the skills it needs, and how to get there.',
  })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Knowledge Center', to: '/knowledge-center' }, { label: 'Career Paths' }]} />
      <PageHeader
        eyebrow="Career Paths"
        title="Cybersecurity Career Paths"
        description="What each role does, the skills it needs, and how to get there."
      />

      <div className="container py-10 md:py-14">
        <StaggerGroup as="div" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLACEHOLDER_CAREERS.map((career) => (
            <StaggerItem key={career.id}>
              <Link
                to={`/knowledge-center/careers/${career.slug}`}
                className="group flex h-full flex-col gap-2 rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-base group-hover:text-accent">{career.title}</h3>
                <p className="line-clamp-2 text-sm text-text-muted">{career.description}</p>
                <span className="mt-2 text-sm font-semibold text-accent">Explore Path &rarr;</span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </div>
  )
}
