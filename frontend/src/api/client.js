// Single fetch wrapper every api/*.js resource file goes through.
// Handles: base URL, credentials (session cookie), CSRF header injection,
// and normalizing the backend's { success, data, error, meta } envelope
// (see docs/ARCHITECTURE.md §D) into either a resolved value or a thrown
// ApiError the caller can catch.

const BASE_URL = '/api'

export class ApiError extends Error {
  constructor(message, code, status, fields) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.fields = fields ?? null
  }
}

function getCsrfToken() {
  return document.cookie.match(/(?:^|; )csrf_token=([^;]*)/)?.[1] ?? null
}

async function performRequest(path, { method = 'GET', body, params } = {}) {
  const url = new URL(BASE_URL + path, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
    })
  }

  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'
  if (method !== 'GET') {
    const csrf = getCsrfToken()
    if (csrf) headers['X-CSRF-Token'] = csrf
  }

  const response = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ApiError('Invalid server response', 'invalid_response', response.status)
  }

  if (!response.ok || payload.success === false) {
    throw new ApiError(
      payload?.error?.message ?? 'Request failed',
      payload?.error?.code ?? 'unknown_error',
      response.status,
      payload?.error?.fields,
    )
  }

  return payload
}

export async function apiRequest(path, options) {
  const payload = await performRequest(path, options)
  return payload.data
}

/** Same as apiRequest, but resolves { data, meta } — for paginated admin list endpoints that need meta.total_pages. */
export async function apiRequestWithMeta(path, options) {
  const payload = await performRequest(path, options)
  return { data: payload.data, meta: payload.meta }
}

export const apiClient = {
  get: (path, params) => apiRequest(path, { method: 'GET', params }),
  getPaginated: (path, params) => apiRequestWithMeta(path, { method: 'GET', params }),
  post: (path, body) => apiRequest(path, { method: 'POST', body }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
}
