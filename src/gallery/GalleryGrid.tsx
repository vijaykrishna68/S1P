import { useEffect, useState } from 'react'
import { Dialog } from '../components/ui/Dialog'
import { EchoMark } from '../components/mission/EchoMark'
import { GalleryTile } from './GalleryTile'
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
  // The image stays set after the viewer closes so its content doesn't vanish
  // while the dialog is still fading out; `viewerOpen` drives open/close.
  const [viewerImage, setViewerImage] = useState<GalleryImage | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

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
        role="status"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
      >
        <span className="sr-only">Loading gallery</span>
        {Array.from({ length: 8 }).map((_, i) => (
          // Pending-state indicator: a gentle pulse that stops when data arrives
          // and, by design, keeps running under reduced motion (CLAUDE.md §3).
          <div
            key={i}
            aria-hidden="true"
            className="skeleton-pulse motion-pending aspect-square rounded-xl bg-cream-soft"
          />
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
      // Quiet-mark slot (Tier A): the plain EchoMark (Phase 4C S8), kept distinct
      // from the viewfinder in the hero above it. Not a spot illustration, so it
      // stays inside the per-page spot-illustration budget alongside the closing band.
      <div
        data-illustration-slot="gallery-empty-state"
        className="mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-2xl bg-yellow-tint px-6 py-14 text-center"
      >
        <EchoMark className="h-24 w-24 md:h-28 md:w-28" />
        <p className="max-w-[40ch] text-charcoal-muted">
          Photos from our journey are on their way. Check back soon.
        </p>
      </div>
    )
  }

  return (
    <>
      <ul className="fade-in grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {state.items.map((image) => (
          <li key={image.id}>
            <GalleryTile
              image={image}
              alt={image.caption || DEFAULT_ALT}
              onOpen={(opened) => {
                setViewerImage(opened)
                setViewerOpen(true)
              }}
            />
          </li>
        ))}
      </ul>

      <Dialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={viewerImage?.caption || DEFAULT_ALT}
      >
        {viewerImage && (
          <figure>
            <img
              src={viewerImage.imageUrl}
              alt={viewerImage.caption || DEFAULT_ALT}
              className="max-h-[80vh] w-full rounded-2xl object-contain"
            />
            {viewerImage.caption && (
              <figcaption className="mt-3 text-center text-sm text-white">
                {viewerImage.caption}
              </figcaption>
            )}
          </figure>
        )}
      </Dialog>
    </>
  )
}
