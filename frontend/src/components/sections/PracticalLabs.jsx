import RevealOnScroll from '../motion/RevealOnScroll'

export default function PracticalLabs() {
  return (
    <section className="bg-bg-inverse py-16 text-text-inverse md:py-24">
      <div className="container grid gap-10 md:grid-cols-2 md:items-center">
        <RevealOnScroll>
          <p className="font-display text-sm font-semibold text-accent-on-dark uppercase">Practical Cybersecurity Labs</p>
          <h2 className="mt-3 max-w-lg text-text-inverse">Learn by doing, not just watching</h2>
          <p className="mt-4 max-w-md text-text-inverse-muted">
            [ADD DESCRIPTION of GIIS's lab environments, tools, and hands-on exercises.]
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <div className="rounded-[var(--card-radius)] border border-border-inverse bg-[var(--nav-bg-scrolled)] p-8">
            <p className="font-display text-sm font-semibold text-text-inverse">[LAB ENVIRONMENT PREVIEW]</p>
            <p className="mt-2 text-sm text-text-inverse-muted">Screenshot or interactive preview lands with real content in Phase 8.</p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
