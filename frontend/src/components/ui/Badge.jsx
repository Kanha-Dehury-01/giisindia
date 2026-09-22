const VARIANTS = {
  accent: 'bg-accent text-[var(--button-primary-text)]',
  outline: 'border border-border text-text-muted',
  new: 'bg-success/10 text-success',
}

export default function Badge({ variant = 'accent', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${VARIANTS[variant]}`}>
      {children}
    </span>
  )
}
