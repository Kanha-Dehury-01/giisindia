import { useSeo } from '../hooks/useSeo'

// Full 20-section homepage (docs/ARCHITECTURE.md §A, spec §8) is Phase 3.
// This stub exists so routing/layout/navigation can be verified end-to-end
// in Phase 2 before any section design lands.
export default function Home() {
  useSeo({
    title: 'GIIS India | Cybersecurity Education & Professional Training',
    description:
      'GIIS is the educational wing of Threatsys, offering industry-aligned, certification-focused cybersecurity training.',
  })

  return (
    <div className="bg-bg-inverse py-24 text-center text-text-inverse md:py-40">
      <div className="container">
        <p className="font-display text-sm font-semibold tracking-wide text-accent-on-dark uppercase">
          Cybersecurity Education
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-text-inverse">Build the skills to defend the digital world.</h1>
        <p className="mx-auto mt-4 max-w-xl text-text-inverse-muted">
          Homepage hero, statistics, course discovery, Knowledge Center, and career pathways land in Phase 3.
        </p>
      </div>
    </div>
  )
}
