import { useParams } from 'react-router-dom'
import StubPage from '../../components/ui/StubPage'

export default function CareerPathDetail() {
  const { slug } = useParams()

  return (
    <StubPage
      eyebrow="Career Path"
      title={slug}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Knowledge Center', to: '/knowledge-center' },
        { label: slug },
      ]}
      phaseNote="Role description, skills by level, tools, certifications, visual roadmap, related courses/content — Phase 6, driven by /api/careers/{slug}."
    />
  )
}
