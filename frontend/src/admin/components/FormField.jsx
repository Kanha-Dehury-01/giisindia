/**
 * Renders one form control from a resources.config.js field descriptor.
 * Every admin form (generic and dedicated) shares this so labels, hints,
 * and required-field markers stay consistent without re-implementing them
 * per page (spec §46: "clear labels, helpful placeholders").
 */
export default function FormField({ field, value, onChange }) {
  const inputId = `field-${field.name}`
  const commonClasses =
    'mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-text">
        {field.label}
        {field.required && <span className="text-danger"> *</span>}
      </label>

      {field.type === 'textarea' && (
        <textarea
          id={inputId}
          rows={field.rows ?? 3}
          value={value ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={commonClasses}
        />
      )}

      {field.type === 'select' && (
        <select
          id={inputId}
          value={value ?? field.default ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={commonClasses}
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      )}

      {field.type === 'checkbox' && (
        <div className="mt-2 flex items-center gap-2">
          <input
            id={inputId}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(field.name, e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <label htmlFor={inputId} className="text-sm text-text-muted">
            {field.checkboxLabel ?? 'Yes'}
          </label>
        </div>
      )}

      {['text', 'number', 'datetime-local'].includes(field.type) && (
        <input
          id={inputId}
          type={field.type}
          value={value ?? ''}
          maxLength={field.maxLength}
          onChange={(e) => onChange(field.name, field.type === 'number' ? e.target.value : e.target.value)}
          className={commonClasses}
        />
      )}

      {field.hint && <p className="mt-1 text-xs text-text-muted">{field.hint}</p>}
    </div>
  )
}
