import { useMemo } from 'react'

/**
 * Client-side pagination over an already-filtered array. Once Phase 8's
 * API lands, list endpoints will paginate server-side (meta.page/
 * per_page/total per docs/ARCHITECTURE.md §D) — this hook's shape
 * (page, totalPages, pageItems, setPage-friendly return) is designed to
 * carry over to that without a rewrite of the consuming component.
 */
export function usePagination(items, page, perPage = 9) {
  return useMemo(() => {
    const totalItems = items.length
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const start = (safePage - 1) * perPage
    const pageItems = items.slice(start, start + perPage)
    return { pageItems, totalItems, totalPages, page: safePage }
  }, [items, page, perPage])
}
