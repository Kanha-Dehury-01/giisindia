import { apiClient, ApiError, apiRequest } from './client'

/**
 * One generic REST client shared by every admin CRUD screen — mirrors the
 * backend's CrudResource engine (backend/includes/crud.php) on the other
 * side of the wire, so a new resource only needs a config entry
 * (see admin/resources.config.js), never a new API module.
 */
export function createResourceApi(basePath) {
  return {
    list: (params) => apiClient.getPaginated(basePath, params),
    get: (id) => apiClient.get(`${basePath}/${id}`),
    create: (data) => apiClient.post(basePath, data),
    update: (id, data) => apiClient.put(`${basePath}/${id}`, data),
    remove: (id) => apiClient.delete(`${basePath}/${id}`),
  }
}

export const coursesAdminApi = {
  ...createResourceApi('/admin/courses'),
  updateChildren: (id, children) => apiClient.put(`/admin/courses/${id}/children`, children),
  categories: {
    ...createResourceApi('/admin/course-categories'),
  },
}

export const learningPathsAdminApi = {
  ...createResourceApi('/admin/learning-paths'),
  updateSteps: (id, steps) => apiClient.put(`/admin/learning-paths/${id}/steps`, { steps }),
}

export const mediaAdminApi = {
  list: (params) => apiClient.getPaginated('/admin/media', params),
  update: (id, data) => apiClient.put(`/admin/media/${id}`, data),
  remove: (id) => apiClient.delete(`/admin/media/${id}`),
  async upload(file, { altText, caption, category } = {}) {
    const form = new FormData()
    form.append('file', file)
    if (altText) form.append('alt_text', altText)
    if (caption) form.append('caption', caption)
    if (category) form.append('category', category)

    const csrf = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/)?.[1] ?? null
    const response = await fetch('/api/admin/media', {
      method: 'POST',
      credentials: 'include',
      headers: csrf ? { 'X-CSRF-Token': csrf } : {},
      body: form,
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok || !payload?.success) {
      throw new ApiError(payload?.error?.message ?? 'Upload failed', payload?.error?.code ?? 'upload_failed', response.status)
    }
    return payload.data
  },
}

export const knowledgeAdminApi = {
  ...createResourceApi('/admin/knowledge'),
  tags: () => apiClient.get('/admin/knowledge-tags'),
}

export const usersAdminApi = createResourceApi('/admin/users')

export const enquiriesAdminApi = {
  list: (params) => apiClient.getPaginated('/admin/enquiries', params),
  updateStatus: (id, status) => apiClient.put(`/admin/enquiries/${id}`, { status }),
}

export const siteSettingsAdminApi = {
  list: () => apiClient.get('/admin/site-settings'),
  update: (settings) => apiClient.put('/admin/site-settings', { settings }),
}

export const redirectsAdminApi = createResourceApi('/admin/redirects')

export const auditLogAdminApi = {
  list: (params) => apiClient.getPaginated('/admin/audit-log', params),
}

export const seoAdminApi = {
  get: (type, id) => apiClient.get(`/admin/seo/${type}/${id}`),
  update: (type, id, data) => apiClient.put(`/admin/seo/${type}/${id}`, data),
}

export const knowledgeCategoriesApi = {
  list: () => apiClient.get('/knowledge-categories'),
}

export const courseCategoriesApi = {
  list: () => apiClient.get('/course-categories'),
}

export { apiRequest }
