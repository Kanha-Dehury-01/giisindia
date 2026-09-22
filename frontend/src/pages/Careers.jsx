import { Link } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup'
import { PLACEHOLDER_CAREERS } from '../data/careersPlaceholder'

// Marketing-facing career exploration (spec §15) — lighter card grid than
// the Knowledge Center's /knowledge-center/careers index, both pointing
// at the same underlying career path detail pages (docs/ARCHITECTURE.md §A).
export default function Careers() {
  useSeo({
    title: 'Explore Cybersecurity Careers | GIIS India',
    description: 'SOC Analyst, Ethical Hacker, Penetration Tester, Security Engineer, and more — explore where a GIIS program can take you.',
  })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Careers' }]} />
      <PageHeader
        eyebrow="Career Exploration"
        title="Explore Cybersecurity Careers"
        description="SOC Analyst, Ethical Hacker, Penetration Tester, Security Engineer, and more."
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

        <div className="mt-10 flex flex-col items-center gap-3 rounded-[var(--card-radius)] border border-dashed border-border bg-surface-muted p-8 text-center">
          <h2 className="text-lg">Not sure which path fits you?</h2>
          <p className="max-w-md text-sm text-text-muted">Talk to a GIIS advisor about your goals and the right program to get there.</p>
          <Button to="/enquire?source=careers" variant="primary" className="mt-2">
            Talk to an Advisor
          </Button>
        </div>
      </div>
    </div>
  )
}
