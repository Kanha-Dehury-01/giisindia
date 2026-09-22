import StubPage from '../../components/ui/StubPage'

export default function Glossary() {
  return (
    <StubPage
      eyebrow="Glossary"
      title="Cybersecurity Glossary"
      description="A-Z index of cybersecurity terms."
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Knowledge Center', to: '/knowledge-center' },
        { label: 'Glossary' },
      ]}
      phaseNote="A-Z navigation + search lands in Phase 6, driven by /api/glossary."
    />
  )
}
