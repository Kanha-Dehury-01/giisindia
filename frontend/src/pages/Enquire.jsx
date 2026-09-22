import { useSearchParams } from 'react-router-dom'
import StubPage from '../components/ui/StubPage'

// Shared enquiry entry point — reached from header CTA, course pages,
// career cards, and the final homepage CTA, each passing a `source`
// query param so the enquiry's source_page is captured accurately
// (docs/ARCHITECTURE.md §E, spec §31).
export default function Enquire() {
  const [params] = useSearchParams()
  const course = params.get('course')

  return (
    <StubPage
      eyebrow="Enquire Now"
      title={course ? `Enquire about ${course}` : 'Talk to a GIIS Advisor'}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Enquire' }]}
      phaseNote="Full enquiry form (name/phone/email/course/city/contact preference/message), posting to /api/enquiries, lands in Phase 3."
    />
  )
}
