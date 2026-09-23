import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import DataTable from '../../../admin/components/DataTable'
import Notice from '../../../admin/components/Notice'
import ConfirmDialog from '../../../admin/components/ConfirmDialog'
import { getResourceConfig } from '../../../admin/resources.config'
import { ApiError } from '../../../api/client'

/** Generic admin list page — one component serves every "plain" resource in resources.config.js. */
export default function ResourceList({ resourceKey }) {
  const config = getResourceConfig(resourceKey)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? 1)

  const [rows, setRows] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    config.api
      .list({ page })
      .then(({ data, meta }) => {
        if (cancelled) return
        setRows(data)
        setTotalPages(meta?.total_pages ?? 1)
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : 'Failed to load.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceKey, page])

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await config.api.remove(pendingDelete.id)
      setRows((prev) => prev.filter((r) => r.id !== pendingDelete.id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed.')
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl">{config.label}</h1>
        <Button onClick={() => navigate(`/admin/${resourceKey}/new`)}>+ New {config.singular}</Button>
      </div>

      <Notice type="error">{error}</Notice>

      <DataTable
        columns={config.columns}
        rows={rows}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setSearchParams({ page: String(p) })}
        onEdit={(row) => navigate(`/admin/${resourceKey}/${row.id}`)}
        onDelete={(row) => setPendingDelete(row)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete this ${config.singular.toLowerCase()}?`}
        description={pendingDelete ? `"${pendingDelete[config.titleField]}" will be permanently removed.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
