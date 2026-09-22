import RevealOnScroll from '../motion/RevealOnScroll'
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup'
import Button from '../ui/Button'

// Real certification logos are media-library assets (Phase 8's
// `certifications` table + media library) — placeholders keep layout real.
const PLACEHOLDER_CERTS = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, name: '[CERTIFICATION]' }))

export default function CertificationsShowcase() {
  return (
    <section className="bg-surface-muted py-16 md:py-24">
      <div className="container">
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-sm font-semibold text-accent uppercase">Certifications</p>
              <h2 className="mt-2 max-w-lg">Globally recognized, industry-aligned</h2>
            </div>
            <Button to="/certifications" variant="ghost">
              Explore Certifications
            </Button>
          </div>
        </RevealOnScroll>

        <StaggerGroup as="div" className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {PLACEHOLDER_CERTS.map((cert) => (
            <StaggerItem
              key={cert.id}
              className="flex aspect-square items-center justify-center rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-4 text-center text-xs text-text-muted"
            >
              {cert.name}
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
