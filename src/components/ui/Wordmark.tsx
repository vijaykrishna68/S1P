interface WordmarkProps {
  href?: string
  /** Cream name on dark grounds (the pill stays tomato). */
  inverse?: boolean
  className?: string
}

/**
 * Type-only stand-in for the S1P logo: "S1P" in Sora 800 on a tomato pill plus
 * "Sacrifice One Pizza" in Sora 700. Replace with the real logo asset when one
 * is supplied (docs/brand-book.md); do not redraw or approximate it.
 */
export function Wordmark({ href = '/', inverse = false, className = '' }: WordmarkProps) {
  const inner = (
    <>
      <span
        aria-hidden="true"
        className="rounded-full bg-brand-pill px-3 py-1 font-display text-sm font-extrabold leading-none tracking-tight text-white"
      >
        S1P
      </span>
      <span
        className={`font-display text-base font-bold tracking-tight ${
          inverse ? 'text-ink-inverse' : 'text-ink'
        }`}
      >
        Sacrifice One Pizza
      </span>
    </>
  )
  const classes = `inline-flex min-h-11 items-center gap-2.5 ${className}`
  return href ? (
    <a href={href} className={classes}>
      {inner}
    </a>
  ) : (
    <span className={classes}>{inner}</span>
  )
}
