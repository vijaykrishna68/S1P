import type { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
}

/**
 * Shared max-width content wrapper. Keeps section content aligned to the
 * same horizontal rhythm (~1200px) across the page. See CLAUDE.md §5.
 */
export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[var(--layout-max)] px-4 md:px-8 ${className}`}>
      {children}
    </div>
  )
}
