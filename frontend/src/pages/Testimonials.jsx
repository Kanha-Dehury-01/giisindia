import StubPage from '../components/ui/StubPage'

export default function Testimonials() {
  return (
    <StubPage
      eyebrow="Testimonials"
      title="Student Testimonials"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Testimonials' }]}
      phaseNote="Full text-based testimonial wall lands in Phase 3, driven by /api/testimonials."
    />
  )
}
