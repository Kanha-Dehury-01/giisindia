import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchCurrentUser } from '../api/auth'

// RBAC note (docs/ARCHITECTURE.md §F): this context is a UX convenience for
// hiding controls the current user can't use. It is NEVER the security
// boundary — every admin API call is independently permission-checked
// server-side, so a hidden button here is not a substitute for that check.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(() => {
    const hasPermission = (slug) => Boolean(user?.permissions?.includes(slug))
    return { user, setUser, loading, hasPermission, isAuthenticated: Boolean(user) }
  }, [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
