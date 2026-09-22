/**
 * Shared header for content pages built before their full section design
 * lands (Phases 3-6 flesh these out). Keeps every stub page's file thin
 * and gives non-technical reviewers a consistent "this page exists and
 * routes correctly" signal during Phase 2.
 */
export default function PageHeader({ eyebrow, title, description }) {
  return (
    <header className="border-b border-border bg-surface-muted py-12 md:py-16">
      <div className="container">
        {eyebrow && (
          <p className="mb-2 font-display text-sm font-semibold tracking-wide text-accent uppercase">{eyebrow}</p>
        )}
        <h1 className="max-w-3xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-text-muted">{description}</p>}
      </div>
    </header>
  )
}
