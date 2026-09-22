/**
 * Shared "nothing here" state — search/filter dead ends, empty lists.
 * Per ui-ux-pro-max UX guidance: always offer a next step (a suggestion
 * or a reset action), never a bare "No results found."
 */
export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--card-radius)] border border-dashed border-border bg-surface-muted px-6 py-16 text-center">
      <h3 className="text-base">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
