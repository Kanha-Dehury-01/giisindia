import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Route-level permission gate — a UX convenience that keeps a user from
 * clicking into a screen every action on which the server will 403 anyway.
 * Never the security boundary: every admin API call re-checks the
 * permission server-side regardless (docs/ARCHITECTURE.md §F/§M).
 */
export default function RequirePermission({ permission, children }) {
  const { hasPermission } = useAuth()
  if (!hasPermission(permission)) return <Navigate to="/admin" replace />
  return children
}
