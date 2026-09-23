import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import Notice from '../../admin/components/Notice'
import ConfirmDialog from '../../admin/components/ConfirmDialog'
import { usersAdminApi } from '../../api/admin'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../api/client'

const ROLES = [
  { id: 1, name: 'Super Admin' },
  { id: 2, name: 'Editor' },
]

function emptyUser() {
  return { name: '', email: '', username: '', password: '', role_id: 2 }
}

/** Super-Admin-only screen — the route itself is also gated by the users.manage permission check in App.jsx, and every request is re-checked server-side regardless. */
export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const load = () => {
    setLoading(true)
    usersAdminApi
      .list()
      .then(({ data }) => setUsers(data))
      .catch((err) => setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Failed to load.' }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const onSave = async (event) => {
    event.preventDefault()
    setNotice(null)
    try {
      if (editing.id) {
        const { password, ...rest } = editing
        await usersAdminApi.update(editing.id, password ? editing : rest)
      } else {
        await usersAdminApi.create(editing)
      }
      setEditing(null)
      load()
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Save failed.' })
    }
  }

  const confirmDelete = async () => {
    try {
      await usersAdminApi.remove(pendingDelete.id)
      setUsers((prev) => prev.filter((u) => u.id !== pendingDelete.id))
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Delete failed.' })
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl">Users</h1>
        <Button onClick={() => setEditing(emptyUser())}>+ New User</Button>
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
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-text-muted">{u.username}</td>
                  <td className="px-4 py-3">{u.role_name}</td>
                  <td className="px-4 py-3">{u.active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setEditing({ ...u, password: '' })} className="text-sm font-medium text-accent hover:underline">
                        Edit
                      </button>
                      {u.id !== currentUser?.id && (
                        <button type="button" onClick={() => setPendingDelete(u)} className="text-sm font-medium text-danger hover:underline">
                          Delete
                        </button>
                      )}
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
            <h2 className="text-base font-semibold">{editing.id ? 'Edit user' : 'New user'}</h2>

            <label className="mt-4 block text-sm font-medium">Name</label>
            <input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />

            <label className="mt-3 block text-sm font-medium">Email</label>
            <input required type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />

            <label className="mt-3 block text-sm font-medium">Username</label>
            <input required value={editing.username} onChange={(e) => setEditing({ ...editing, username: e.target.value })} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />

            <label className="mt-3 block text-sm font-medium">{editing.id ? 'New password (leave blank to keep current)' : 'Password'}</label>
            <input
              type="password"
              required={!editing.id}
              minLength={10}
              value={editing.password ?? ''}
              onChange={(e) => setEditing({ ...editing, password: e.target.value })}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />

            <label className="mt-3 block text-sm font-medium">Role</label>
            <select value={editing.role_id} onChange={(e) => setEditing({ ...editing, role_id: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm">
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {editing.id && (
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.active ?? true} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="h-4 w-4 rounded border-border" />
                Active
              </label>
            )}

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
        title="Delete this user?"
        description={pendingDelete ? `"${pendingDelete.name}" will lose admin access immediately.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
