import StubPage from '../components/ui/StubPage'

export default function Careers() {
  return (
    <StubPage
      eyebrow="Career Exploration"
      title="Explore Cybersecurity Careers"
      description="SOC Analyst, Ethical Hacker, Penetration Tester, Security Engineer, and more."
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Careers' }]}
      phaseNote="Interactive career cards/pathways land in Phase 6; deep role pages live under /knowledge-center/careers/[slug]."
    />
  )
}
