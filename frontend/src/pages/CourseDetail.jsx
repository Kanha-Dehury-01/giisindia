import { useParams } from 'react-router-dom'
import StubPage from '../components/ui/StubPage'

export default function CourseDetail() {
  const { slug } = useParams()

  return (
    <StubPage
      eyebrow="Course"
      title={`Course: ${slug}`}
      description="[GIIS COURSE DESCRIPTION]"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Courses', to: '/courses' }, { label: slug }]}
      phaseNote="Full template (overview, outcomes, curriculum, skills, tools, certification, eligibility, related careers, FAQ, enquiry CTA) lands in Phase 4, driven by /api/courses/{slug}."
    />
  )
}
