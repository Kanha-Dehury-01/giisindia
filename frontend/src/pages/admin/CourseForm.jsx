import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Notice from '../../admin/components/Notice'
import { coursesAdminApi, courseCategoriesApi } from '../../api/admin'
import { ApiError } from '../../api/client'

const LEVELS = ['beginner', 'intermediate', 'advanced']
const MODES = ['classroom', 'hybrid']

function linesToObjects(text, key) {
  return (text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ [key]: line }))
}
function objectsToLines(rows, key) {
  return (rows ?? []).map((r) => r[key]).join('\n')
}

const emptyCourse = {
  title: '',
  slug: '',
  short_description: '',
  long_description: '',
  category_id: '',
  level: 'beginner',
  duration_text: '',
  mode: 'classroom',
  certification_name: '',
  eligibility: '',
  is_featured: false,
  is_best_seller: false,
  is_new: false,
  is_duplicate_suspect: false,
  display_order: 0,
  publish_status: 'draft',
}

export default function CourseForm() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [course, setCourse] = useState(emptyCourse)
  const [outcomesText, setOutcomesText] = useState('')
  const [skillsText, setSkillsText] = useState('')
  const [toolsText, setToolsText] = useState('')
  const [curriculum, setCurriculum] = useState([])
  const [faqs, setFaqs] = useState([])

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [savingContent, setSavingContent] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    courseCategoriesApi.list().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (isNew) return
    setLoading(true)
    coursesAdminApi
      .get(id)
      .then((row) => {
        setCourse({ ...emptyCourse, ...row, category_id: row.category_id ?? '' })
        setOutcomesText(objectsToLines(row.learning_outcomes, 'outcome'))
        setSkillsText(objectsToLines(row.skills, 'skill_name'))
        setToolsText(objectsToLines(row.tools, 'tool_name'))
        setCurriculum(row.curriculum?.length ? row.curriculum : [])
        setFaqs(row.faqs?.length ? row.faqs : [])
      })
      .catch((err) => setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Failed to load.' }))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onField = (name, value) => setCourse((prev) => ({ ...prev, [name]: value }))

  const onSaveDetails = async (event) => {
    event.preventDefault()
    setSaving(true)
    setNotice(null)
    try {
      const payload = { ...course, category_id: course.category_id ? Number(course.category_id) : null, display_order: Number(course.display_order) || 0 }
      if (isNew) {
        const created = await coursesAdminApi.create(payload)
        navigate(`/admin/courses/${created.id}`, { replace: true })
        setNotice({ type: 'success', message: 'Course created — now add curriculum, skills, and FAQs below.' })
      } else {
        await coursesAdminApi.update(id, payload)
        setNotice({ type: 'success', message: 'Course details saved.' })
      }
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Save failed.' })
    } finally {
      setSaving(false)
    }
  }

  const onSaveContent = async () => {
    setSavingContent(true)
    setNotice(null)
    try {
      await coursesAdminApi.updateChildren(id, {
        learning_outcomes: linesToObjects(outcomesText, 'outcome'),
        skills: linesToObjects(skillsText, 'skill_name'),
        tools: linesToObjects(toolsText, 'tool_name'),
        curriculum: curriculum.filter((m) => m.module_title?.trim()),
        faqs: faqs.filter((f) => f.question?.trim()),
      })
      setNotice({ type: 'success', message: 'Course content saved.' })
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Save failed.' })
    } finally {
      setSavingContent(false)
    }
  }

  if (loading) return <p className="text-text-muted">Loading…</p>

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl">{isNew ? 'New Course' : `Edit — ${course.title}`}</h1>
        <Button variant="ghost" onClick={() => navigate('/admin/courses')}>
          Back to list
        </Button>
      </div>

      <Notice type={notice?.type}>{notice?.message}</Notice>

      <form onSubmit={onSaveDetails} className="space-y-5 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Course details</h2>

        <Field label="Title" required value={course.title} onChange={(v) => onField('title', v)} />
        <Field label="Slug" hint="Leave blank to auto-generate from the title." value={course.slug} onChange={(v) => onField('slug', v)} />
        <Field label="Short description" type="textarea" value={course.short_description} onChange={(v) => onField('short_description', v)} />
        <Field label="Full overview" type="textarea" rows={5} value={course.long_description} onChange={(v) => onField('long_description', v)} />

        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            value={course.category_id}
            onChange={(e) => onField('category_id', e.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Level</label>
            <select value={course.level} onChange={(e) => onField('level', e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm">
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Mode</label>
            <select value={course.mode} onChange={(e) => onField('mode', e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm">
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Field label="Duration" hint="e.g. 12 weeks" value={course.duration_text} onChange={(v) => onField('duration_text', v)} />
        <Field label="Certification name" value={course.certification_name} onChange={(v) => onField('certification_name', v)} />
        <Field label="Eligibility" type="textarea" value={course.eligibility} onChange={(v) => onField('eligibility', v)} />

        <div className="grid grid-cols-2 gap-3">
          <Checkbox label="Best seller" checked={course.is_best_seller} onChange={(v) => onField('is_best_seller', v)} />
          <Checkbox label="Featured" checked={course.is_featured} onChange={(v) => onField('is_featured', v)} />
          <Checkbox label="New" checked={course.is_new} onChange={(v) => onField('is_new', v)} />
          <Checkbox label="Duplicate suspect" checked={course.is_duplicate_suspect} onChange={(v) => onField('is_duplicate_suspect', v)} />
        </div>

        <Field label="Display order" type="number" value={course.display_order} onChange={(v) => onField('display_order', v)} />

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select value={course.publish_status} onChange={(e) => onField('publish_status', e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Course Details'}
        </Button>
      </form>

      {!isNew && (
        <div className="mt-8 space-y-6 rounded-lg border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Curriculum, skills & FAQs</h2>

          <Field label="Learning outcomes" type="textarea" rows={4} hint="One per line." value={outcomesText} onChange={setOutcomesText} />
          <Field label="Skills" type="textarea" rows={3} hint="One per line." value={skillsText} onChange={setSkillsText} />
          <Field label="Tools" type="textarea" rows={3} hint="One per line." value={toolsText} onChange={setToolsText} />

          <RepeatableList
            title="Curriculum modules"
            rows={curriculum}
            setRows={setCurriculum}
            makeEmpty={() => ({ module_title: '', module_description: '' })}
            renderRow={(row, update) => (
              <>
                <input
                  placeholder="Module title"
                  value={row.module_title ?? ''}
                  onChange={(e) => update({ ...row, module_title: e.target.value })}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="Module description"
                  rows={2}
                  value={row.module_description ?? ''}
                  onChange={(e) => update({ ...row, module_description: e.target.value })}
                  className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
                />
              </>
            )}
          />

          <RepeatableList
            title="FAQs"
            rows={faqs}
            setRows={setFaqs}
            makeEmpty={() => ({ question: '', answer: '' })}
            renderRow={(row, update) => (
              <>
                <input
                  placeholder="Question"
                  value={row.question ?? ''}
                  onChange={(e) => update({ ...row, question: e.target.value })}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="Answer"
                  rows={2}
                  value={row.answer ?? ''}
                  onChange={(e) => update({ ...row, answer: e.target.value })}
                  className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
                />
              </>
            )}
          />

          <Button onClick={onSaveContent} disabled={savingContent}>
            {savingContent ? 'Saving…' : 'Save Content'}
          </Button>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', rows = 3, hint, required }) {
  return (
    <div>
      <label className="block text-sm font-medium">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {type === 'textarea' ? (
        <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
      ) : (
        <input type={type} required={required} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm" />
      )}
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  )
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-border" />
      {label}
    </label>
  )
}

function RepeatableList({ title, rows, setRows, makeEmpty, renderRow }) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-2 space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-md border border-border p-3">
            {renderRow(row, (next) => setRows((prev) => prev.map((r, idx) => (idx === i ? next : r))))}
            <button type="button" onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))} className="mt-2 text-xs text-danger">
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setRows((prev) => [...prev, makeEmpty()])} className="mt-2 text-sm font-medium text-accent hover:underline">
        + Add
      </button>
    </div>
  )
}
