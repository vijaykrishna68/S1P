import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { CircleNotch } from '@phosphor-icons/react'

interface SharedProps {
  children: ReactNode
  className?: string
  /** A submission is in flight: shows the pending spinner, sets aria-busy, and disables the button. */
  busy?: boolean
}

type ButtonAsButton = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type ButtonAsAnchor = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

type ButtonProps = ButtonAsButton | ButtonAsAnchor

// Resting AND hover fill is --color-red-deep, not the brand --color-red swatch —
// white text on --color-red measures 4.17:1, under the 4.5:1 WCAG AA minimum
// for normal-size text (found via a Lighthouse audit, confirmed by computing
// relative luminance, not eyeballed). --color-red-deep reaches 5.38:1.
// Phase 4A: hover no longer shifts to the dark maroon --color-red-darkest; it
// keeps the same fill, the existing 2px lift, and a red-hued shadow. The
// darker shade is reserved for the momentary pressed (:active) state. See
// Docs/PHASE4A_VISUAL_SYSTEM_AUDIT.md §4.1 (D3).
const baseClasses =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-deep px-7 py-3 ' +
  'font-display text-[15px] font-semibold text-white ' +
  // translate/scale are separate CSS properties in Tailwind v4, so they are listed explicitly.
  'transition-[translate,scale,box-shadow,background-color] duration-(--duration-base) ease-state ' +
  'motion-safe:hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(201,44,58,0.5)] ' +
  'active:duration-(--duration-fast) motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] ' +
  'active:bg-red-darkest disabled:pointer-events-none disabled:opacity-60'

/**
 * Primary CTA. Renders as an anchor when `href` is passed, otherwise a
 * native button. One visual treatment used everywhere "Donate One Pizza"
 * appears, so hover/press/focus feedback stays consistent site-wide. `busy`
 * (buttons only) shows the pending spinner and disables the button.
 */
export function Button({
  children,
  className = '',
  busy = false,
  ...props
}: ButtonProps) {
  if ('href' in props && props.href !== undefined) {
    const { href, ...anchorProps } = props
    return (
      <a href={href} className={`${baseClasses} ${className}`} {...anchorProps}>
        {children}
      </a>
    )
  }

  const { type = 'button', disabled, ...buttonProps } = props as ButtonAsButton
  return (
    <button
      type={type}
      className={`${baseClasses} ${className}`}
      disabled={busy || disabled}
      aria-busy={busy || undefined}
      {...buttonProps}
    >
      {busy && (
        // Pending-state indicator: keeps spinning under reduced motion (CLAUDE.md §3).
        <CircleNotch
          size={16}
          className="motion-pending animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
