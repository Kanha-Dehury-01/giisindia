import Button from '../../components/ui/Button'

/**
 * Blocking delete confirmation (spec §46: "delete confirmation" is a
 * required CMS UX affordance) — a simple centered modal, not a native
 * confirm() which some admins' browsers suppress silently.
 */
export default function ConfirmDialog({ open, title, description, onConfirm, onCancel, confirmLabel = 'Delete' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="w-full max-w-sm rounded-lg bg-surface p-6 shadow-xl">
        <h2 id="confirm-dialog-title" className="text-base font-semibold text-text">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-text-muted">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-medium text-text hover:bg-surface-muted"
          >
            Cancel
          </button>
          <Button type="button" onClick={onConfirm} className="!bg-danger !text-white hover:!bg-danger/90">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
