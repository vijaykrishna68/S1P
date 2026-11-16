interface SkeletonProps {
  /** Text lines under the (optional) media block. */
  lines?: number
  /** An image-shaped block on top. */
  media?: boolean
  className?: string
}

/**
 * A placeholder shaped like the content that is loading. It is decorative
 * (aria-hidden): the caller announces "loading" once from a role="status"
 * region. A gentle opacity pulse, not a shimmer; it is a pending-state
 * indicator, so it keeps pulsing under reduced motion (`motion-pending`).
 * It fades in after 300ms (`.skeleton-delayed`) so quick loads never flash it.
 * Never use it on the payment step: use the Button's busy state there.
 */
export function Skeleton({ lines = 0, media = false, className = '' }: SkeletonProps) {
  return (
    <div aria-hidden="true" className={`skeleton-delayed ${className}`}>
      <div className="skeleton-pulse motion-pending">
        {media && <div className="aspect-square rounded-chip bg-surface" />}
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`mt-3 h-3 rounded-ticket bg-surface ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
          />
        ))}
      </div>
    </div>
  )
}
