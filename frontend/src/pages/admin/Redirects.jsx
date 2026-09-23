import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import Notice from '../../admin/components/Notice'
import ConfirmDialog from '../../admin/components/ConfirmDialog'
import { redirectsAdminApi } from '../../api/admin'
import { ApiError } from '../../api/client'

function emptyRedirect() {
  return { from_path: '', to_path: '', status_code: 301, is_active: true }
}

/** URL redirect management (spec §37) — needed for migrating giisindia.in's existing URLs without breaking inbound links/SEO. */
export default function Redirects() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const load = () => {
    setLoading(true)
    redirectsAdminApi
      .list()
      .then(({ data }) => setRows(data))
      .catch((err) => setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Failed to load.' }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const onSave = async (event) => {
    event.preventDefault()
    setNotice(null)
    try {
      if (editing.id) {
        await redirectsAdminApi.update(editing.id, editing)
      } else {
        await redirectsAdminApi.create(editing)
      }
      setEditing(null)
      load()
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Save failed.' })
    }
  }

  const confirmDelete = async () => {
    try {
      await redirectsAdminApi.remove(pendingDelete.id)
      setRows((prev) => prev.filter((r) => r.id !== pendingDelete.id))
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Delete failed.' })
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl">Redirects</h1>
        <Button onClick={() => setEditing(emptyRedirect())}>+ New Redirect</Button>
      </div>

      <Notice type={notice?.type}>{notice?.message}</Notice>

      {loading ? (
        <p className="text-text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono text-xs">{r.from_path}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.to_path}</td>
                  <td className="px-4 py-3">{r.status_code}</td>
                  <td className="px-4 py-3">{r.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setEditing(r)} className="text-sm font-medium text-accent hover:underline">
                        Edit
                      </button>
                      <button type="button" onClick={() => setPendingDelete(r)} className="text-sm font-medium text-danger hover:underline">
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
            <h2 className="text-base font-semibold">{editing.id ? 'Edit redirect' : 'New redirect'}</h2>

            <label className="mt-4 block text-sm font-medium">From path</label>
            <input required placeholder="/old-page" value={editing.from_path} onChange={(e) => setEditing({ ...editing, from_path: e.target.value })} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />

            <label className="mt-3 block text-sm font-medium">To path</label>
            <input required placeholder="/new-page" value={editing.to_path} onChange={(e) => setEditing({ ...editing, to_path: e.target.value })} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />

            <label className="mt-3 block text-sm font-medium">Status code</label>
            <select value={editing.status_code} onChange={(e) => setEditing({ ...editing, status_code: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm">
              <option value={301}>301 — Permanent</option>
              <option value={302}>302 — Temporary</option>
            </select>

            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="h-4 w-4 rounded border-border" />
              Active
            </label>

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
        title="Delete this redirect?"
        description={pendingDelete ? `${pendingDelete.from_path} → ${pendingDelete.to_path} will stop working.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
