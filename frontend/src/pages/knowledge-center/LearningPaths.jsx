import StubPage from '../../components/ui/StubPage'

export default function LearningPaths() {
  return (
    <StubPage
      eyebrow="Learning Paths"
      title="Beginner-to-Specialist Learning Paths"
      description="Cybersecurity Beginner, Ethical Hacking, SOC Analyst, Cloud Security, Digital Forensics, GRC, Penetration Testing."
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Knowledge Center', to: '/knowledge-center' },
        { label: 'Learning Paths' },
      ]}
      phaseNote="Learning path index lands in Phase 6, driven by /api/learning-paths."
    />
  )
}
