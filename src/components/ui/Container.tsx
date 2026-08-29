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
    <div className={`mx-auto w-full max-w-[1200px] px-6 md:px-10 ${className}`}>
      {children}
    </div>
  )
}
