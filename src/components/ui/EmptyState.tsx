import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  body?: string
  /** One Button for the next step. */
  action?: ReactNode
  /** A decorative scene (an <Illustration decorative />), the words carry the meaning. */
  illustration?: ReactNode
  /** Stacked and centred: for narrow admin panels. */
  compact?: boolean
  className?: string
}

/**
 * An explanation and one next step for an empty list or a recoverable error.
 * Say why it is empty and what happens next; never blame the visitor.
 */
export function EmptyState({
  title,
  body,
  action,
  illustration,
  compact = false,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`mx-auto flex flex-col items-center gap-4 text-center ${
        compact ? 'max-w-xs py-8' : 'max-w-xl py-14'
      } ${className}`}
    >
      {illustration && <div aria-hidden="true">{illustration}</div>}
      <h3 className="heading-3">{title}</h3>
      {body && <p className="body max-w-[40ch] text-ink-2">{body}</p>}
      {action}
    </div>
  )
}
