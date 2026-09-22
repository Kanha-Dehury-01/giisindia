import { apiClient, ApiError } from './client'

// Backend endpoints land in Phase 8. Until then this resolves to "logged
// out" for any environment without the PHP API running, rather than
// throwing and breaking the app shell.
export async function fetchCurrentUser() {
  try {
    return await apiClient.get('/auth/me')
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 0)) return null
    return null
  }
}

export function login(username, password) {
  return apiClient.post('/auth/login', { username, password })
}

export function logout() {
  return apiClient.post('/auth/logout')
}
