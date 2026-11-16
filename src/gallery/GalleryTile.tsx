import { useState } from 'react'
import type { GalleryImage } from './galleryApi'

export type TileShape = 'normal' | 'feature' | 'tall'

interface GalleryTileProps {
  image: GalleryImage
  alt: string
  onOpen: (image: GalleryImage) => void
  /** `feature` spans 2×2 in the grid, `tall` is portrait from `md` up. */
  shape?: TileShape
}

function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

/**
 * One gallery tile: a button that opens the viewer (labelled "Open photo: …"),
 * with its caption and date underneath. Photos are documentary evidence, so
 * nothing is ever drawn over them.
 *
 * - The image fades in once it has loaded (opacity only, so a grid of lazy
 *   images doesn't make every tile jump). The tile reserves its space so nothing
 *   shifts while images arrive. A broken image is shown as-is rather than left
 *   invisible.
 * - On hover-capable devices the image eases to 1.03x inside the tile's
 *   rounded clip, a quiet "this is interactive" cue; pressing the tile gives
 *   a tiny scale-down on any device. Both are removed under reduced motion.
 */
export function GalleryTile({ image, alt, onOpen, shape = 'normal' }: GalleryTileProps) {
  const [loaded, setLoaded] = useState(false)
  const date = formatDate(image.createdAt)

  return (
    <figure className={`flex flex-col gap-2 ${shape === 'feature' ? 'col-span-2' : ''}`}>
      <button
        type="button"
        onClick={() => onOpen(image)}
        aria-label={`Open photo: ${alt}`}
        className={`group block w-full overflow-hidden rounded-chip bg-surface
          transition-transform duration-(--motion-duration-micro) ease-standard motion-safe:active:scale-[0.98]
          ${shape === 'tall' ? 'aspect-square md:aspect-[3/4]' : 'aspect-square'}`}
      >
        <img
          src={image.imageUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-[opacity,scale] [transition-duration:var(--motion-duration-standard),var(--motion-duration-emphasized)]
            ease-emphasized motion-safe:group-hover:scale-[1.03] ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </button>
      {(image.caption || date) && (
        <figcaption className="caption text-ink-2">
          {image.caption && <span className="block text-ink">{image.caption}</span>}
          {date && <time dateTime={image.createdAt}>{date}</time>}
        </figcaption>
      )}
    </figure>
  )
}
