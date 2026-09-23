import { useEffect, useRef, useState } from 'react'
import Button from '../../components/ui/Button'
import Notice from '../../admin/components/Notice'
import ConfirmDialog from '../../admin/components/ConfirmDialog'
import { mediaAdminApi } from '../../api/admin'
import { ApiError } from '../../api/client'

/** Upload/search/replace/delete for images and files (spec §30) — validation (MIME, size, safe filename) is enforced server-side in backend/includes/upload.php. */
export default function MediaLibrary() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const fileInput = useRef(null)

  const load = () => {
    setLoading(true)
    mediaAdminApi
      .list({ per_page: 60 })
      .then(({ data }) => setItems(data))
      .catch((err) => setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Failed to load.' }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const onFileChosen = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setNotice(null)
    try {
      await mediaAdminApi.upload(file, { altText: file.name })
      load()
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Upload failed.' })
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const onCopy = (path) => {
    navigator.clipboard?.writeText(window.location.origin.replace('5173', '8000') + path).catch(() => {})
    setNotice({ type: 'success', message: 'Path copied.' })
  }

  const confirmDelete = async () => {
    try {
      await mediaAdminApi.remove(pendingDelete.id)
      setItems((prev) => prev.filter((m) => m.id !== pendingDelete.id))
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof ApiError ? err.message : 'Delete failed.' })
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl">Media Library</h1>
        <div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml" onChange={onFileChosen} className="hidden" id="media-upload-input" />
          <Button type="button" onClick={() => fileInput.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : '+ Upload File'}
          </Button>
        </div>
      </div>

      <Notice type={notice?.type}>{notice?.message}</Notice>
      <p className="mb-4 text-xs text-text-muted">JPEG, PNG, WebP, AVIF, or SVG — 5MB max. Files are MIME-verified server-side regardless of extension.</p>

      {loading ? (
        <p className="text-text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-text-muted">No files uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex aspect-square items-center justify-center bg-surface-muted">
                {item.mime_type.startsWith('image/') ? (
                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  <img src={item.path} alt={item.alt_text ?? item.original_filename} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-text-muted">{item.mime_type}</span>
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium" title={item.original_filename}>
                  {item.original_filename}
                </p>
                <p className="text-[10px] text-text-muted">ID {item.id} · {(item.file_size / 1024).toFixed(0)} KB</p>
                <div className="mt-1 flex gap-2">
                  <button type="button" onClick={() => onCopy(item.path)} className="text-[11px] font-medium text-accent hover:underline">
                    Copy path
                  </button>
                  <button type="button" onClick={() => setPendingDelete(item)} className="text-[11px] font-medium text-danger hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this file?"
        description={pendingDelete ? `"${pendingDelete.original_filename}" will be permanently removed from disk.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
