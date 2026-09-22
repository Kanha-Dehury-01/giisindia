import RevealOnScroll from '../motion/RevealOnScroll'
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup'
import CourseCard from '../course/CourseCard'
import Button from '../ui/Button'
import { PLACEHOLDER_COURSES } from '../../data/coursesPlaceholder'

// Admin controls which courses appear here via is_best_seller/is_featured/
// display_order (spec §10) — this component never hardcodes which courses
// to show, it just renders whatever `courses` it's given.
export default function TopCourses({ courses }) {
  const featured = (courses ?? PLACEHOLDER_COURSES.filter((c) => c.is_best_seller)).slice(0, 6)

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-sm font-semibold text-accent uppercase">Top Courses</p>
              <h2 className="mt-2 max-w-lg">Start with what students choose most.</h2>
            </div>
            <Button to="/courses" variant="ghost">
              View All Courses
            </Button>
          </div>
        </RevealOnScroll>

        <StaggerGroup as="div" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((course) => (
            <StaggerItem key={course.id}>
              <CourseCard course={course} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
