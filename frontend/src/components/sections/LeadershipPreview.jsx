import RevealOnScroll from '../motion/RevealOnScroll'
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup'
import Button from '../ui/Button'
import { PLACEHOLDER_TEAM } from '../../data/teamPlaceholder'

export default function LeadershipPreview({ team = PLACEHOLDER_TEAM }) {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-sm font-semibold text-accent uppercase">Leadership</p>
              <h2 className="mt-2 max-w-lg">Guided by cybersecurity practitioners</h2>
            </div>
            <Button to="/leadership" variant="ghost">
              Meet the Team
            </Button>
          </div>
        </RevealOnScroll>

        <StaggerGroup as="div" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <StaggerItem
              key={member.id}
              className="rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-center"
            >
              <div className="mx-auto h-20 w-20 rounded-full bg-surface-muted" aria-hidden="true" />
              <h3 className="mt-4 text-base">{member.name}</h3>
              <p className="text-sm text-text-muted">{member.designation}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
