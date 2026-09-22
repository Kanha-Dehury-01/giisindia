import StubPage from '../components/ui/StubPage'

export default function Certifications() {
  return (
    <StubPage
      eyebrow="Certification Explorer"
      title="Certifications"
      description="Discover certifications by level, domain, and career goal."
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Certifications' }]}
      phaseNote="Filterable certification explorer lands in Phase 6."
    />
  )
}
