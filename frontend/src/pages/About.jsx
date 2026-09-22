import StubPage from '../components/ui/StubPage'

export default function About() {
  return (
    <StubPage
      eyebrow="About GIIS"
      title="About GIIS"
      description="GIIS is the educational wing of Threatsys — [ADD GIIS INTRODUCTION COPY]."
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
      phaseNote="Full introduction, mission, and Threatsys ecosystem content lands in Phase 3."
    />
  )
}
