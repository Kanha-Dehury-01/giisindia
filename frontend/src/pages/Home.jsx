import { useSeo } from '../hooks/useSeo'
import HeroSlider from '../components/sections/hero/HeroSlider'
import TrustStrip from '../components/sections/TrustStrip'
import Introduction from '../components/sections/Introduction'
import NumbersStats from '../components/sections/NumbersStats'
import WhyGiisSection from '../components/sections/WhyGiisSection'
import TopCourses from '../components/sections/TopCourses'
import CoursesByCategory from '../components/sections/CoursesByCategory'
import LearningExperience from '../components/sections/LearningExperience'
import PracticalLabs from '../components/sections/PracticalLabs'
import IndustryEcosystem from '../components/sections/IndustryEcosystem'
import CertificationsShowcase from '../components/sections/CertificationsShowcase'
import TestimonialCarousel from '../components/sections/TestimonialCarousel'
import CareerPathwaysPreview from '../components/sections/CareerPathwaysPreview'
import LeadershipPreview from '../components/sections/LeadershipPreview'
import KnowledgeCenterPreview from '../components/sections/KnowledgeCenterPreview'
import EventsResourcesPreview from '../components/sections/EventsResourcesPreview'
import FaqSection from '../components/sections/FaqSection'
import FinalCta from '../components/sections/FinalCta'

// The 20-section order below matches docs/ARCHITECTURE.md §A / spec §8
// exactly. Each section is independently composed (not a single monolithic
// fetch), so a slow/missing section never blocks the rest of the page
// (docs/ARCHITECTURE.md §K). All content is placeholder-marked pending
// Phase 8's real API — every section already accepts the real data shape
// as a prop, so wiring the API in is additive, not a rewrite.
export default function Home() {
  useSeo({
    title: 'GIIS India | Cybersecurity Education & Professional Training',
    description:
      'GIIS is the educational wing of Threatsys, offering industry-aligned, certification-focused cybersecurity training — ethical hacking, SOC analysis, penetration testing, cloud security, GRC, and leadership programs.',
  })

  return (
    <div>
      <HeroSlider />
      <TrustStrip />
      <Introduction />
      <NumbersStats />
      <WhyGiisSection />
      <TopCourses />
      <CoursesByCategory />
      <LearningExperience />
      <PracticalLabs />
      <IndustryEcosystem />
      <CertificationsShowcase />
      <TestimonialCarousel />
      <CareerPathwaysPreview />
      <LeadershipPreview />
      <KnowledgeCenterPreview />
      <EventsResourcesPreview />
      <FaqSection />
      <FinalCta />
    </div>
  )
}
