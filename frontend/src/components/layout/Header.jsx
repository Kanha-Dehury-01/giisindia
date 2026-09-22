import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Button from '../ui/Button'
import { PRIMARY_NAV, SECONDARY_NAV } from '../../utils/navigation'

// Lazy-loaded: SearchOverlay pulls in the full search index (every course/
// knowledge/career/certification/learning-path/glossary record). Header
// renders on every route via PublicLayout, so eagerly importing it here
// would put that entire index in the bundle every page pays for on first
// load — it should only load once someone actually opens search.
const SearchOverlay = lazy(() => import('./SearchOverlay'))

/**
 * Sticky header. Glass surface only applies once scrolled (spec §6: glass
 * is for secondary/floating surfaces, not the resting state) — solid navy
 * at the top of the page, GlassNavBar treatment on scroll.
 * Mobile: accessible drawer, not a hover menu (spec §40: no hover-only
 * interaction), closable via Escape and an explicit close button.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const firstMobileLinkRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    firstMobileLinkRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-accent-on-dark' : 'text-text-inverse-muted hover:text-text-inverse'}`

  return (
    <header
      className={`sticky top-0 z-[var(--z-nav)] transition-colors duration-[var(--motion-duration-base)] ${
        scrolled ? 'bg-[var(--nav-bg-scrolled)] backdrop-blur-md shadow-md' : 'bg-bg-inverse'
      }`}
    >
      <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
        <a href="/" className="font-display text-lg font-bold text-text-inverse">
          GIIS<span className="text-accent-on-dark">.</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {SECONDARY_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search Knowledge Center"
            className="text-text-inverse-muted hover:text-text-inverse"
          >
            <SearchIcon />
          </button>
          <Button to="/enquire" variant="primary">
            Enquire Now
          </Button>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-md text-text-inverse lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-border-inverse bg-bg-inverse px-4 pb-6 lg:hidden"
        >
          <ul className="flex flex-col gap-1 pt-4">
            {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item, index) => (
              <li key={item.to}>
                <NavLink
                  ref={index === 0 ? firstMobileLinkRef : undefined}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="block min-h-[44px] py-3 text-base font-medium text-text-inverse"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              setSearchOpen(true)
            }}
            className="flex min-h-[44px] w-full items-center gap-2 py-3 text-left text-base font-medium text-text-inverse"
          >
            <SearchIcon /> Search Knowledge Center
          </button>
          <Button to="/enquire" variant="primary" className="mt-2 w-full" onClick={() => setMenuOpen(false)}>
            Enquire Now
          </Button>
        </nav>
      )}

      {searchOpen && (
        <Suspense fallback={null}>
          <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </header>
  )
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}
