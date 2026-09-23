import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import FormField from '../../../admin/components/FormField'
import Notice from '../../../admin/components/Notice'
import { getResourceConfig } from '../../../admin/resources.config'
import { ApiError } from '../../../api/client'

function defaultsFor(fields) {
  const values = {}
  fields.forEach((f) => {
    if (f.default !== undefined) values[f.name] = f.default
  })
  return values
}

function coerceForSubmit(fields, values) {
  const out = {}
  fields.forEach((f) => {
    const raw = values[f.name]
    if (raw === '' || raw === undefined) {
      out[f.name] = null
      return
    }
    if (f.type === 'number') {
      out[f.name] = raw === null ? null : Number(raw)
    } else if (f.type === 'checkbox') {
      out[f.name] = Boolean(raw)
    } else {
      out[f.name] = raw
    }
  })
  return out
}

/** Generic admin create/edit form — one component serves every "plain" resource in resources.config.js. */
export default function ResourceForm({ resourceKey }) {
  const config = getResourceConfig(resourceKey)
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [values, setValues] = useState(defaultsFor(config.fields))
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (isNew) return
    setLoading(true)
    config.api
      .get(id)
      .then((row) => setValues(row))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceKey, id])

  const onChange = (name, value) => setValues((prev) => ({ ...prev, [name]: value }))

  const onSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setFieldErrors({})
    try {
      const payload = coerceForSubmit(config.fields, values)
      if (isNew) {
        const created = await config.api.create(payload)
        navigate(`/admin/${resourceKey}/${created.id}`, { replace: true })
      } else {
        await config.api.update(id, payload)
      }
      setError({ type: 'success', message: 'Saved.' })
    } catch (err) {
      if (err instanceof ApiError && err.code === 'validation_failed') {
        setFieldErrors(err.fields ?? {})
        setError('Please fix the highlighted fields.')
      } else {
        setError(err instanceof ApiError ? err.message : 'Save failed.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-text-muted">Loading…</p>

  const notice = typeof error === 'object' && error?.type === 'success' ? null : error

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl">
          {isNew ? `New ${config.singular}` : `Edit ${config.singular}`}
        </h1>
        <Button variant="ghost" onClick={() => navigate(`/admin/${resourceKey}`)}>
          Back to list
        </Button>
      </div>

      <Notice type="error">{notice}</Notice>
      {typeof error === 'object' && error?.type === 'success' && <Notice type="success">{error.message}</Notice>}

      <form onSubmit={onSubmit} className="space-y-5 rounded-lg border border-border bg-surface p-6">
        {config.fields.map((field) => (
          <div key={field.name}>
            <FormField field={field} value={values[field.name]} onChange={onChange} />
            {fieldErrors[field.name] && <p className="mt-1 text-xs text-danger">{fieldErrors[field.name]}</p>}
          </div>
        ))}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          {config.hasSteps && !isNew && (
            <Button type="button" variant="ghost" onClick={() => navigate(`/admin/${resourceKey}/${id}/steps`)}>
              Edit Steps
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
