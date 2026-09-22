import { Link } from 'react-router-dom'
import RevealOnScroll from '../motion/RevealOnScroll'
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup'
import Button from '../ui/Button'

const CONTENT_TYPES = [
  { label: 'Fundamentals', to: '/knowledge-center?type=fundamental', description: 'Core concepts to start from zero.' },
  { label: 'Career Paths', to: '/knowledge-center/learning-paths', description: 'What each cybersecurity role actually does.' },
  { label: 'Certifications', to: '/certifications', description: 'Explore certifications by level and domain.' },
  { label: 'Glossary', to: '/knowledge-center/glossary', description: 'Cybersecurity terms, explained clearly.' },
]

export default function KnowledgeCenterPreview() {
  return (
    <section className="bg-surface-muted py-16 md:py-24">
      <div className="container">
        <RevealOnScroll>
          <p className="font-display text-sm font-semibold text-accent uppercase">Knowledge Center</p>
          <h2 className="mt-2 max-w-lg">A learning library, not just a blog</h2>
          <p className="mt-3 max-w-xl text-text-muted">
            Fundamentals through advanced concepts, career paths, learning paths, and a full cybersecurity glossary.
          </p>
        </RevealOnScroll>

        <StaggerGroup as="div" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CONTENT_TYPES.map((type) => (
            <StaggerItem key={type.label}>
              <Link
                to={type.to}
                className="group flex h-full flex-col gap-2 rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="font-display text-base font-semibold text-text group-hover:text-accent">
                  {type.label}
                </span>
                <span className="text-sm text-text-muted">{type.description}</span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="mt-8 text-center">
          <Button to="/knowledge-center" variant="primary">
            Explore Knowledge Center
          </Button>
        </div>
      </div>
    </section>
  )
}
