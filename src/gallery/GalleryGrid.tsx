import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Illustration } from '../components/ui/Illustration'
import { Skeleton } from '../components/ui/Skeleton'
import { GalleryTile, type TileShape } from './GalleryTile'
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
  const [attempt, setAttempt] = useState(0)
  // The index stays set after the viewer closes so its content doesn't vanish
  // while the dialog is still fading out; `viewerOpen` drives open/close.
  const [viewerIndex, setViewerIndex] = useState(0)
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
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  if (state.status === 'loading') {
    return (
      <div role="status">
        <span className="sr-only">Loading gallery</span>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} media lines={1} />
          ))}
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-6">
        <div className="mx-auto max-w-[260px]">
          <Illustration name="error-try-again" decorative animate="off" plate={false} />
        </div>
        <Alert
          tone="error"
          title="The gallery didn't load."
          action={
            <Button variant="secondary" size="sm" onClick={retry}>
              Try again
            </Button>
          }
        >
          {state.message}
        </Alert>
      </div>
    )
  }

  if (state.items.length === 0) {
    return (
      <EmptyState
        title="Photos are on their way"
        body="Photos from our journey are on their way. Check back soon."
        illustration={<Illustration name="empty-plate" decorative plate={false} />}
      />
    )
  }

  const { items } = state
  const current = items[viewerIndex]
  const altFor = (image: GalleryImage) => image.caption || DEFAULT_ALT
  // Editorial rhythm: every sixth tile is a 2×2 feature, and one in six is tall.
  const shapeFor = (i: number): TileShape =>
    i % 6 === 0 ? 'feature' : i % 6 === 3 ? 'tall' : 'normal'
  const step = (delta: number) =>
    setViewerIndex((i) => (i + delta + items.length) % items.length)

  return (
    <>
      <ul className="fade-in grid grid-flow-dense grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((image, i) => (
          <li
            key={image.id}
            className={shapeFor(i) === 'feature' ? 'col-span-2 md:row-span-1' : ''}
          >
            <GalleryTile
              image={image}
              alt={altFor(image)}
              shape={shapeFor(i)}
              onOpen={() => {
                setViewerIndex(i)
                setViewerOpen(true)
              }}
            />
          </li>
        ))}
      </ul>

      <Dialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={current ? altFor(current) : DEFAULT_ALT}
      >
        {current && (
          <figure>
            <img
              src={current.imageUrl}
              alt={altFor(current)}
              className="max-h-[75vh] w-full rounded-card object-contain"
            />
            <figcaption className="mt-3 flex items-center justify-between gap-3 text-white">
              <Button
                variant="secondary"
                size="sm"
                icon="arrow-left"
                onClick={() => step(-1)}
                disabled={items.length < 2}
              >
                Previous
              </Button>
              <span className="caption text-center">{current.caption}</span>
              <Button
                variant="secondary"
                size="sm"
                iconEnd="arrow-right"
                onClick={() => step(1)}
                disabled={items.length < 2}
              >
                Next
              </Button>
            </figcaption>
          </figure>
        )}
      </Dialog>
    </>
  )
}
