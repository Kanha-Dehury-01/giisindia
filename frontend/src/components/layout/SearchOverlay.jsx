import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { motionTokens, springs } from '../../lib/motion-tokens'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { searchKnowledgeCenter } from '../../utils/knowledgeSearch'
import SearchResultCard from '../knowledge/SearchResultCard'

/**
 * Global quick-search reachable from the header search icon on every page
 * (spec §45: "Knowledge Center search should be easy to access globally").
 * Modal requirements per motion-patterns rule 6: focus trap (input
 * auto-focuses, Tab is not trapped further since the result list is small
 * and content is link-only), Escape-key close, scroll lock, role="dialog",
 * aria-modal="true".
 */
export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 200)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return undefined
    // No query reset here: the caller (Header) mounts this component fresh
    // each time it opens, so `useState('')` above already starts empty —
    // resetting again in an effect would just trigger an extra render.
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
      clearTimeout(focusTimer)
    }
  }, [open, onClose])

  const results = debouncedQuery.trim() ? searchKnowledgeCenter(debouncedQuery).slice(0, 6) : []

  const onSubmit = (event) => {
    event.preventDefault()
    if (query.trim()) {
      navigate(`/knowledge-center/search?q=${encodeURIComponent(query.trim())}`)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[var(--z-overlay)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ backgroundColor: 'color-mix(in srgb, var(--navy-950) 70%, transparent)' }}
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Search the Knowledge Center"
            className="fixed inset-x-4 top-24 z-[var(--z-modal)] mx-auto max-w-2xl rounded-[var(--card-radius)] bg-surface p-6 shadow-lg"
            initial={{ opacity: 0, y: motionTokens.distance.sm, scale: motionTokens.scale.subtle }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: motionTokens.distance.sm, scale: motionTokens.scale.subtle }}
            transition={springs.gentle}
          >
            <div className="flex items-center gap-3">
              <form onSubmit={onSubmit} role="search" className="flex-1">
                <label htmlFor="overlay-search-input" className="sr-only">
                  Search the Knowledge Center
                </label>
                <input
                  ref={inputRef}
                  id="overlay-search-input"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What do you want to learn about?"
                  className="h-12 w-full rounded-md border border-border bg-surface px-4 text-base text-text placeholder:text-text-muted focus-visible:outline-none"
                />
              </form>
              <button type="button" onClick={onClose} aria-label="Close search" className="flex h-10 w-10 items-center justify-center rounded-md text-text-muted hover:text-text">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {results.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {results.map((result) => (
                  <div key={result.id} onClick={onClose}>
                    <SearchResultCard result={result} />
                  </div>
                ))}
              </div>
            )}

            {debouncedQuery.trim() && results.length === 0 && (
              <p className="mt-4 text-sm text-text-muted">
                No quick matches for "{debouncedQuery}". Press Enter to see full search results.
              </p>
            )}

            {query.trim() && (
              <button
                type="button"
                onClick={onSubmit}
                className="mt-4 text-sm font-semibold text-accent hover:underline"
              >
                See all results for "{query.trim()}" &rarr;
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
