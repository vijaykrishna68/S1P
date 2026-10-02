import { useEffect, useState } from 'react'
import { ImageBroken } from '@phosphor-icons/react'
import { Dialog } from '../components/ui/Dialog'
import { listGalleryImages, GalleryApiError, type GalleryImage } from './galleryApi'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; items: GalleryImage[] }

const DEFAULT_ALT = "Photo from Sacrifice One Pizza's gallery"

/**
 * Public grid + image viewer. Same load-state shape already used by
 * DashboardPage/SubmissionDetail (loading/error/loaded), reused here for
 * consistency rather than inventing a different one.
 */
export function GalleryGrid() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [openImage, setOpenImage] = useState<GalleryImage | null>(null)

  useEffect(() => {
    let cancelled = false

    listGalleryImages()
      .then((items) => {
        if (!cancelled) setState({ status: 'loaded', items })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        // Generic, never the underlying error's own message — a public
        // visitor never needs (or should see) server/storage internals.
        setState({
          status: 'error',
          message:
            err instanceof GalleryApiError && err.status < 500
              ? err.message
              : "We couldn't load the gallery right now. Please try again in a moment.",
        })
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (state.status === 'loading') {
    return (
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
        aria-busy="true"
        aria-label="Loading gallery"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-cream-soft" />
        ))}
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <p role="alert" className="text-charcoal-muted">
        {state.message}
      </p>
    )
  }

  if (state.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-cream-soft px-6 py-16 text-center">
        <ImageBroken size={32} className="text-charcoal-muted" aria-hidden="true" />
        <p className="text-charcoal-muted">
          Photos from our journey are on their way. Check back soon.
        </p>
      </div>
    )
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {state.items.map((image) => (
          <li key={image.id}>
            <button
              type="button"
              onClick={() => setOpenImage(image)}
              className="block aspect-square w-full overflow-hidden rounded-xl bg-cream-soft
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/40 focus-visible:ring-offset-2"
            >
              <img
                src={image.imageUrl}
                alt={image.caption || DEFAULT_ALT}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={openImage !== null}
        onClose={() => setOpenImage(null)}
        title={openImage?.caption || DEFAULT_ALT}
      >
        {openImage && (
          <figure>
            <img
              src={openImage.imageUrl}
              alt={openImage.caption || DEFAULT_ALT}
              className="max-h-[80vh] w-full rounded-2xl object-contain"
            />
            {openImage.caption && (
              <figcaption className="mt-3 text-center text-sm text-white">
                {openImage.caption}
              </figcaption>
            )}
          </figure>
        )}
      </Dialog>
    </>
  )
}
