import StubPage from '../../components/ui/StubPage'

// Index of all career path deep-dives (each at /knowledge-center/careers/[slug]).
// Distinct from the marketing-facing /careers hub (docs/ARCHITECTURE.md §A) —
// this one lives in the Knowledge Center's internal-linking graph.
export default function CareerPaths() {
  return (
    <StubPage
      eyebrow="Career Paths"
      title="Cybersecurity Career Paths"
      description="SOC Analyst, Ethical Hacker, Penetration Tester, and more — what each role does, the skills it needs, and how to get there."
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Knowledge Center', to: '/knowledge-center' },
        { label: 'Career Paths' },
      ]}
      phaseNote="Career path index lands in Phase 6, driven by /api/careers."
    />
  )
}
