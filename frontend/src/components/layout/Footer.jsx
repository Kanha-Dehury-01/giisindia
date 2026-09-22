import { Link } from 'react-router-dom'
import { FOOTER_COLUMNS } from '../../utils/navigation'

// Contact details / social links come from `site_settings` via the API
// once Phase 8 lands — placeholders here are clearly marked, not fabricated
// (docs/ARCHITECTURE.md §O).
export default function Footer() {
  return (
    <footer className="bg-bg-inverse text-text-inverse-muted">
      <div className="container grid grid-cols-2 gap-8 py-12 md:grid-cols-3 lg:grid-cols-6 lg:py-16">
        <div className="col-span-2 lg:col-span-1">
          <p className="font-display text-lg font-bold text-text-inverse">
            GIIS<span className="text-accent-on-dark">.</span>
          </p>
          <p className="mt-3 text-sm">Educational wing of Threatsys.</p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.heading}>
            <h3 className="font-display text-sm font-semibold text-text-inverse">{column.heading}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-text-inverse hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="font-display text-sm font-semibold text-text-inverse">Contact</h3>
          <address className="mt-3 flex flex-col gap-2 text-sm not-italic">
            <span>[UPDATE BEFORE LAUNCH — phone]</span>
            <span>[UPDATE BEFORE LAUNCH — email]</span>
            <span>[UPDATE BEFORE LAUNCH — address]</span>
          </address>
        </div>
      </div>

      <div className="border-t border-border-inverse">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
          <p>&copy; {new Date().getFullYear()} GIIS. All rights reserved.</p>
          <p>A Threatsys initiative.</p>
        </div>
      </div>
    </footer>
  )
}
