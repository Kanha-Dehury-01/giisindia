import { useParams } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'
import { useStructuredData } from '../hooks/useStructuredData'
import { buildBreadcrumbList, buildCourseSchema } from '../utils/structuredData'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import RevealOnScroll from '../components/motion/RevealOnScroll'
import AccordionItem from '../components/ui/Accordion'
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup'
import CourseCard from '../components/course/CourseCard'
import CourseCurriculumAccordion from '../components/course/CourseCurriculumAccordion'
import { PLACEHOLDER_COURSES, findCourseBySlug } from '../data/coursesPlaceholder'
import { PLACEHOLDER_CAREERS } from '../data/careersPlaceholder'

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function CourseDetail() {
  const { slug } = useParams()
  const course = findCourseBySlug(slug)

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: 'Courses', to: '/courses' },
    { label: course?.title ?? slug },
  ]

  useSeo({
    title: course ? `${course.title} | GIIS India` : 'Course Not Found | GIIS India',
    description: course?.short_description,
  })

  useStructuredData(
    course
      ? [buildBreadcrumbList(breadcrumbItems), buildCourseSchema(course, window.location.href)]
      : null,
  )

  if (!course) {
    return (
      <div className="container py-16">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Courses', to: '/courses' }, { label: 'Not Found' }]} />
        <EmptyState
          title="Course not found"
          description="This course may have moved or is no longer offered. Browse the full catalogue instead."
          action={<Button to="/courses">Browse All Courses</Button>}
        />
      </div>
    )
  }

  const relatedCourses = PLACEHOLDER_COURSES.filter((c) => c.category === course.category && c.id !== course.id).slice(0, 3)
  const relatedCareers = PLACEHOLDER_CAREERS.filter((career) => course.related_career_slugs?.includes(career.slug))

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />

      {/* Hero */}
      <header className="bg-bg-inverse py-12 text-text-inverse md:py-16">
        <div className="container">
          <div className="flex flex-wrap items-center gap-2">
            {course.is_best_seller && <Badge variant="accent">Best Seller</Badge>}
            {course.is_new && <Badge variant="new">New</Badge>}
            <Badge variant="outline">{capitalize(course.level)}</Badge>
          </div>
          <p className="mt-4 font-display text-sm font-semibold text-accent-on-dark uppercase">{course.category}</p>
          <h1 className="mt-2 max-w-3xl text-text-inverse">{course.title}</h1>
          <p className="mt-4 max-w-2xl text-text-inverse-muted">{course.short_description}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button to={`/enquire?course=${course.slug}`} variant="primary">
              Enquire Now
            </Button>
            <Button href="#curriculum" variant="secondary">
              View Curriculum
            </Button>
          </div>
        </div>
      </header>

      <div className="container grid gap-12 py-12 md:py-16 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="min-w-0">
          <RevealOnScroll as="section">
            <h2>Course Overview</h2>
            <p className="mt-4 text-text-muted">{course.long_description}</p>
          </RevealOnScroll>

          <RevealOnScroll as="section" className="mt-12">
            <h2>Who Is This For?</h2>
            <p className="mt-4 text-text-muted">{course.eligibility}</p>
          </RevealOnScroll>

          <RevealOnScroll as="section" className="mt-12">
            <h2>Learning Outcomes</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {course.learning_outcomes.map((outcome, i) => (
                <li key={i} className="flex gap-2 text-sm text-text-muted">
                  <CheckIcon />
                  {outcome}
                </li>
              ))}
            </ul>
          </RevealOnScroll>

          <RevealOnScroll as="section" className="mt-12" id="curriculum">
            <h2>Curriculum</h2>
            <div className="mt-4">
              <CourseCurriculumAccordion modules={course.curriculum} />
            </div>
          </RevealOnScroll>

          <RevealOnScroll as="section" className="mt-12">
            <h2>Skills You'll Build</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {course.skills.map((skill, i) => (
                <span key={i} className="rounded-full border border-border bg-surface-muted px-4 py-1.5 text-sm text-text">
                  {skill}
                </span>
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll as="section" className="mt-12">
            <h2>Tools &amp; Technologies</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {course.tools.map((tool, i) => (
                <span key={i} className="rounded-full border border-border bg-surface-muted px-4 py-1.5 text-sm text-text">
                  {tool}
                </span>
              ))}
            </div>
          </RevealOnScroll>

          {relatedCareers.length > 0 && (
            <RevealOnScroll as="section" className="mt-12">
              <h2>Career Relevance</h2>
              <p className="mt-4 text-sm text-text-muted">This program builds skills relevant to these career paths:</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {relatedCareers.map((career) => (
                  <Button key={career.id} to={`/knowledge-center/careers/${career.slug}`} variant="ghost" className="border border-border">
                    {career.title}
                  </Button>
                ))}
              </div>
            </RevealOnScroll>
          )}

          {course.faqs.length > 0 && (
            <RevealOnScroll as="section" className="mt-12">
              <h2>Frequently Asked Questions</h2>
              <div className="mt-4">
                {course.faqs.map((faq, i) => (
                  <AccordionItem key={i} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </RevealOnScroll>
          )}
        </div>

        {/* Sidebar */}
        <aside className="h-fit rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 lg:sticky lg:top-24">
          <dl className="flex flex-col gap-4 text-sm">
            <div>
              <dt className="font-medium text-text-muted">Duration</dt>
              <dd className="mt-1 text-text">{course.duration_text}</dd>
            </div>
            <div>
              <dt className="font-medium text-text-muted">Mode</dt>
              <dd className="mt-1 text-text">{course.mode === 'hybrid' ? 'Hybrid' : 'Classroom'}</dd>
            </div>
            <div>
              <dt className="font-medium text-text-muted">Level</dt>
              <dd className="mt-1 text-text">{capitalize(course.level)}</dd>
            </div>
            {course.certification_name && (
              <div>
                <dt className="font-medium text-text-muted">Certification</dt>
                <dd className="mt-1 text-text">{course.certification_name}</dd>
              </div>
            )}
          </dl>
          <Button to={`/enquire?course=${course.slug}`} variant="primary" className="mt-6 w-full">
            Enquire Now
          </Button>
        </aside>
      </div>

      {relatedCourses.length > 0 && (
        <section className="bg-surface-muted py-12 md:py-16">
          <div className="container">
            <RevealOnScroll>
              <h2>Related Courses</h2>
            </RevealOnScroll>
            <StaggerGroup as="div" className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCourses.map((related) => (
                <StaggerItem key={related.id}>
                  <CourseCard course={related} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-success" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
