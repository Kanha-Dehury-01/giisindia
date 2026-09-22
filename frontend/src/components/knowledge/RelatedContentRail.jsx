import { Link } from 'react-router-dom'

/**
 * Renders one labeled group of related links (e.g. "Related Careers",
 * "Related Courses") — this is the internal-linking mechanism spec §17
 * describes for "Penetration Testing" connecting to its career path,
 * courses, glossary terms, etc. Each group is a separate polymorphic
 * relationship type in `knowledge_relationships` (docs/ARCHITECTURE.md §E).
 */
export default function RelatedContentRail({ heading, items }) {
  if (!items?.length) return null

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-text-muted uppercase">{heading}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.url}>
            <Link
              to={item.url}
              className="inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-text hover:border-accent hover:text-accent"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
