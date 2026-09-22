import RevealOnScroll from '../motion/RevealOnScroll'
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup'
import Button from '../ui/Button'

const PLACEHOLDER_ITEMS = [
  { id: 1, type: 'Workshop', title: '[EVENT TITLE]', date: '[DATE]' },
  { id: 2, type: 'Webinar', title: '[EVENT TITLE]', date: '[DATE]' },
  { id: 3, type: 'Resource', title: '[RESOURCE TITLE]', date: null },
]

export default function EventsResourcesPreview({ items = PLACEHOLDER_ITEMS }) {
  return (
    <section className="bg-surface-muted py-16 md:py-24">
      <div className="container">
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-sm font-semibold text-accent uppercase">Events &amp; Resources</p>
              <h2 className="mt-2 max-w-lg">Workshops, webinars, and learning resources</h2>
            </div>
            <Button to="/events" variant="ghost">
              View All
            </Button>
          </div>
        </RevealOnScroll>

        <StaggerGroup as="div" className="mt-10 grid gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <StaggerItem
              key={item.id}
              className="rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6"
            >
              <p className="text-xs font-semibold tracking-wide text-accent uppercase">{item.type}</p>
              <h3 className="mt-2 text-base">{item.title}</h3>
              {item.date && <p className="mt-2 text-sm text-text-muted">{item.date}</p>}
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
