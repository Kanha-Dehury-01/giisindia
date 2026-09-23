import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import Notice from '../../admin/components/Notice'
import ConfirmDialog from '../../admin/components/ConfirmDialog'
import { coursesAdminApi } from '../../api/admin'
import { ApiError } from '../../api/client'

function emptyCategory() {
  return { name: '', slug: '', description: '', display_order: 0 }
}

/** Flat list — categories have no publish workflow or pagination, so a dedicated small page beats forcing them through the generic table. */
export default function CourseCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const load = () => {
    setLoading(true)
    coursesAdminApi.categories
      .list()
      .then(({ data }) => setCategories(data))
      .catch((err) => setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Failed to load.' }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const onSave = async (event) => {
    event.preventDefault()
    setNotice(null)
    try {
      if (editing.id) {
        await coursesAdminApi.categories.update(editing.id, editing)
      } else {
        await coursesAdminApi.categories.create(editing)
      }
      setEditing(null)
      load()
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Save failed.' })
    }
  }

  const confirmDelete = async () => {
    try {
      await coursesAdminApi.categories.remove(pendingDelete.id)
      setCategories((prev) => prev.filter((c) => c.id !== pendingDelete.id))
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Delete failed — it may still be in use by a course.' })
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl">Course Categories</h1>
        <Button onClick={() => setEditing(emptyCategory())}>+ New Category</Button>
      </div>

      <Notice type={notice?.type}>{notice?.message}</Notice>

      {loading ? (
        <p className="text-text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-4 py-3">{cat.name}</td>
                  <td className="px-4 py-3 text-text-muted">{cat.slug}</td>
                  <td className="px-4 py-3">{cat.display_order}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setEditing(cat)} className="text-sm font-medium text-accent hover:underline">
                        Edit
                      </button>
                      <button type="button" onClick={() => setPendingDelete(cat)} className="text-sm font-medium text-danger hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <form onSubmit={onSave} className="w-full max-w-md rounded-lg bg-surface p-6 shadow-xl">
            <h2 className="text-base font-semibold">{editing.id ? 'Edit category' : 'New category'}</h2>

            <label className="mt-4 block text-sm font-medium">Name</label>
            <input
              required
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />

            <label className="mt-3 block text-sm font-medium">Slug (optional)</label>
            <input
              value={editing.slug ?? ''}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />

            <label className="mt-3 block text-sm font-medium">Description</label>
            <textarea
              rows={2}
              value={editing.description ?? ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />

            <label className="mt-3 block text-sm font-medium">Display order</label>
            <input
              type="number"
              value={editing.display_order ?? 0}
              onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm">
                Cancel
              </button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this category?"
        description={pendingDelete ? `"${pendingDelete.name}" will be permanently removed.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
