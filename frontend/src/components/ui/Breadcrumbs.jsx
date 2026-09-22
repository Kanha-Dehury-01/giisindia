import { Link } from 'react-router-dom'

/**
 * items: [{ label, to }] — last item is rendered as the current page
 * (no link, aria-current="page"). Emits visible breadcrumbs only; the
 * matching BreadcrumbList JSON-LD is built by utils/structuredData.js
 * once real page data is wired in (Phase 4+).
 */
export default function Breadcrumbs({ items }) {
  if (!items?.length) return null
  return (
    <nav aria-label="Breadcrumb" className="container py-4 text-sm text-text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.label} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {isLast || !item.to ? (
                <span aria-current={isLast ? 'page' : undefined} className="text-text">
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="hover:text-accent hover:underline">
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
