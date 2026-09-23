import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import DataTable from '../../admin/components/DataTable'
import Notice from '../../admin/components/Notice'
import ConfirmDialog from '../../admin/components/ConfirmDialog'
import { knowledgeAdminApi } from '../../api/admin'
import { ApiError } from '../../api/client'

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'content_type', label: 'Type' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'publish_status', label: 'Status', badge: true },
]

export default function KnowledgeList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? 1)

  const [rows, setRows] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    setLoading(true)
    knowledgeAdminApi
      .list({ page })
      .then(({ data, meta }) => {
        setRows(data)
        setTotalPages(meta?.total_pages ?? 1)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false))
  }, [page])

  const confirmDelete = async () => {
    try {
      await knowledgeAdminApi.remove(pendingDelete.id)
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
        <h1 className="text-xl">Knowledge Center Articles</h1>
        <Button onClick={() => navigate('/admin/knowledge/new')}>+ New Article</Button>
      </div>

      <Notice type="error">{error}</Notice>

      <DataTable
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setSearchParams({ page: String(p) })}
        onEdit={(row) => navigate(`/admin/knowledge/${row.id}`)}
        onDelete={(row) => setPendingDelete(row)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this article?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
