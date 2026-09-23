import { useMemo } from 'react'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PageHeader from '../components/ui/PageHeader'
import AccordionItem from '../components/ui/Accordion'
import RevealOnScroll from '../components/motion/RevealOnScroll'
import { useSeo } from '../hooks/useSeo'
import { useStructuredData } from '../hooks/useStructuredData'
import { buildBreadcrumbList, buildFaqPageSchema } from '../utils/structuredData'
import { PLACEHOLDER_FAQS } from '../data/faqsPlaceholder'

const CATEGORY_LABELS = {
  courses: 'Courses',
  admissions: 'Admissions',
  classroom_training: 'Classroom Training',
  certifications: 'Certifications',
  careers: 'Careers',
  placements: 'Placements',
  knowledge_center: 'Knowledge Center',
}

const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'FAQ' }]

/**
 * The full FAQ list, categorized. FAQPage structured data is only valid
 * here because every visible Q&A on this page IS the schema's content —
 * the homepage's FaqSection deliberately shows a subset and skips the
 * schema for exactly that reason (docs/ARCHITECTURE.md §L).
 */
export default function Faq() {
  useSeo({
    title: 'Frequently Asked Questions | GIIS India',
    description: 'Answers about GIIS cybersecurity courses, admissions, classroom training, certifications, careers, placements, and the Knowledge Center.',
    canonical: '/faq',
  })

  const schemas = useMemo(() => [buildBreadcrumbList(breadcrumbs), buildFaqPageSchema(PLACEHOLDER_FAQS)], [])
  useStructuredData(schemas)

  const grouped = useMemo(() => {
    const byCategory = {}
    PLACEHOLDER_FAQS.forEach((faq) => {
      byCategory[faq.category] = byCategory[faq.category] ?? []
      byCategory[faq.category].push(faq)
    })
    return byCategory
  }, [])

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />
      <PageHeader
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        description="Courses, admissions, classroom training, certifications, careers, placements, and Knowledge Center."
      />

      <div className="container max-w-3xl py-12 md:py-16">
        {Object.entries(grouped).map(([category, faqs]) => (
          <RevealOnScroll key={category} className="mb-10 last:mb-0">
            <h2 className="mb-2 text-lg">{CATEGORY_LABELS[category] ?? category}</h2>
            <div>
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  )
}
