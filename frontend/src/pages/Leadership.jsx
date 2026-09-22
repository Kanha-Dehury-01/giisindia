import StubPage from '../components/ui/StubPage'

export default function Leadership() {
  return (
    <StubPage
      eyebrow="People"
      title="Leadership & Faculty"
      description="Leadership, faculty, and industry mentors at GIIS."
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Leadership' }]}
      phaseNote="Profile grid (photo, designation, bio, expertise, certifications) fed from /api/team lands in Phase 6."
    />
  )
}
