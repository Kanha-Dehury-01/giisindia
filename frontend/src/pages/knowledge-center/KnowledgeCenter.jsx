import StubPage from '../../components/ui/StubPage'

export default function KnowledgeCenter() {
  return (
    <StubPage
      eyebrow="Knowledge Center"
      title="What do you want to learn about?"
      description="A comprehensive cybersecurity learning library — fundamentals through advanced concepts, careers, and certifications."
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Knowledge Center' }]}
      phaseNote="Global search bar, content-type browsing, and related-content architecture land in Phase 5."
    />
  )
}
