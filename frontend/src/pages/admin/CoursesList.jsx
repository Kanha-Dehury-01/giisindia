import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import DataTable from '../../admin/components/DataTable'
import Notice from '../../admin/components/Notice'
import ConfirmDialog from '../../admin/components/ConfirmDialog'
import { coursesAdminApi } from '../../api/admin'
import { ApiError } from '../../api/client'

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'level', label: 'Level' },
  { key: 'is_best_seller', label: 'Best Seller' },
  { key: 'is_featured', label: 'Featured' },
  { key: 'publish_status', label: 'Status', badge: true },
]

export default function CoursesList() {
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
    coursesAdminApi
      .list({ page })
      .then(({ data, meta }) => {
        setRows(data.map((r) => ({ ...r, is_best_seller: r.is_best_seller ? 'Yes' : '—', is_featured: r.is_featured ? 'Yes' : '—' })))
        setTotalPages(meta?.total_pages ?? 1)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false))
  }, [page])

  const confirmDelete = async () => {
    try {
      await coursesAdminApi.remove(pendingDelete.id)
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
        <h1 className="text-xl">Courses</h1>
        <Button onClick={() => navigate('/admin/courses/new')}>+ New Course</Button>
      </div>

      <Notice type="error">{error}</Notice>

      <DataTable
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setSearchParams({ page: String(p) })}
        onEdit={(row) => navigate(`/admin/courses/${row.id}`)}
        onDelete={(row) => setPendingDelete(row)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this course?"
        description={pendingDelete ? `"${pendingDelete.title}" and its curriculum/skills/tools/FAQs will be permanently removed.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
