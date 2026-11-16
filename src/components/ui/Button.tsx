import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

type Variant = 'primary' | 'secondary' | 'tertiary' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

interface SharedProps {
  /** Verb-first, sentence-style label. Omit only for an icon-only button (then `label` is required). */
  children?: ReactNode
  className?: string
  variant?: Variant
  /** sm 40px (nav bar, admin toolbars) · md 48px · lg 56px (hero, final submit). */
  size?: Size
  icon?: IconName
  iconEnd?: IconName
  /** A submission is in flight: shows the pending spinner, sets aria-busy, and disables the button. Width is held. */
  busy?: boolean
  /** Shows the basil success state (check + `successText`). */
  success?: boolean
  successText?: ReactNode
  fullWidth?: boolean
  /** Accessible name; required when the button has an icon and no children. */
  label?: string
}

type ButtonAsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    href?: undefined
  }

type ButtonAsAnchor = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
    href: string
  }

type ButtonProps = ButtonAsButton | ButtonAsAnchor

const SIZE: Record<Size, string> = {
  sm: 'min-h-10 px-5 text-[15px]',
  md: 'min-h-12 px-7 text-base',
  lg: 'min-h-14 px-9 text-lg',
}

// Icon-only buttons are square, with the 44px minimum touch target.
const ICON_ONLY_SIZE: Record<Size, string> = {
  sm: 'size-11 p-0',
  md: 'size-12 p-0',
  lg: 'size-14 p-0',
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-action text-ink-on-primary border-transparent active:bg-action-pressed',
  secondary:
    'bg-elevated text-ink border-line-ink active:bg-action-2-hover hover:bg-elevated',
  tertiary:
    'bg-transparent text-ink border-transparent hover:underline hover:underline-offset-4 hover:decoration-highlight hover:decoration-2',
  destructive: 'bg-error text-ink-on-primary border-transparent active:bg-error',
}

// Lifecycle (docs/components.md): hover lifts 2px up-left and grows an offset
// shadow with an ink border (tertiary has no lift); pressed sinks 1px and drops
// the shadow in --motion-duration-instant; loading and success keep the width.
// translate is a separate CSS property in Tailwind v4, so it is listed
// explicitly in the transition.
const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-full border-2 font-text font-bold ' +
  'transition-[translate,box-shadow,background-color,border-color,color] ' +
  'duration-(--motion-duration-micro) ease-standard ' +
  'active:duration-(--motion-duration-instant) ' +
  'disabled:pointer-events-none disabled:border-transparent disabled:bg-action-off disabled:text-ink-2 ' +
  'aria-disabled:pointer-events-none'

const liftClasses =
  'hover:border-line-ink hover:shadow-offset-sm motion-safe:hover:-translate-x-0.5 motion-safe:hover:-translate-y-0.5 ' +
  'active:shadow-none motion-safe:active:translate-x-0 motion-safe:active:translate-y-px'

/**
 * The tactile pill that carries every action. `primary` (tomato) is the single
 * contribution action in a view; `destructive` is admin-only and always sits
 * behind a confirmation Dialog. Renders an anchor when `href` is passed,
 * otherwise a native button. `busy` (buttons only) shows the pending spinner,
 * sets aria-busy and disables the button.
 */
export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  icon,
  iconEnd,
  busy = false,
  success = false,
  successText,
  fullWidth = false,
  label,
  ...props
}: ButtonProps) {
  const iconOnly = children == null && icon != null
  const classes = [
    baseClasses,
    iconOnly ? ICON_ONLY_SIZE[size] : SIZE[size],
    success && variant !== 'destructive'
      ? 'bg-success text-ink-on-primary border-transparent'
      : VARIANT[variant],
    variant === 'tertiary' ? '' : liftClasses,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {busy ? (
        // Pending-state indicator: keeps spinning (slowly) under reduced motion.
        <Icon name="spinner" size={20} className="motion-pending animate-spin" />
      ) : success ? (
        <Icon name="check" size={20} />
      ) : icon ? (
        <Icon name={icon} size={20} />
      ) : null}
      {success && successText != null ? successText : children}
      {iconEnd && !busy && !success && <Icon name={iconEnd} size={20} />}
    </>
  )

  if ('href' in props && props.href !== undefined) {
    const { href, ...anchorProps } = props
    return (
      <a
        href={href}
        className={classes}
        aria-label={iconOnly ? label : undefined}
        {...anchorProps}
      >
        {content}
      </a>
    )
  }

  const { type = 'button', disabled, ...buttonProps } = props as ButtonAsButton
  return (
    <button
      type={type}
      className={classes}
      disabled={busy || disabled}
      aria-busy={busy || undefined}
      aria-label={iconOnly ? label : undefined}
      {...buttonProps}
    >
      {content}
    </button>
  )
}
