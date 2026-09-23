import { useState } from 'react'
import Button from '../../components/ui/Button'
import Notice from '../../admin/components/Notice'
import { seoAdminApi } from '../../api/admin'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../api/client'

const ENTITY_TYPES = ['course', 'knowledge_content', 'career', 'learning_path', 'certification', 'glossary_term', 'event', 'page']

const empty = {
  seo_title: '',
  meta_description: '',
  canonical_url: '',
  robots_directive: 'index,follow',
  og_title: '',
  og_description: '',
  og_image_id: '',
}

/**
 * Per-entity SEO metadata (spec §36) — one lookup form rather than a tab
 * bolted onto every resource's edit page, since seo_metadata is keyed by
 * (entity_type, entity_id) polymorphically across 8 different tables.
 */
export default function SeoEditor() {
  const { hasPermission } = useAuth()
  const [entityType, setEntityType] = useState('course')
  const [entityId, setEntityId] = useState('')
  const [fields, setFields] = useState(empty)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  const canEditAdvanced = hasPermission('seo.edit_advanced')

  const onLoad = async () => {
    if (!entityId) return
    setLoading(true)
    setNotice(null)
    try {
      const row = await seoAdminApi.get(entityType, entityId)
      setFields({ ...empty, ...row })
      setLoaded(true)
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Failed to load.' })
    } finally {
      setLoading(false)
    }
  }

  const onSave = async () => {
    setSaving(true)
    setNotice(null)
    try {
      await seoAdminApi.update(entityType, entityId, fields)
      setNotice({ type: 'success', message: 'SEO metadata saved.' })
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Save failed.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl">SEO Metadata</h1>
      <Notice type={notice?.type}>{notice?.message}</Notice>

      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium">Entity type</label>
            <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="mt-1 rounded-md border border-border px-3 py-2 text-sm">
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Entity ID</label>
            <input
              type="number"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="e.g. 12"
              className="mt-1 w-32 rounded-md border border-border px-3 py-2 text-sm"
            />
          </div>
          <Button type="button" onClick={onLoad} disabled={!entityId || loading}>
            {loading ? 'Loading…' : 'Load'}
          </Button>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Find the numeric ID from that resource&rsquo;s list or edit page (e.g. a course&rsquo;s admin edit URL ends in its ID).
        </p>
      </div>

      {loaded && (
        <div className="mt-6 space-y-5 rounded-lg border border-border bg-surface p-6">
          <div>
            <label className="block text-sm font-medium">SEO title</label>
            <input value={fields.seo_title ?? ''} onChange={(e) => setFields({ ...fields, seo_title: e.target.value })} maxLength={200} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Meta description</label>
            <textarea rows={2} maxLength={300} value={fields.meta_description ?? ''} onChange={(e) => setFields({ ...fields, meta_description: e.target.value })} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Canonical URL</label>
            <input value={fields.canonical_url ?? ''} onChange={(e) => setFields({ ...fields, canonical_url: e.target.value })} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Open Graph title</label>
            <input value={fields.og_title ?? ''} onChange={(e) => setFields({ ...fields, og_title: e.target.value })} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Open Graph description</label>
            <textarea rows={2} value={fields.og_description ?? ''} onChange={(e) => setFields({ ...fields, og_description: e.target.value })} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Open Graph image (media ID)</label>
            <input type="number" value={fields.og_image_id ?? ''} onChange={(e) => setFields({ ...fields, og_image_id: e.target.value })} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Robots directive {!canEditAdvanced && <span className="text-xs font-normal text-text-muted">(advanced SEO permission required to change)</span>}
            </label>
            <select
              value={fields.robots_directive ?? 'index,follow'}
              onChange={(e) => setFields({ ...fields, robots_directive: e.target.value })}
              disabled={!canEditAdvanced}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="index,follow">index, follow (default)</option>
              <option value="noindex,follow">noindex, follow</option>
              <option value="index,nofollow">index, nofollow</option>
              <option value="noindex,nofollow">noindex, nofollow</option>
            </select>
          </div>

          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save SEO Metadata'}
          </Button>
        </div>
      )}
    </div>
  )
}
