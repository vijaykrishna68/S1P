import type { ReactNode } from 'react'

interface IllustrationSlotProps {
  /** Stable id for the slot (also used by tests and review tooling). */
  name: string
  /** The artwork. Sizes itself; the slot only places it. */
  children: ReactNode
  className?: string
}

/**
 * Places a piece of illustration in a TwoTrack visual track. Final artwork is
 * unframed (Phase 4C decision C2): the art's own offset blocks provide any
 * containment, so there is no tinted plate. Hidden below md so a stacked mobile
 * page doesn't gain a large graphic per slot. Decorative and aria-hidden.
 */
export function IllustrationSlot({
  name,
  children,
  className = '',
}: IllustrationSlotProps) {
  return (
    <div
      data-illustration-slot={name}
      aria-hidden="true"
      className={`hidden md:flex items-center justify-center ${className}`}
    >
      {children}
    </div>
  )
}
