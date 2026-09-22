import RevealOnScroll from '../motion/RevealOnScroll'
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup'

const FEATURES = [
  { title: 'Instructor-Led Classroom Training', description: '[ADD DESCRIPTION]' },
  { title: 'Hands-On Practical Sessions', description: '[ADD DESCRIPTION]' },
  { title: 'Real Tools & Environments', description: '[ADD DESCRIPTION]' },
]

export default function LearningExperience() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <RevealOnScroll>
          <p className="font-display text-sm font-semibold text-accent uppercase">Learning Experience</p>
          <h2 className="mt-2 max-w-lg">How you'll actually learn at GIIS</h2>
        </RevealOnScroll>

        <StaggerGroup as="div" className="mt-10 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title} className="border-l-2 border-accent pl-5">
              <h3 className="text-base">{feature.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{feature.description}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
