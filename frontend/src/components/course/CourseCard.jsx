import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'

/**
 * Single course card used on the homepage Top Courses section and the
 * /courses catalogue grid. All flags (is_best_seller/is_featured/is_new)
 * and content come from the `courses` table — nothing here is hardcoded
 * per-course.
 */
export default function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group flex h-full flex-col rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-2">
        {course.is_best_seller && <Badge variant="accent">Best Seller</Badge>}
        {course.is_new && <Badge variant="new">New</Badge>}
        {course.level && <Badge variant="outline">{capitalize(course.level)}</Badge>}
      </div>

      <h3 className="mt-4 group-hover:text-accent">{course.title}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-text-muted">{course.short_description}</p>

      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
        {course.duration_text && (
          <div className="flex gap-1">
            <dt className="font-medium">Duration:</dt>
            <dd>{course.duration_text}</dd>
          </div>
        )}
        <div className="flex gap-1">
          <dt className="font-medium">Mode:</dt>
          <dd>{course.mode === 'hybrid' ? 'Hybrid' : 'Classroom'}</dd>
        </div>
      </dl>

      {course.certification_name && (
        <p className="mt-3 text-xs text-text-muted">
          <span className="font-medium">Certification:</span> {course.certification_name}
        </p>
      )}

      <span className="mt-4 font-display text-sm font-semibold text-accent">View Course &rarr;</span>
    </Link>
  )
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
