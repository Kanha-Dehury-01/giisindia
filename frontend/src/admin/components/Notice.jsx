const STYLES = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-danger/30 bg-danger/10 text-danger',
  info: 'border-border bg-surface-muted text-text-muted',
}

/** Inline status banner for form/table outcomes — save success, validation errors, load failures. */
export default function Notice({ type = 'info', children }) {
  if (!children) return null
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`mb-4 rounded-md border px-4 py-3 text-sm ${STYLES[type]}`}>
      {children}
    </div>
  )
}
