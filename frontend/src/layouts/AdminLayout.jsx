import { useState } from 'react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout as logoutRequest } from '../api/auth'
import { NAV_SECTIONS } from '../admin/nav.config'

/**
 * Real admin shell (Phase 7): a permission-filtered sidebar, a topbar with
 * the signed-in user and sign-out, and the mobile drawer every other
 * layout in this app already has (spec §45 requires touch-friendly nav
 * everywhere, not just the public site).
 *
 * Security note: hiding a sidebar link the user lacks a permission for is
 * a UX convenience only. Every admin API endpoint independently checks
 * the session + permission server-side — this guard never substitutes
 * for that (docs/ARCHITECTURE.md §F/§M).
 */
export default function AdminLayout() {
  const { isAuthenticated, loading, user, hasPermission, setUser } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />

  const onLogout = async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
      navigate('/admin/login', { replace: true })
    }
  }

  const sidebar = (
    <nav aria-label="Admin navigation" className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <div>
        <p className="font-display text-sm font-semibold text-primary">GIIS Admin</p>
        <p className="mt-1 text-xs text-text-muted">{user?.role_name ?? ''}</p>
      </div>

      {NAV_SECTIONS.map((section) => {
        const links = section.links.filter((link) => !link.permission || hasPermission(link.permission))
        if (links.length === 0) return null
        return (
          <div key={section.label}>
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{section.label}</p>
            <ul className="mt-2 space-y-1">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/admin'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-md px-2 py-2 text-sm font-medium ${
                        isActive ? 'bg-accent/10 text-accent' : 'text-text hover:bg-surface-muted'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:block">{sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative h-full w-72 bg-surface shadow-xl">{sidebar}</div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>
          <p className="hidden text-sm text-text-muted md:block">Signed in as {user?.name}</p>
          <button
            type="button"
            onClick={onLogout}
            className="ml-auto inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-medium text-text hover:bg-surface-muted"
          >
            Sign out
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
