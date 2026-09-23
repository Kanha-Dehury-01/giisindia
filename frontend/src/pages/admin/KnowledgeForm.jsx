import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Notice from '../../admin/components/Notice'
import { knowledgeAdminApi, knowledgeCategoriesApi } from '../../api/admin'
import { ApiError } from '../../api/client'

const CONTENT_TYPES = ['fundamental', 'domain', 'technology', 'guide', 'resource']
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

const emptyEntry = {
  title: '',
  slug: '',
  content_type: 'guide',
  category_id: '',
  short_description: '',
  body: '',
  difficulty: 'beginner',
  publish_date: '',
  last_updated: '',
  publish_status: 'draft',
}

export default function KnowledgeForm() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [allTags, setAllTags] = useState([])
  const [entry, setEntry] = useState(emptyEntry)
  const [tagsText, setTagsText] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    knowledgeCategoriesApi.list().then(setCategories).catch(() => setCategories([]))
    knowledgeAdminApi.tags().then(setAllTags).catch(() => setAllTags([]))
  }, [])

  useEffect(() => {
    if (isNew) return
    setLoading(true)
    knowledgeAdminApi
      .get(id)
      .then((row) => {
        setEntry({ ...emptyEntry, ...row, category_id: row.category_id ?? '' })
        setTagsText((row.tags ?? []).map((t) => t.name).join(', '))
      })
      .catch((err) => setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Failed to load.' }))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onField = (name, value) => setEntry((prev) => ({ ...prev, [name]: value }))

  const onSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setNotice(null)
    setFieldErrors({})
    try {
      const tags = tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const payload = {
        ...entry,
        category_id: entry.category_id ? Number(entry.category_id) : null,
        publish_date: entry.publish_date || null,
        last_updated: entry.last_updated || null,
        tags,
      }
      if (isNew) {
        const created = await knowledgeAdminApi.create(payload)
        navigate(`/admin/knowledge/${created.id}`, { replace: true })
      } else {
        await knowledgeAdminApi.update(id, payload)
      }
      setNotice({ type: 'success', message: 'Saved.' })
    } catch (err) {
      if (err instanceof ApiError && err.code === 'validation_failed') {
        setFieldErrors(err.fields ?? {})
        setNotice({ type: 'error', message: 'Please fix the highlighted fields.' })
      } else {
        setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Save failed.' })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-text-muted">Loading…</p>

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl">{isNew ? 'New Article' : `Edit — ${entry.title}`}</h1>
        <Button variant="ghost" onClick={() => navigate('/admin/knowledge')}>
          Back to list
        </Button>
      </div>

      <Notice type={notice?.type}>{notice?.message}</Notice>

      <form onSubmit={onSubmit} className="space-y-5 rounded-lg border border-border bg-surface p-6">
        <div>
          <label className="block text-sm font-medium">
            Title <span className="text-danger">*</span>
          </label>
          <input required value={entry.title} onChange={(e) => onField('title', e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
          {fieldErrors.title && <p className="mt-1 text-xs text-danger">{fieldErrors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input value={entry.slug ?? ''} onChange={(e) => onField('slug', e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
          <p className="mt-1 text-xs text-text-muted">Leave blank to auto-generate from the title.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Content type</label>
            <select value={entry.content_type} onChange={(e) => onField('content_type', e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm">
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Difficulty</label>
            <select value={entry.difficulty} onChange={(e) => onField('difficulty', e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm">
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <select value={entry.category_id} onChange={(e) => onField('category_id', e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm">
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Short description</label>
          <textarea rows={2} value={entry.short_description ?? ''} onChange={(e) => onField('short_description', e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium">Article body</label>
          <textarea rows={8} value={entry.body ?? ''} onChange={(e) => onField('body', e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium">Tags</label>
          <input
            list="known-tags"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="pentest, ethical-hacking, career"
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
          <datalist id="known-tags">
            {allTags.map((t) => (
              <option key={t.id} value={t.name} />
            ))}
          </datalist>
          <p className="mt-1 text-xs text-text-muted">Comma-separated. New tags are created automatically.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Publish date</label>
            <input type="date" value={entry.publish_date ?? ''} onChange={(e) => onField('publish_date', e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Last updated</label>
            <input type="date" value={entry.last_updated ?? ''} onChange={(e) => onField('last_updated', e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select value={entry.publish_status} onChange={(e) => onField('publish_status', e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </form>
    </div>
  )
}
