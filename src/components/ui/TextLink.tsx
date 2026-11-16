import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode
}

/**
 * Secondary text-link action (e.g. "See How It Helps"). Underline is gold and
 * thickens on hover; the arrow nudges right. Movement stays small and the label
 * never changes: feedback, not decoration.
 */
export function TextLink({ children, className = '', ...props }: TextLinkProps) {
  return (
    <a
      className={`group inline-flex min-h-11 items-center gap-1.5 font-text text-base font-bold
        text-ink underline decoration-highlight decoration-2 underline-offset-4
        transition-colors duration-(--motion-duration-micro) ease-standard
        hover:text-ink-brand hover:decoration-4 ${className}`}
      {...props}
    >
      {children}
      <Icon
        name="arrow-right"
        size={20}
        className="transition-transform duration-(--motion-duration-standard) ease-standard motion-safe:group-hover:translate-x-1"
      />
    </a>
  )
}
