import StubPage from '../components/ui/StubPage'

export default function Faq() {
  return (
    <StubPage
      eyebrow="FAQ"
      title="Frequently Asked Questions"
      description="Courses, admissions, classroom training, certifications, careers, placements, and Knowledge Center."
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]}
      phaseNote="Categorized accordion lands in Phase 3, driven by /api/faqs. FAQPage structured data only where the visible content genuinely matches (docs/ARCHITECTURE.md §L)."
    />
  )
}
