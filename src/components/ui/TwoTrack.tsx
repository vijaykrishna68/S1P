import type { ReactNode } from 'react'

interface TwoTrackProps {
  /** Text column. Always first in DOM order, so it also comes first on mobile. */
  children: ReactNode
  /** Visual column (an IllustrationSlot or existing mark). Decorative. */
  aside: ReactNode
  className?: string
}

/**
 * Text on the left, a visual track opposite it at lg+; stacked (text first)
 * below lg. Exists because five sections (Mission, About hero, Trust, Gallery
 * hero, and the closing band) needed the same answer to "a max-w-2xl text
 * block leaves an unexplained empty right third" (audit P-2). The grid tracks
 * are fractional rather than fixed-width so changing the copy later doesn't
 * break the layout.
 */
export function TwoTrack({ children, aside, className = '' }: TwoTrackProps) {
  return (
    <div
      className={`grid items-center gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-16 ${className}`}
    >
      <div className="max-w-2xl">{children}</div>
      <div aria-hidden="true" className="flex justify-center lg:justify-end">
        {aside}
      </div>
    </div>
  )
}
