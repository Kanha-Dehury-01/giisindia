import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import Notice from '../../admin/components/Notice'
import { siteSettingsAdminApi } from '../../api/admin'
import { ApiError } from '../../api/client'

/** Key/value site settings (contact info, social links, general) — grouped exactly as stored so non-technical editors see them organized the same way the public site consumes them. */
export default function SiteSettings() {
  const [groups, setGroups] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    siteSettingsAdminApi
      .list()
      .then((rows) => {
        const byGroup = {}
        rows.forEach((row) => {
          const group = row.group ?? 'general'
          byGroup[group] = byGroup[group] ?? []
          byGroup[group].push({ ...row })
        })
        setGroups(byGroup)
      })
      .catch((err) => setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Failed to load.' }))
      .finally(() => setLoading(false))
  }, [])

  const onChange = (group, key, value) => {
    setGroups((prev) => ({
      ...prev,
      [group]: prev[group].map((row) => (row.key === key ? { ...row, value } : row)),
    }))
  }

  const onSave = async () => {
    setSaving(true)
    setNotice(null)
    try {
      const settings = Object.values(groups).flat()
      await siteSettingsAdminApi.update(settings)
      setNotice({ type: 'success', message: 'Settings saved.' })
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Save failed.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-text-muted">Loading…</p>

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl">Site Settings</h1>
      <Notice type={notice?.type}>{notice?.message}</Notice>

      {Object.entries(groups).map(([group, rows]) => (
        <div key={group} className="mb-6 rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">{group}</h2>
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.key}>
                <label className="block text-sm font-medium">{row.key.replace(/_/g, ' ')}</label>
                {row.type === 'textarea' ? (
                  <textarea rows={2} value={row.value ?? ''} onChange={(e) => onChange(group, row.key, e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
                ) : (
                  <input value={row.value ?? ''} onChange={(e) => onChange(group, row.key, e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save All Settings'}
      </Button>
    </div>
  )
}
