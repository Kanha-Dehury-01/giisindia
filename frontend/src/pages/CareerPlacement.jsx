import StubPage from '../components/ui/StubPage'

export default function CareerPlacement() {
  return (
    <StubPage
      eyebrow="Career & Placement"
      title="Career & Placement"
      description="[UPDATE PLACEMENT NUMBER] — placement process and outcomes."
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Career & Placement' }]}
      phaseNote="Placement statistics and process content lands in Phase 3/6, driven by /api/statistics."
    />
  )
}
