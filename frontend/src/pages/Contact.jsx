import StubPage from '../components/ui/StubPage'

export default function Contact() {
  return (
    <StubPage
      eyebrow="Contact"
      title="Contact GIIS"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      phaseNote="Contact details (from site_settings) + enquiry form land in Phase 3."
    />
  )
}
