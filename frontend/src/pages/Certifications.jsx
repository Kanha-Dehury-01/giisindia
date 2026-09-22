import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import CertificationCard from '../components/knowledge/CertificationCard'
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup'
import { PLACEHOLDER_CERTIFICATIONS } from '../data/certificationsPlaceholder'
import { PLACEHOLDER_CAREERS } from '../data/careersPlaceholder'

const LEVELS = ['beginner', 'intermediate', 'advanced']
const selectClass = 'h-11 rounded-md border border-border bg-surface px-3 text-sm text-text focus-visible:outline-none'

// Certification discovery (spec §22): filter by level/domain/career goal.
// "Career goal" filters to certifications linked from that career's
// related_certification_slugs (docs/ARCHITECTURE.md's career_certification_links).
export default function Certifications() {
  const [params, setParams] = useSearchParams()
  const level = params.get('level') ?? ''
  const domain = params.get('domain') ?? ''
  const careerGoal = params.get('career') ?? ''

  const domains = useMemo(() => Array.from(new Set(PLACEHOLDER_CERTIFICATIONS.map((c) => c.domain))), [])

  useSeo({
    title: 'Certification Explorer | GIIS India',
    description: 'Discover cybersecurity certifications by level, domain, and career goal.',
  })

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  const filtered = PLACEHOLDER_CERTIFICATIONS.filter((c) => {
    if (level && c.level !== level) return false
    if (domain && c.domain !== domain) return false
    if (careerGoal) {
      const career = PLACEHOLDER_CAREERS.find((k) => k.slug === careerGoal)
      if (!career?.related_certification_slugs.includes(c.slug)) return false
    }
    return true
  })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Certifications' }]} />
      <PageHeader eyebrow="Certification Explorer" title="Certifications" description="Discover certifications by level, domain, and career goal." />

      <div className="container py-10 md:py-14">
        <div className="flex flex-wrap gap-3">
          <select className={selectClass} value={level} onChange={(e) => updateParam('level', e.target.value)} aria-label="Level">
            <option value="">All Levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>
          <select className={selectClass} value={domain} onChange={(e) => updateParam('domain', e.target.value)} aria-label="Domain">
            <option value="">All Domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select className={selectClass} value={careerGoal} onChange={(e) => updateParam('career', e.target.value)} aria-label="Career goal">
            <option value="">All Career Goals</option>
            {PLACEHOLDER_CAREERS.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-6 text-sm text-text-muted" role="status">
          {filtered.length} {filtered.length === 1 ? 'certification' : 'certifications'} found
        </p>

        {filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No certifications match your filters"
              description="Try broadening your filters."
              action={
                <Button variant="ghost" onClick={() => setParams(new URLSearchParams())}>
                  Clear Filters
                </Button>
              }
            />
          </div>
        ) : (
          <StaggerGroup as="div" className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((cert) => (
              <StaggerItem key={cert.id}>
                <CertificationCard certification={cert} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </div>
  )
}
