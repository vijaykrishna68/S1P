import type { ReactNode } from 'react'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  children: ReactNode
}

/** Shared label + inline-error wrapper for the confirmation form's text
 * fields. Error text is tied to the input via aria-describedby (passed
 * separately by the caller, since the input itself lives in `children`). */
export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-display text-sm font-semibold text-charcoal"
      >
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-deep">
          {error}
        </p>
      )}
    </div>
  )
}
