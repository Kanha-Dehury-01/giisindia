import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Minimal shell for Phase 2 — just enough to route to /admin/login and
 * gate everything else behind a session check. The full sidebar (filtered
 * by the logged-in user's permissions, per docs/ARCHITECTURE.md §F) and
 * the CRUD screens themselves are Phase 7.
 *
 * Security note: this redirect is a UX convenience only. Every admin API
 * endpoint independently checks the session + permission server-side —
 * this guard never substitutes for that.
 */
export default function AdminLayout() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface p-4 md:block">
        <p className="font-display text-sm font-semibold text-primary">GIIS Admin</p>
        <p className="mt-1 text-xs text-text-muted">{user?.role_name ?? ''}</p>
        {/* Full permission-filtered nav lands in Phase 7 */}
      </aside>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
