import { COURSE_CATEGORIES, COURSE_LEVELS } from '../../data/coursesPlaceholder'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'best_sellers', label: 'Best Sellers First' },
  { value: 'az', label: 'A–Z' },
]

const selectClass =
  'h-11 rounded-md border border-border bg-surface px-3 text-sm text-text focus-visible:outline-none'

/**
 * Search + category/level/certification filters + sort, per spec §11.
 * Fully controlled — Courses.jsx owns the filter state so it can sync it
 * to the URL query string (so links like /courses?category=X from the
 * homepage work, and filtered views are shareable/bookmarkable).
 */
export default function CourseFilterBar({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value })

  return (
    <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center">
      <div className="flex-1 md:min-w-[240px]">
        <label htmlFor="course-search" className="sr-only">
          Search courses
        </label>
        <input
          id="course-search"
          type="search"
          placeholder="Search courses…"
          value={filters.query}
          onChange={(e) => update('query', e.target.value)}
          className="h-11 w-full rounded-md border border-border bg-surface px-4 text-sm text-text placeholder:text-text-muted focus-visible:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="sr-only" htmlFor="course-category">
          Category
        </label>
        <select id="course-category" className={selectClass} value={filters.category} onChange={(e) => update('category', e.target.value)}>
          <option value="">All Categories</option>
          {COURSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="course-level">
          Level
        </label>
        <select id="course-level" className={selectClass} value={filters.level} onChange={(e) => update('level', e.target.value)}>
          <option value="">All Levels</option>
          {COURSE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>

        <label className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-3 text-sm text-text">
          <input
            type="checkbox"
            checked={filters.certificationOnly}
            onChange={(e) => update('certificationOnly', e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Leads to Certification
        </label>

        <label className="sr-only" htmlFor="course-sort">
          Sort by
        </label>
        <select id="course-sort" className={selectClass} value={filters.sort} onChange={(e) => update('sort', e.target.value)}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
