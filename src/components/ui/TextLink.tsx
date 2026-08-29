import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { ArrowRight } from '@phosphor-icons/react'

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode
}

/**
 * Secondary text-link CTA (e.g. "See How It Helps"). The arrow nudges right
 * on hover; movement stays small and the label never changes, per
 * CLAUDE.md's motion philosophy (feedback, not decoration).
 */
export function TextLink({ children, className = '', ...props }: TextLinkProps) {
  return (
    <a
      className={`group inline-flex min-h-11 items-center gap-1.5 font-display text-[15px]
        font-semibold text-charcoal transition-colors duration-200 hover:text-red ${className}`}
      {...props}
    >
      {children}
      <ArrowRight
        size={17}
        weight="bold"
        className="transition-transform duration-200 ease-out group-hover:translate-x-1"
      />
    </a>
  )
}
