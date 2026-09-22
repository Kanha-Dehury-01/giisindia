import { useSeo } from '../hooks/useSeo'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PageHeader from '../components/ui/PageHeader'
import RevealOnScroll from '../components/motion/RevealOnScroll'
import NumbersStats from '../components/sections/NumbersStats'
import CareerPathwaysPreview from '../components/sections/CareerPathwaysPreview'

export default function CareerPlacement() {
  useSeo({
    title: 'Career & Placement | GIIS India',
    description: 'How GIIS supports your career and placement journey after training.',
  })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Career & Placement' }]} />
      <PageHeader eyebrow="Career & Placement" title="Career & Placement" description="[UPDATE PLACEMENT NUMBER] — placement process and outcomes." />

      <section className="container py-12 md:py-16">
        <RevealOnScroll>
          <h2>Our Placement Process</h2>
          <p className="mt-4 max-w-2xl text-text-muted">[ADD PLACEMENT PROCESS DESCRIPTION]</p>
        </RevealOnScroll>
      </section>

      <NumbersStats />
      <CareerPathwaysPreview />
    </div>
  )
}
