import { useNavigate } from 'react-router-dom'

/**
 * The "What do you want to learn about?" search entry point (spec §17).
 * Submits to /knowledge-center/search?q=... — a real navigable, bookmarkable
 * results page, not a client-only widget (spec §18: "a real search
 * experience, not a fake UI").
 */
export default function KnowledgeSearchBar({ defaultValue = '', autoFocus = false, size = 'lg' }) {
  const navigate = useNavigate()

  const onSubmit = (event) => {
    event.preventDefault()
    const query = new FormData(event.currentTarget).get('q')?.toString().trim()
    if (query) navigate(`/knowledge-center/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <form onSubmit={onSubmit} role="search" className="flex w-full max-w-xl gap-2">
      <label htmlFor="knowledge-search-input" className="sr-only">
        What do you want to learn about?
      </label>
      <input
        id="knowledge-search-input"
        name="q"
        type="search"
        autoFocus={autoFocus}
        defaultValue={defaultValue}
        placeholder="What do you want to learn about?"
        className={`w-full rounded-full border border-border bg-surface px-5 text-text placeholder:text-text-muted focus-visible:outline-none ${
          size === 'lg' ? 'h-14 text-base' : 'h-11 text-sm'
        }`}
      />
      <button
        type="submit"
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent px-6 font-display text-sm font-semibold text-[var(--button-primary-text)] hover:bg-[var(--button-primary-bg-hover)] ${
          size === 'lg' ? 'h-14' : 'h-11'
        }`}
      >
        Search
      </button>
    </form>
  )
}
