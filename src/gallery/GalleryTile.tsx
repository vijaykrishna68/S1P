import { useState } from 'react'
import type { GalleryImage } from './galleryApi'

interface GalleryTileProps {
  image: GalleryImage
  alt: string
  onOpen: (image: GalleryImage) => void
}

/**
 * One gallery thumbnail: a single button that opens the viewer.
 *
 * - The image fades in once it has loaded (opacity only, so a grid of lazy
 *   images doesn't make every tile jump). The tile reserves its space
 *   (aspect-square) so nothing shifts while images arrive. A broken image is
 *   shown as-is rather than left invisible.
 * - On hover-capable devices the image eases to 1.03x inside the tile's
 *   rounded clip, a quiet "this is interactive" cue; pressing the tile gives
 *   a tiny scale-down on any device. Both are removed under reduced motion.
 */
export function GalleryTile({ image, alt, onOpen }: GalleryTileProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <button
      type="button"
      onClick={() => onOpen(image)}
      className="group block aspect-square w-full overflow-hidden rounded-xl bg-cream-soft
        transition-transform duration-(--duration-fast) ease-state motion-safe:active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/40 focus-visible:ring-offset-2"
    >
      <img
        src={image.imageUrl}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-[opacity,scale] [transition-duration:var(--duration-base),var(--duration-medium)]
          ease-out-expo motion-safe:group-hover:scale-[1.03] ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </button>
  )
}
