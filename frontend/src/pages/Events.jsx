import StubPage from '../components/ui/StubPage'

export default function Events() {
  return (
    <StubPage
      eyebrow="Events"
      title="Events, Workshops & Webinars"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Events' }]}
      phaseNote="Listing fed from /api/events lands alongside Phase 3."
    />
  )
}
