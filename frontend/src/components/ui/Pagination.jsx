/**
 * SEO-friendly pagination (spec §32): real page numbers as buttons with
 * accessible labeling, not an infinite-scroll trap that hides content
 * from crawlers and keyboard users. Phase 9 adds rel=prev/next link tags
 * per page once routes carry a page query param.
 */
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="inline-flex h-11 items-center rounded-full border border-border px-4 text-sm font-medium text-text disabled:opacity-40 hover:enabled:border-accent hover:enabled:text-accent"
      >
        Previous
      </button>

      <ul className="flex gap-1">
        {pages.map((p) => (
          <li key={p}>
            <button
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p}`}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-medium ${
                p === page ? 'bg-primary text-text-inverse' : 'text-text hover:bg-surface-muted'
              }`}
            >
              {p}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="inline-flex h-11 items-center rounded-full border border-border px-4 text-sm font-medium text-text disabled:opacity-40 hover:enabled:border-accent hover:enabled:text-accent"
      >
        Next
      </button>
    </nav>
  )
}
