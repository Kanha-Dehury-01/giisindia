import { useParams } from 'react-router-dom'
import StubPage from '../../components/ui/StubPage'

// Knowledge-side certification explainer (spec §17/§22) — distinct from
// the marketing-facing /certifications/[slug] page; this one lives in the
// Knowledge Center's internal-linking graph and links out to that page.
export default function CertificationExplainer() {
  const { slug } = useParams()

  return (
    <StubPage
      eyebrow="Certification"
      title={slug}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Knowledge Center', to: '/knowledge-center' },
        { label: slug },
      ]}
      phaseNote="Phase 6, driven by /api/certifications/{slug}."
    />
  )
}
