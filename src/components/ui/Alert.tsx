import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

type Tone = 'success' | 'warning' | 'error' | 'info'

interface AlertProps {
  tone?: Tone
  /** The outcome in one sentence. */
  title?: ReactNode
  /** What it means / what to do. */
  children?: ReactNode
  /** A Button (usually secondary) for the recovery step, e.g. "Try again". */
  action?: ReactNode
  /** For non-critical messages only. */
  onDismiss?: () => void
  className?: string
  id?: string
  /** Lets a caller move focus here after a failure. */
  tabIndex?: number
}

const TONES: Record<Tone, { icon: IconName; box: string; icon_: string }> = {
  success: {
    icon: 'check-circle',
    box: 'bg-success-soft border-success',
    icon_: 'text-success',
  },
  warning: {
    icon: 'alert-triangle',
    box: 'bg-warning-soft border-warning',
    icon_: 'text-warning',
  },
  error: { icon: 'alert-circle', box: 'bg-error-soft border-error', icon_: 'text-error' },
  info: { icon: 'info', box: 'bg-info-soft border-info', icon_: 'text-info' },
}

/**
 * An inline message with icon, title, optional body and action. Every tone is
 * identified by its icon and words, never colour alone. Errors use
 * role="alert" (announced immediately); the rest use role="status".
 */
export function Alert({
  tone = 'info',
  title,
  children,
  action,
  onDismiss,
  className = '',
  id,
  tabIndex,
}: AlertProps) {
  const t = TONES[tone]
  return (
    <div
      id={id}
      tabIndex={tabIndex}
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-card border-2 p-4 text-ink ${t.box} ${className}`}
    >
      <Icon name={t.icon} size={24} className={`mt-0.5 ${t.icon_}`} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-text text-base font-bold">{title}</p>}
        {children && (
          <div className={`text-[15px] leading-snug ${title ? 'mt-1' : ''}`}>
            {children}
          </div>
        )}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-m-2 flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
        >
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  )
}
