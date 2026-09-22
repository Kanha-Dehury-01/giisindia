import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { usePagination } from '../hooks/usePagination'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'
import Button from '../components/ui/Button'
import CourseFilterBar from '../components/course/CourseFilterBar'
import CourseCard from '../components/course/CourseCard'
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup'
import { PLACEHOLDER_COURSES } from '../data/coursesPlaceholder'

const PER_PAGE = 9

// Reads/writes filter state directly to the URL query string (spec §11's
// filters must be shareable/bookmarkable, and this is what makes links
// like /courses?category=X from the homepage and footer actually work).
export default function Courses({ courses = PLACEHOLDER_COURSES }) {
  const [params, setParams] = useSearchParams()

  const filters = {
    query: params.get('q') ?? '',
    category: params.get('category') ?? '',
    level: params.get('level') ?? '',
    certificationOnly: params.get('cert') === '1',
    sort: params.get('sort') ?? 'relevance',
  }
  const page = Number(params.get('page') ?? '1')

  const debouncedQuery = useDebouncedValue(filters.query, 250)

  useSeo({
    title: 'Course Catalogue | GIIS India',
    description:
      'Search and filter GIIS cybersecurity education and professional training programs by category, level, and certification.',
  })

  const setFilters = (next) => {
    const nextParams = new URLSearchParams()
    if (next.query) nextParams.set('q', next.query)
    if (next.category) nextParams.set('category', next.category)
    if (next.level) nextParams.set('level', next.level)
    if (next.certificationOnly) nextParams.set('cert', '1')
    if (next.sort && next.sort !== 'relevance') nextParams.set('sort', next.sort)
    // Any filter change resets to page 1 — staying on page 4 of a
    // narrowed-down result set would silently show an empty page.
    setParams(nextParams)
  }

  const setPage = (nextPage) => {
    const nextParams = new URLSearchParams(params)
    if (nextPage <= 1) nextParams.delete('page')
    else nextParams.set('page', String(nextPage))
    setParams(nextParams)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    let result = courses.filter((course) => {
      if (q && !`${course.title} ${course.short_description}`.toLowerCase().includes(q)) return false
      if (filters.category && course.category !== filters.category) return false
      if (filters.level && course.level !== filters.level) return false
      if (filters.certificationOnly && !course.certification_name) return false
      return true
    })

    if (filters.sort === 'best_sellers') {
      result = [...result].sort((a, b) => Number(b.is_best_seller) - Number(a.is_best_seller))
    } else if (filters.sort === 'az') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title))
    }

    return result
  }, [courses, debouncedQuery, filters.category, filters.level, filters.certificationOnly, filters.sort])

  const { pageItems, totalItems, totalPages, page: safePage } = usePagination(filtered, page, PER_PAGE)

  const clearFilters = () => setParams(new URLSearchParams())

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Courses' }]} />
      <PageHeader
        eyebrow="Course Catalogue"
        title="All Courses"
        description="Search and filter GIIS's cybersecurity education and professional training programs."
      />

      <div className="container py-10 md:py-14">
        <CourseFilterBar filters={filters} onChange={setFilters} />

        <p className="mt-6 text-sm text-text-muted" role="status">
          {totalItems} {totalItems === 1 ? 'course' : 'courses'} found
        </p>

        {pageItems.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No courses match your filters"
              description="Try a broader search term, or clear filters to see the full catalogue."
              action={
                <Button variant="ghost" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              }
            />
          </div>
        ) : (
          <StaggerGroup as="div" className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((course) => (
              <StaggerItem key={course.id}>
                <CourseCard course={course} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}

        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  )
}
