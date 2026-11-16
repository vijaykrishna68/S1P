import type { ReactNode } from 'react'
import { Icon } from '../ui/Icon'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  /** Written as a word beside the label, never an asterisk. */
  requirement?: 'Required' | 'Optional'
  children: ReactNode
}

/**
 * Control styling shared by every text input, textarea and select. 52px tall,
 * 17px text (prevents mobile zoom), a 2px strong border that goes ink on
 * hover/focus and a 3px error border when invalid.
 */
export const fieldControlClasses =
  'w-full min-h-13 rounded-input border-2 border-line-strong bg-elevated px-4 py-3 text-[17px] ' +
  'font-medium text-ink placeholder:text-ink-2/70 ' +
  'transition-colors duration-(--motion-duration-micro) ease-standard ' +
  'hover:border-line-ink focus:border-line-ink aria-[invalid=true]:border-[3px] aria-[invalid=true]:border-error'

/**
 * Shared label + hint + inline-error wrapper for the form's fields. The label is
 * always visible; "Required"/"Optional" sits beside it as a word (aria-hidden:
 * the control carries aria-required). The error, with its icon, is tied to the
 * input via aria-describedby (set by the caller on the control, since the
 * control lives in `children`) using the `${id}-error` id.
 */
export function FormField({
  id,
  label,
  error,
  hint,
  requirement,
  children,
}: FormFieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="block font-text text-base font-bold text-ink">
          {label}
        </label>
        {requirement && (
          <span aria-hidden="true" className="text-[13px] font-semibold text-ink-2">
            {requirement}
          </span>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[15px] text-ink-2">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-2 flex items-start gap-1.5 text-sm font-bold text-error"
        >
          <Icon name="alert-circle" size={16} className="mt-0.5" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
