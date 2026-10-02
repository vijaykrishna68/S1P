import { useEffect, useState, type ChangeEvent } from 'react'
import { CircleNotch, Trash, UploadSimple, WarningCircle } from '@phosphor-icons/react'
import { Dialog } from '../components/ui/Dialog'
import {
  listGalleryImages,
  GalleryApiError,
  type GalleryImage,
} from '../gallery/galleryApi'
import { useGalleryUpload } from './useGalleryUpload'
import { deleteGalleryImage, ApiError } from './api'

type ImagesState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; items: GalleryImage[] }

type DeleteState =
  | { status: 'idle' }
  | { status: 'confirming'; image: GalleryImage }
  | { status: 'deleting'; image: GalleryImage }
  | { status: 'error'; image: GalleryImage; message: string }

const ACCEPT = 'image/png,image/jpeg,image/webp'

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

interface AdminGalleryPageProps {
  onBack: () => void
}

export function AdminGalleryPage({ onBack }: AdminGalleryPageProps) {
  const [images, setImages] = useState<ImagesState>({ status: 'loading' })
  const [caption, setCaption] = useState('')
  const [deleteState, setDeleteState] = useState<DeleteState>({ status: 'idle' })

  useEffect(() => {
    let cancelled = false
    listGalleryImages()
      .then((items) => {
        if (!cancelled) setImages({ status: 'loaded', items })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setImages({
            status: 'error',
            message:
              err instanceof GalleryApiError
                ? err.message
                : "We couldn't load the gallery. Please try again.",
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const upload = useGalleryUpload((created) => {
    setCaption('')
    setImages((prev) =>
      prev.status === 'loaded'
        ? { status: 'loaded', items: [created, ...prev.items] }
        : { status: 'loaded', items: [created] },
    )
  })

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) upload.selectFile(file)
    event.target.value = ''
  }

  const confirmDelete = async () => {
    if (deleteState.status !== 'confirming' && deleteState.status !== 'error') return
    const image = deleteState.image
    setDeleteState({ status: 'deleting', image })
    try {
      await deleteGalleryImage(image.id)
      setImages((prev) =>
        prev.status === 'loaded'
          ? { status: 'loaded', items: prev.items.filter((item) => item.id !== image.id) }
          : prev,
      )
      setDeleteState({ status: 'idle' })
    } catch (err) {
      setDeleteState({
        status: 'error',
        image,
        message:
          err instanceof ApiError
            ? err.message
            : "We couldn't delete that image. Please try again.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="font-semibold text-charcoal underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/40"
          >
            ← Back to donations
          </button>
        </div>

        <h1 className="font-display text-2xl font-bold text-charcoal">Gallery</h1>

        {/* Upload */}
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-charcoal">
            Upload an image
          </h2>

          {(upload.state.status === 'idle' || upload.state.status === 'invalid') && (
            <div>
              <label
                htmlFor="gallery-file"
                className="flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-full border-2 border-dashed
                  border-charcoal/20 px-5 py-2.5 text-sm font-semibold text-charcoal transition-colors
                  duration-200 hover:border-charcoal/35 has-[:focus-visible]:border-red has-[:focus-visible]:ring-2
                  has-[:focus-visible]:ring-red/30"
              >
                <UploadSimple size={18} />
                Choose Image
                <input
                  id="gallery-file"
                  type="file"
                  accept={ACCEPT}
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
              <p className="mt-2 text-xs text-charcoal-muted">
                PNG, JPG, or WEBP, up to 5MB.
              </p>
              {upload.state.status === 'invalid' && (
                <p
                  role="alert"
                  className="mt-2 flex items-center gap-1.5 text-sm text-red-deep"
                >
                  <WarningCircle size={16} /> {upload.state.message}
                </p>
              )}
            </div>
          )}

          {(upload.state.status === 'selected' ||
            upload.state.status === 'uploading' ||
            upload.state.status === 'error') && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <img
                src={upload.state.previewUrl}
                alt="Preview of the selected image"
                className="h-32 w-32 shrink-0 rounded-xl border border-charcoal/12 object-cover"
              />
              <div className="flex-1 space-y-3">
                <p className="text-sm text-charcoal-muted">
                  {upload.state.file.name} · {formatBytes(upload.state.file.size)}
                </p>
                <label className="block">
                  <span className="text-sm font-medium text-charcoal">
                    Caption (optional)
                  </span>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={200}
                    disabled={upload.state.status === 'uploading'}
                    className="mt-1 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 text-charcoal
                      transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2
                      focus-visible:ring-red/40"
                  />
                </label>

                {upload.state.status === 'error' && (
                  <p
                    role="alert"
                    className="flex items-center gap-1.5 text-sm text-red-deep"
                  >
                    <WarningCircle size={16} /> {upload.state.message}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => upload.upload(caption)}
                    disabled={upload.state.status === 'uploading'}
                    className="flex min-h-11 items-center gap-2 rounded-full bg-red-deep px-5 text-sm font-semibold
                      text-white transition-opacity disabled:opacity-60"
                  >
                    {upload.state.status === 'uploading' && (
                      <CircleNotch size={16} className="animate-spin" />
                    )}
                    {upload.state.status === 'uploading'
                      ? 'Uploading…'
                      : upload.state.status === 'error'
                        ? 'Retry Upload'
                        : 'Upload'}
                  </button>
                  <button
                    onClick={upload.cancel}
                    disabled={upload.state.status === 'uploading'}
                    className="min-h-11 rounded-full border border-charcoal/15 px-5 text-sm font-semibold
                      text-charcoal transition-opacity disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Existing images */}
        <div>
          <h2 className="font-display text-lg font-semibold text-charcoal">
            Existing images
          </h2>

          {images.status === 'loading' && (
            <p className="mt-4 text-charcoal-muted">Loading…</p>
          )}

          {images.status === 'error' && (
            <p role="alert" className="mt-4 text-red-deep">
              {images.message}
            </p>
          )}

          {images.status === 'loaded' && images.items.length === 0 && (
            <p className="mt-4 text-charcoal-muted">
              No images yet — upload one above to get started.
            </p>
          )}

          {images.status === 'loaded' && images.items.length > 0 && (
            <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.items.map((image) => (
                <li key={image.id} className="group relative">
                  <img
                    src={image.imageUrl}
                    alt={image.caption || "Photo from Sacrifice One Pizza's gallery"}
                    loading="lazy"
                    className="aspect-square w-full rounded-xl bg-cream-soft object-cover"
                  />
                  <button
                    onClick={() => setDeleteState({ status: 'confirming', image })}
                    aria-label={`Delete image${image.caption ? `: ${image.caption}` : ''}`}
                    className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full
                      bg-white/90 text-charcoal-muted transition-colors duration-200 hover:bg-white hover:text-red-deep
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/40"
                  >
                    <Trash size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Dialog
        open={deleteState.status !== 'idle'}
        onClose={() => setDeleteState({ status: 'idle' })}
        title="Delete this image?"
      >
        {deleteState.status !== 'idle' && (
          <div className="w-[min(90vw,420px)] space-y-4 rounded-2xl bg-white p-6">
            <p className="text-charcoal">
              Delete this image from the gallery? This can&rsquo;t be undone.
            </p>
            {deleteState.status === 'error' && (
              <p role="alert" className="text-sm text-red-deep">
                {deleteState.message}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteState({ status: 'idle' })}
                disabled={deleteState.status === 'deleting'}
                className="min-h-11 rounded-full border border-charcoal/15 px-5 text-sm font-semibold text-charcoal
                  transition-opacity disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteState.status === 'deleting'}
                className="flex min-h-11 items-center gap-2 rounded-full bg-red-deep px-5 text-sm font-semibold
                  text-white transition-opacity disabled:opacity-60"
              >
                {deleteState.status === 'deleting' && (
                  <CircleNotch size={16} className="animate-spin" />
                )}
                {deleteState.status === 'deleting' ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
