import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

interface SharedProps {
  children: ReactNode
  className?: string
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

// Resting fill is --color-red-deep, not the brand --color-red swatch —
// white text on --color-red measures 4.17:1, under the 4.5:1 WCAG AA
// minimum for normal-size text (found via a Lighthouse audit, confirmed by
// computing relative luminance, not eyeballed). --color-red-deep reaches
// 5.38:1; the darker hover/active shade below is only reachable via
// --color-red-darkest, one step further. See CLAUDE.md's Decision Log.
const baseClasses =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-deep px-7 py-3 ' +
  'font-display text-[15px] font-semibold text-white transition-[transform,background-color,box-shadow] ' +
  'duration-200 ease-out hover:-translate-y-0.5 hover:bg-red-darkest hover:shadow-[0_10px_24px_-8px_rgba(159,35,46,0.55)] ' +
  'active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60'

/**
 * Primary CTA. Renders as an anchor when `href` is passed, otherwise a
 * native button. One visual treatment used everywhere "Donate One Pizza"
 * appears, so hover/press/focus feedback stays consistent site-wide.
 */
export function Button({ children, className = '', ...props }: ButtonProps) {
  if ('href' in props && props.href !== undefined) {
    const { href, ...anchorProps } = props
    return (
      <a href={href} className={`${baseClasses} ${className}`} {...anchorProps}>
        {children}
      </a>
    )
  }

  const { type = 'button', ...buttonProps } = props as ButtonAsButton
  return (
    <button type={type} className={`${baseClasses} ${className}`} {...buttonProps}>
      {children}
    </button>
  )
}
