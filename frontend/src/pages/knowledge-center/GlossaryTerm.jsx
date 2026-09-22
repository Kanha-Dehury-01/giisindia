import { useParams } from 'react-router-dom'
import StubPage from '../../components/ui/StubPage'

export default function GlossaryTerm() {
  const { slug } = useParams()

  return (
    <StubPage
      eyebrow="Glossary"
      title={slug}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Knowledge Center', to: '/knowledge-center' },
        { label: 'Glossary', to: '/knowledge-center/glossary' },
        { label: slug },
      ]}
      phaseNote="Definition, related concepts/guides/courses — Phase 6, driven by /api/glossary/{slug}."
    />
  )
}
