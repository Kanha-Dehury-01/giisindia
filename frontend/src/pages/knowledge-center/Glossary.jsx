import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import { PLACEHOLDER_GLOSSARY } from '../../data/glossaryPlaceholder'

export default function Glossary() {
  const [query, setQuery] = useState('')
  const [activeLetter, setActiveLetter] = useState(null)

  useSeo({
    title: 'Cybersecurity Glossary | GIIS India',
    description: 'A-Z index of cybersecurity terms, explained clearly.',
  })

  const letters = useMemo(() => Array.from(new Set(PLACEHOLDER_GLOSSARY.map((t) => t.display_letter))).sort(), [])

  const filtered = PLACEHOLDER_GLOSSARY.filter((t) => {
    if (activeLetter && t.display_letter !== activeLetter) return false
    if (query && !t.term.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const grouped = filtered.reduce((acc, term) => {
    ;(acc[term.display_letter] ??= []).push(term)
    return acc
  }, {})

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Knowledge Center', to: '/knowledge-center' }, { label: 'Glossary' }]} />
      <PageHeader eyebrow="Glossary" title="Cybersecurity Glossary" description="A-Z index of cybersecurity terms." />

      <div className="container py-10 md:py-14">
        <label htmlFor="glossary-search" className="sr-only">
          Search glossary
        </label>
        <input
          id="glossary-search"
          type="search"
          placeholder="Search terms…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 w-full max-w-sm rounded-md border border-border bg-surface px-4 text-sm text-text placeholder:text-text-muted focus-visible:outline-none"
        />

        <nav aria-label="Jump to letter" className="mt-6 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveLetter(null)}
            className={`h-9 min-w-9 rounded-md px-2 text-sm font-semibold ${!activeLetter ? 'bg-primary text-text-inverse' : 'bg-surface-muted text-text-muted hover:text-text'}`}
          >
            All
          </button>
          {letters.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => setActiveLetter(letter)}
              className={`h-9 min-w-9 rounded-md px-2 text-sm font-semibold ${activeLetter === letter ? 'bg-primary text-text-inverse' : 'bg-surface-muted text-text-muted hover:text-text'}`}
            >
              {letter}
            </button>
          ))}
        </nav>

        <div className="mt-8">
          {filtered.length === 0 ? (
            <EmptyState title="No terms match your search" description="Try a different term or clear the filter." />
          ) : (
            Object.keys(grouped)
              .sort()
              .map((letter) => (
                <div key={letter} className="mb-8">
                  <h2 className="border-b border-border pb-2 text-xl">{letter}</h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {grouped[letter].map((term) => (
                      <li key={term.id}>
                        <Link to={`/knowledge-center/glossary/${term.slug}`} className="text-text hover:text-accent hover:underline">
                          {term.term}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  )
}
