import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Notice from '../../admin/components/Notice'
import { learningPathsAdminApi } from '../../api/admin'
import { ApiError } from '../../api/client'

const STEP_TYPES = [
  'fundamentals',
  'networking',
  'linux',
  'security_fundamentals',
  'specialization',
  'certification',
  'practical_experience',
  'career',
  'custom',
]

function emptyStep() {
  return { step_title: '', step_description: '', step_type: 'custom' }
}

/** Reorderable step editor for one learning path — the Fundamentals → Career step flow (spec §20). */
export default function LearningPathSteps() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pathTitle, setPathTitle] = useState('')
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    learningPathsAdminApi
      .get(id)
      .then((row) => {
        setPathTitle(row.title)
        setSteps(row.steps?.length ? row.steps : [emptyStep()])
      })
      .catch((err) => setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Failed to load.' }))
      .finally(() => setLoading(false))
  }, [id])

  const updateStep = (index, key, value) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, [key]: value } : s)))
  }
  const addStep = () => setSteps((prev) => [...prev, emptyStep()])
  const removeStep = (index) => setSteps((prev) => prev.filter((_, i) => i !== index))
  const moveStep = (index, dir) => {
    setSteps((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const onSave = async () => {
    setSaving(true)
    setNotice(null)
    try {
      const payload = steps.map((s, i) => ({ ...s, display_order: i }))
      await learningPathsAdminApi.updateSteps(id, payload)
      setNotice({ type: 'success', message: 'Steps saved.' })
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Save failed.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-text-muted">Loading…</p>

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl">Steps — {pathTitle}</h1>
        <Button variant="ghost" onClick={() => navigate(`/admin/learning-paths/${id}`)}>
          Back to path
        </Button>
      </div>

      <Notice type={notice?.type}>{notice?.message}</Notice>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Step {i + 1}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => moveStep(i, -1)} disabled={i === 0} className="text-xs text-accent disabled:opacity-30">
                  Move up
                </button>
                <button type="button" onClick={() => moveStep(i, 1)} disabled={i === steps.length - 1} className="text-xs text-accent disabled:opacity-30">
                  Move down
                </button>
                <button type="button" onClick={() => removeStep(i)} className="text-xs text-danger">
                  Remove
                </button>
              </div>
            </div>

            <label className="mt-3 block text-sm font-medium">Step title</label>
            <input
              value={step.step_title ?? ''}
              onChange={(e) => updateStep(i, 'step_title', e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />

            <label className="mt-3 block text-sm font-medium">Step type</label>
            <select
              value={step.step_type ?? 'custom'}
              onChange={(e) => updateStep(i, 'step_type', e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            >
              {STEP_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>

            <label className="mt-3 block text-sm font-medium">Description</label>
            <textarea
              rows={2}
              value={step.step_description ?? ''}
              onChange={(e) => updateStep(i, 'step_description', e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <button type="button" onClick={addStep} className="text-sm font-medium text-accent hover:underline">
          + Add step
        </button>
      </div>

      <div className="mt-6">
        <Button onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Steps'}
        </Button>
      </div>
    </div>
  )
}
