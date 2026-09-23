import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'

const STATUS_VARIANT = { published: 'new', draft: 'outline' }

/**
 * Generic admin list table: columns are declarative (resources.config.js),
 * status columns render as a badge automatically, and every row gets
 * Edit/Delete actions. Shared by every resource so pagination, empty
 * states, and row actions only need to be right once.
 */
export default function DataTable({ columns, rows, page, totalPages, onPageChange, onEdit, onDelete, loading, canDelete = true }) {
  if (!loading && rows.length === 0) {
    return <EmptyState title="Nothing here yet" description="Create the first entry using the button above." />
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-text-muted">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className="px-4 py-3">
                  {col.label}
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-text-muted">
                  Loading…
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-muted/50">
                  {columns.map((col) => (
                    <td key={col.key} className="max-w-xs truncate px-4 py-3 text-text">
                      {col.badge ? (
                        <Badge variant={STATUS_VARIANT[row[col.key]] ?? 'outline'}>{row[col.key]}</Badge>
                      ) : (
                        String(row[col.key] ?? '—')
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => onEdit(row)} className="text-sm font-medium text-accent hover:underline">
                        Edit
                      </button>
                      {canDelete && (
                        <button type="button" onClick={() => onDelete(row)} className="text-sm font-medium text-danger hover:underline">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </div>
  )
}
