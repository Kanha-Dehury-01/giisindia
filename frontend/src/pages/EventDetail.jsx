import { useParams } from 'react-router-dom'
import StubPage from '../components/ui/StubPage'

export default function EventDetail() {
  const { slug } = useParams()

  return (
    <StubPage
      eyebrow="Event"
      title={slug}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Events', to: '/events' }, { label: slug }]}
      phaseNote="Driven by /api/events/{slug}."
    />
  )
}
