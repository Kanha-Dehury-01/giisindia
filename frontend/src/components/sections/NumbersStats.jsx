import RevealOnScroll from '../motion/RevealOnScroll'
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup'
import AnimatedCounter from '../motion/AnimatedCounter'

// Matches the `statistics` table shape exactly (docs/ARCHITECTURE.md §E) —
// seeded in database/schema.sql with these same placeholder values, so
// this is the same content the CMS will show until Phase 8 wires the
// real /api/statistics fetch. Every value is a string; only genuinely
// numeric ones get the count-up treatment (see isNumeric below) — a
// placeholder is never presented as though it were a real, counted stat.
const PLACEHOLDER_STATS = [
  { id: 1, label: 'Students Trained', value: '[UPDATE BEFORE LAUNCH]', suffix: '' },
  { id: 2, label: 'Students Placed', value: '[UPDATE BEFORE LAUNCH]', suffix: '' },
  { id: 3, label: 'Certifications Offered', value: '[UPDATE BEFORE LAUNCH]', suffix: '' },
  { id: 4, label: 'Industry Partners', value: '[UPDATE BEFORE LAUNCH]', suffix: '' },
  { id: 5, label: 'Programs', value: '[UPDATE BEFORE LAUNCH]', suffix: '' },
  { id: 6, label: 'Years of Experience', value: '[UPDATE BEFORE LAUNCH]', suffix: '' },
]

function isNumeric(value) {
  return /^\d+$/.test(String(value).trim())
}

export default function NumbersStats({ stats = PLACEHOLDER_STATS }) {
  return (
    <section className="bg-bg-inverse py-16 text-text-inverse md:py-24">
      <div className="container">
        <RevealOnScroll>
          <h2 className="text-text-inverse">GIIS by the numbers</h2>
        </RevealOnScroll>

        <StaggerGroup as="div" className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <StaggerItem key={stat.id} className="text-center">
              <p className="font-display text-3xl font-bold text-accent-on-dark md:text-4xl">
                {isNumeric(stat.value) ? (
                  <AnimatedCounter to={Number(stat.value)} suffix={stat.suffix} />
                ) : (
                  <span className="text-lg font-medium text-text-inverse-muted italic md:text-xl">{stat.value}</span>
                )}
              </p>
              <p className="mt-2 text-sm text-text-inverse-muted">{stat.label}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
