import type { ReactNode } from 'react'
import { EchoMark } from '../mission/EchoMark'

interface IllustrationSlotProps {
  /** Stable id Phase 4C uses to find and fill this slot. */
  name: string
  /** Surface the slot sits on: a soft panel on cream, a cream panel on cream-soft/tinted bands. */
  on?: 'cream' | 'soft' | 'yellow'
  /** Replace the default content once real artwork exists (Phase 4C). */
  children?: ReactNode
  className?: string
}

const PANEL: Record<NonNullable<IllustrationSlotProps['on']>, string> = {
  cream: 'bg-cream-soft',
  soft: 'bg-cream',
  yellow: 'bg-yellow-tint',
}

/**
 * A reserved, framed area for illustration. No artwork is created in Phase 4A
 * (CLAUDE.md / audit §11): until 4C fills it, the slot holds the site's
 * existing EchoMark at low emphasis, inside the same rounded tinted panel the
 * Gallery's empty state already used, so it reads as a deliberate plate and
 * not as missing content. Hidden below md so a stacked mobile page doesn't gain a
 * large framed box per slot. Decorative and aria-hidden.
 */
export function IllustrationSlot({
  name,
  on = 'cream',
  children,
  className = '',
}: IllustrationSlotProps) {
  return (
    <div
      data-illustration-slot={name}
      aria-hidden="true"
      className={`hidden md:flex aspect-[4/3] w-full max-w-sm items-center justify-center rounded-2xl ${PANEL[on]} ${className}`}
    >
      {children ?? <EchoMark className="h-24 w-24 md:h-28 md:w-28" />}
    </div>
  )
}
