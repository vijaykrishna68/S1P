import { useEffect, useState, type ChangeEvent } from 'react'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Dialog } from '../components/ui/Dialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Illustration } from '../components/ui/Illustration'
import { fieldControlClasses } from '../components/donation/FormField'
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
    <div className="min-h-screen bg-canvas px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex min-h-11 items-center font-bold text-ink underline-offset-4 hover:underline hover:decoration-highlight hover:decoration-2"
          >
            ← Back to donations
          </button>
        </div>

        <h1 className="heading-1">Gallery</h1>

        {/* Upload */}
        <div className="space-y-4 rounded-card border-2 border-line bg-elevated p-6">
          <h2 className="heading-3">Upload an image</h2>

          {(upload.state.status === 'idle' || upload.state.status === 'invalid') && (
            <div>
              <label
                htmlFor="gallery-file"
                className="flex min-h-12 w-fit cursor-pointer items-center gap-2 rounded-full border-2 border-dashed
                  border-line-strong px-6 py-2.5 font-text text-base font-bold text-ink transition-colors
                  duration-(--motion-duration-micro) hover:border-line-ink has-[:focus-visible]:border-line-ink
                  has-[:focus-visible]:shadow-focus"
              >
                <Icon name="upload" />
                Choose Image
                <input
                  id="gallery-file"
                  type="file"
                  accept={ACCEPT}
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
              <p className="mt-2 text-[13px] text-ink-2">PNG, JPG, or WEBP, up to 5MB.</p>
              {upload.state.status === 'invalid' && (
                <Alert tone="error" className="mt-3">
                  {upload.state.message}
                </Alert>
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
                className="h-32 w-32 shrink-0 rounded-chip border-2 border-line object-cover"
              />
              <div className="flex-1 space-y-3">
                <p className="text-sm text-ink-2">
                  {upload.state.file.name} · {formatBytes(upload.state.file.size)}
                </p>
                <label className="block">
                  <span className="text-base font-bold text-ink">Caption (optional)</span>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={200}
                    disabled={upload.state.status === 'uploading'}
                    className={`mt-1 ${fieldControlClasses}`}
                  />
                </label>

                {upload.state.status === 'error' && (
                  <Alert tone="error">{upload.state.message}</Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => upload.upload(caption)}
                    busy={upload.state.status === 'uploading'}
                  >
                    {upload.state.status === 'uploading'
                      ? 'Uploading…'
                      : upload.state.status === 'error'
                        ? 'Retry Upload'
                        : 'Upload'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={upload.cancel}
                    disabled={upload.state.status === 'uploading'}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Existing images */}
        <div>
          <h2 className="heading-3">Existing images</h2>

          {images.status === 'loading' && <p className="mt-4 text-ink-2">Loading…</p>}

          {images.status === 'error' && (
            <Alert tone="error" title="The images didn't load." className="mt-4">
              {images.message}
            </Alert>
          )}

          {images.status === 'loaded' && images.items.length === 0 && (
            <EmptyState
              compact
              title="No images yet"
              body="Upload one above to get started."
              illustration={
                <div className="w-[200px]">
                  <Illustration name="empty-plate" decorative animate="off" />
                </div>
              }
            />
          )}

          {images.status === 'loaded' && images.items.length > 0 && (
            <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.items.map((image) => (
                <li key={image.id} className="group relative">
                  <img
                    src={image.imageUrl}
                    alt={image.caption || "Photo from Sacrifice One Pizza's gallery"}
                    loading="lazy"
                    className="aspect-square w-full rounded-chip bg-surface object-cover"
                  />
                  <button
                    onClick={() => setDeleteState({ status: 'confirming', image })}
                    aria-label={`Delete image${image.caption ? `: ${image.caption}` : ''}`}
                    className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full
                      bg-elevated text-ink transition-colors duration-(--motion-duration-micro) hover:bg-error-soft hover:text-error"
                  >
                    <Icon name="trash" />
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
        tone="destructive"
        actions={
          deleteState.status !== 'idle' && (
            <>
              <Button
                variant="secondary"
                onClick={() => setDeleteState({ status: 'idle' })}
                disabled={deleteState.status === 'deleting'}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                busy={deleteState.status === 'deleting'}
              >
                {deleteState.status === 'deleting' ? 'Deleting…' : 'Delete image'}
              </Button>
            </>
          )
        }
      >
        {deleteState.status !== 'idle' && (
          <div className="space-y-3">
            <p>Delete this image from the gallery? This can&rsquo;t be undone.</p>
            {deleteState.status === 'error' && (
              <Alert tone="error">{deleteState.message}</Alert>
            )}
          </div>
        )}
      </Dialog>
    </div>
  )
}
