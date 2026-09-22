import StubPage from '../components/ui/StubPage'

// One template, five routes (Privacy/Terms/Cookie/Disclaimer/Refund).
// Real copy is CMS-editable content (spec §43) — nothing here is
// authored legal text, and final copy requires legal review before launch.
export default function LegalPage({ title }) {
  return (
    <StubPage
      title={title}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: title }]}
      phaseNote="[LEGAL COPY PENDING REVIEW] — final text must be supplied/reviewed by GIIS/legal authority before launch, per docs/ARCHITECTURE.md §O."
    />
  )
}
