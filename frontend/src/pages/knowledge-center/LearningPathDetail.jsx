import { useParams } from 'react-router-dom'
import StubPage from '../../components/ui/StubPage'

export default function LearningPathDetail() {
  const { slug } = useParams()

  return (
    <StubPage
      eyebrow="Learning Path"
      title={slug}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Knowledge Center', to: '/knowledge-center' },
        { label: 'Learning Paths', to: '/knowledge-center/learning-paths' },
        { label: slug },
      ]}
      phaseNote="Fundamentals → Networking → Linux → Security Fundamentals → Specialization → Certification → Practical Experience → Career step flow — Phase 6."
    />
  )
}
