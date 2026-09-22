import { Link } from 'react-router-dom'
import RevealOnScroll from '../motion/RevealOnScroll'
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup'
import { PLACEHOLDER_COURSES } from '../../data/coursesPlaceholder'

function groupByCategory(courses) {
  const map = new Map()
  courses.forEach((course) => {
    const key = course.category ?? 'Uncategorized'
    if (!map.has(key)) map.set(key, 0)
    map.set(key, map.get(key) + 1)
  })
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
}

export default function CoursesByCategory({ courses = PLACEHOLDER_COURSES }) {
  const categories = groupByCategory(courses)

  return (
    <section className="bg-surface-muted py-16 md:py-24">
      <div className="container">
        <RevealOnScroll>
          <p className="font-display text-sm font-semibold text-accent uppercase">Course Catalogue</p>
          <h2 className="mt-2 max-w-lg">Explore courses by category</h2>
        </RevealOnScroll>

        <StaggerGroup as="div" className="mt-10 grid gap-6 sm:grid-cols-2">
          {categories.map((category) => (
            <StaggerItem key={category.name}>
              <Link
                to={`/courses?category=${encodeURIComponent(category.name)}`}
                className="group flex items-center justify-between rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="font-display text-base font-semibold text-text group-hover:text-accent">
                  {category.name}
                </span>
                <span className="text-sm text-text-muted">{category.count} programs</span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
