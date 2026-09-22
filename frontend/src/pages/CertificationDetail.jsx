import { useParams } from 'react-router-dom'
import StubPage from '../components/ui/StubPage'

export default function CertificationDetail() {
  const { slug } = useParams()

  return (
    <StubPage
      eyebrow="Certification"
      title={slug}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Certifications', to: '/certifications' },
        { label: slug },
      ]}
      phaseNote="What it is, who it's for, prerequisites, skills, career relevance, related GIIS program — Phase 6."
    />
  )
}
