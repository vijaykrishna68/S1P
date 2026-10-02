interface DecorativeImageProps {
  src: string
  /** Intrinsic pixel size of the file, so the browser reserves the right box. */
  width: number
  height: number
  className: string
}

/**
 * Shared renderer for the raster Phase 4C illustrations. They are decorative:
 * the surrounding text carries all meaning, so the image is hidden from
 * assistive tech and has an empty alt (nothing to announce, no title/desc).
 */
export function DecorativeImage({ src, width, height, className }: DecorativeImageProps) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`select-none ${className}`}
    />
  )
}
