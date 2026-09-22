import StubPage from '../components/ui/StubPage'

// Operational resources (downloadable whitepapers/checklists), kept
// separate from the Knowledge Center per spec §24: "Do not force this
// content into the Knowledge Center if it is operational/event information."
export default function Resources() {
  return (
    <StubPage
      eyebrow="Resources"
      title="Resources"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }]}
      phaseNote="Listing fed from /api/resources lands alongside Phase 3."
    />
  )
}
