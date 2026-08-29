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

const baseClasses =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red px-7 py-3 ' +
  'font-display text-[15px] font-semibold text-white transition-[transform,background-color,box-shadow] ' +
  'duration-200 ease-out hover:-translate-y-0.5 hover:bg-red-deep hover:shadow-[0_10px_24px_-8px_rgba(230,57,70,0.55)] ' +
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
