import StubPage from '../components/ui/StubPage'

export default function Courses() {
  return (
    <StubPage
      eyebrow="Course Catalogue"
      title="All Courses"
      description="Search and filter GIIS's cybersecurity education and professional training programs."
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Courses' }]}
      phaseNote="Search, category/level/certification filters, and the course grid (fed from /api/courses) land in Phase 4."
    />
  )
}
