import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Pagination from '../../components/ui/Pagination'
import Notice from '../../admin/components/Notice'
import { enquiriesAdminApi } from '../../api/admin'
import { ApiError } from '../../api/client'

const STATUSES = ['new', 'contacted', 'follow_up', 'converted', 'closed']

/** The site's core conversion funnel (spec §7: Explore Course → Enquire → GIIS team) lands here for follow-up. */
export default function Enquiries() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? 1)
  const statusFilter = searchParams.get('status') ?? ''

  const [rows, setRows] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    setLoading(true)
    enquiriesAdminApi
      .list({ page, status: statusFilter || undefined })
      .then(({ data, meta }) => {
        setRows(data)
        setTotalPages(meta?.total_pages ?? 1)
      })
      .catch((err) => setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Failed to load.' }))
      .finally(() => setLoading(false))
  }, [page, statusFilter])

  const onStatusChange = async (id, status) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    try {
      await enquiriesAdminApi.updateStatus(id, status)
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Update failed.' })
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl">Enquiries</h1>
        <select
          value={statusFilter}
          onChange={(e) => setSearchParams({ page: '1', ...(e.target.value ? { status: e.target.value } : {}) })}
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <Notice type={notice?.type}>{notice?.message}</Notice>

      {loading ? (
        <p className="text-text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-text-muted">No enquiries yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-text">{row.name}</p>
                    <p className="text-xs text-text-muted">{row.city}</p>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    <p>{row.phone}</p>
                    <p>{row.email}</p>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{row.course_id ?? '—'}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-text-muted" title={row.message}>
                    {row.message ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{new Date(row.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select value={row.status} onChange={(e) => onStatusChange(row.id, e.target.value)} className="rounded-md border border-border px-2 py-1 text-xs">
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={(p) => setSearchParams({ page: String(p), ...(statusFilter ? { status: statusFilter } : {}) })} />
    </div>
  )
}
