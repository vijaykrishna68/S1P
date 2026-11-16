import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info' | 'placeholder'

interface BadgeProps {
  children: ReactNode
  tone?: Tone
  /** Status tones should always carry an icon as well as colour. */
  icon?: IconName
  className?: string
}

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface text-ink border-line',
  brand: 'bg-error-soft text-ink border-line-ink',
  success: 'bg-success-soft text-ink border-success',
  warning: 'bg-warning-soft text-ink border-warning',
  error: 'bg-error-soft text-ink border-error',
  info: 'bg-info-soft text-ink border-info',
  // Dashed: marks content that is waiting for a verified fact. Never ships.
  placeholder: 'bg-transparent text-ink-2 border-dashed border-line-strong',
}

/**
 * A small ticket-shaped label for one or two words of status or category.
 * Not a button: badges are never clickable.
 */
export function Badge({ children, tone = 'neutral', icon, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-ticket border-[1.5px] px-2 py-0.5 font-text text-[13px] font-bold leading-snug ${TONES[tone]} ${className}`}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </span>
  )
}
