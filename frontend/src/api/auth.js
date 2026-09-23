import { apiClient, ApiError } from './client'

// Resolves to the current user object, or null when signed out — /auth/me
// always responds 200 with { user: null } when there's no session (see
// backend/api/handlers/auth.php), so this only returns null itself on a
// genuine network/API failure (e.g. the backend isn't running).
export async function fetchCurrentUser() {
  try {
    const { user } = await apiClient.get('/auth/me')
    return user
  } catch (error) {
    if (error instanceof ApiError) return null
    return null
  }
}

export function login(username, password) {
  return apiClient.post('/auth/login', { username, password })
}

export function logout() {
  return apiClient.post('/auth/logout')
}
