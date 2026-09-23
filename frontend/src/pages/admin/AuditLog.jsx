import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Pagination from '../../components/ui/Pagination'
import Notice from '../../admin/components/Notice'
import { auditLogAdminApi } from '../../api/admin'
import { ApiError } from '../../api/client'

/** Read-only audit trail (spec §42/§46) — every admin write action is logged server-side in backend/includes/security.php's write_audit_log(). */
export default function AuditLog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? 1)
  const [rows, setRows] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    auditLogAdminApi
      .list({ page })
      .then(({ data, meta }) => {
        setRows(data)
        setTotalPages(meta?.total_pages ?? 1)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div>
      <h1 className="mb-6 text-xl">Audit Log</h1>
      <Notice type="error">{error}</Notice>

      {loading ? (
        <p className="text-text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                let meta = null
                try {
                  meta = row.meta_json ? JSON.parse(row.meta_json) : null
                } catch {
                  meta = null
                }
                const isAnonymousAction = !row.user_name && row.action.startsWith('auth.')
                return (
                  <tr key={row.id}>
                    <td className="px-4 py-3 text-text-muted">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">{row.user_name ?? (isAnonymousAction ? 'Unrecognized' : 'System')}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.action}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {row.entity_type ? `${row.entity_type} #${row.entity_id}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{row.ip_address}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-xs text-text-muted" title={meta ? JSON.stringify(meta) : ''}>
                      {meta ? Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join(', ') : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={(p) => setSearchParams({ page: String(p) })} />
    </div>
  )
}
