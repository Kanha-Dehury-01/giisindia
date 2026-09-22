import { Link } from 'react-router-dom'
import RevealOnScroll from '../motion/RevealOnScroll'
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup'
import Button from '../ui/Button'
import { PLACEHOLDER_CAREERS } from '../../data/careersPlaceholder'

export default function CareerPathwaysPreview({ careers = PLACEHOLDER_CAREERS.slice(0, 8) }) {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <RevealOnScroll>
          <p className="font-display text-sm font-semibold text-accent uppercase">Career & Placement</p>
          <h2 className="mt-2 max-w-lg">Where a GIIS program can take you</h2>
        </RevealOnScroll>

        <StaggerGroup as="div" className="mt-10 flex flex-wrap gap-3">
          {careers.map((career) => (
            <StaggerItem key={career.id}>
              <Link
                to={`/knowledge-center/careers/${career.slug}`}
                className="inline-flex min-h-[44px] items-center rounded-full border border-border bg-surface px-5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
              >
                {career.title}
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="mt-8">
          <Button to="/careers/placement" variant="ghost">
            View Career & Placement
          </Button>
        </div>
      </div>
    </section>
  )
}
