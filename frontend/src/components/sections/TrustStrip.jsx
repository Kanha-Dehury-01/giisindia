// Certification/partner logos are media-library assets (Phase 8); this
// placeholder list keeps the section's layout and motion real now.
const PLACEHOLDER_MARKS = [
  '[CERTIFICATION LOGO]',
  '[CERTIFICATION LOGO]',
  '[PARTNER LOGO]',
  '[CERTIFICATION LOGO]',
  '[PARTNER LOGO]',
]

export default function TrustStrip() {
  return (
    <section aria-label="Certifications and partners" className="border-b border-border bg-surface py-8">
      <div className="container flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {PLACEHOLDER_MARKS.map((mark, i) => (
          <span key={i} className="text-xs font-medium tracking-wide text-text-muted uppercase">
            {mark}
          </span>
        ))}
      </div>
    </section>
  )
}
