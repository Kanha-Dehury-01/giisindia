import RevealOnScroll from '../motion/RevealOnScroll'
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup'

// Pillars from spec §12 — not yet GIIS-authored copy, kept structurally
// real (icon/title/description) so Phase 8 can swap in CMS-driven content
// without touching this component.
const PILLARS = [
  { id: 'industry', title: 'Industry-Aligned Learning', description: '[ADD PILLAR DESCRIPTION]' },
  { id: 'practical', title: 'Practical Training', description: '[ADD PILLAR DESCRIPTION]' },
  { id: 'mentors', title: 'Expert Mentors', description: '[ADD PILLAR DESCRIPTION]' },
  { id: 'certification', title: 'Certification Preparation', description: '[ADD PILLAR DESCRIPTION]' },
  { id: 'career', title: 'Career-Focused Learning', description: '[ADD PILLAR DESCRIPTION]' },
  { id: 'ecosystem', title: 'Threatsys Ecosystem', description: '[ADD PILLAR DESCRIPTION]' },
]

export default function WhyGiisSection() {
  return (
    <section className="bg-surface-muted py-16 md:py-24">
      <div className="container">
        <RevealOnScroll>
          <p className="font-display text-sm font-semibold text-accent uppercase">Why GIIS</p>
          <h2 className="mt-3 max-w-lg">A different kind of cybersecurity education</h2>
        </RevealOnScroll>

        <StaggerGroup as="div" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <StaggerItem
              key={pillar.id}
              className="rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm"
            >
              <h3>{pillar.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{pillar.description}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
