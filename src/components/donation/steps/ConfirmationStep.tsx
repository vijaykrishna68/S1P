import { useReducer, useRef, type FormEvent } from 'react'
import { CircleNotch } from '@phosphor-icons/react'
import { Button } from '../../ui/Button'
import { useAutoFocus } from '../../ui/useAutoFocus'
import { FormField } from '../FormField'
import { ScreenshotUploader } from '../ScreenshotUploader'
import { useScreenshotUpload } from '../useScreenshotUpload'
import { submitDonation } from '../donationService'
import {
  createInitialFormState,
  formReducer,
  validateConfirmationForm,
} from '../confirmationFormReducer'

interface ConfirmationStepProps {
  initialAmount: number
  onSuccess: () => void
}

const inputClasses =
  'w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-charcoal ' +
  'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-red/40 focus:border-charcoal/30 aria-[invalid=true]:border-red/60'

// Priority order for moving focus to the first invalid field after a failed
// submit attempt — screen reader and keyboard users get taken straight to
// what needs fixing instead of having to hunt for it. See CLAUDE.md's
// accessibility-audit note.
const FIELD_FOCUS_ORDER = ['fullName', 'address', 'amountPaid', 'screenshot'] as const

/**
 * Payment done? Tell us who to thank. Never implies automatic verification
 * of the UPI transaction — the screenshot is the donor's proof of payment.
 */
export function ConfirmationStep({ initialAmount, onSuccess }: ConfirmationStepProps) {
  const headingRef = useAutoFocus<HTMLHeadingElement>()
  const [form, dispatch] = useReducer(formReducer, initialAmount, createInitialFormState)
  const upload = useScreenshotUpload()
  // One key per submission attempt, not per HTTP request — reused across
  // retries so the server can treat a resubmit as a no-op. See
  // donationService.ts's DonationSubmission.idempotencyKey.
  const idempotencyKeyRef = useRef<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (form.submission === 'submitting') return // no duplicate submissions

    const errors = validateConfirmationForm(form.values, upload.state)
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'VALIDATION_FAILED', errors })
      const firstInvalidField = FIELD_FOCUS_ORDER.find((field) => errors[field])
      const focusId =
        firstInvalidField === 'screenshot' ? 'payment-screenshot' : firstInvalidField
      if (focusId) document.getElementById(focusId)?.focus()
      return
    }
    if (upload.state.status !== 'uploaded') return // guaranteed by validation above

    idempotencyKeyRef.current ??= crypto.randomUUID()

    dispatch({ type: 'SUBMIT_STARTED' })
    try {
      await submitDonation({
        fullName: form.values.fullName.trim(),
        address: form.values.address.trim(),
        amountPaid: Number(form.values.amountPaid),
        screenshot: upload.state.file,
        idempotencyKey: idempotencyKeyRef.current,
      })
      onSuccess()
    } catch (err) {
      dispatch({
        type: 'SUBMIT_FAILED',
        message:
          err instanceof Error
            ? err.message
            : "We couldn't submit your confirmation. Please try again.",
      })
    }
  }

  const isSubmitting = form.submission === 'submitting'

  return (
    <div>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl"
      >
        Payment done? Tell us who to thank.
      </h2>

      <form onSubmit={handleSubmit} noValidate className="mt-8 max-w-md space-y-6">
        <FormField id="fullName" label="Full Name" error={form.errors.fullName}>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={form.values.fullName}
            onChange={(e) =>
              dispatch({
                type: 'FIELD_CHANGED',
                field: 'fullName',
                value: e.target.value,
              })
            }
            aria-required="true"
            aria-invalid={Boolean(form.errors.fullName)}
            aria-describedby={form.errors.fullName ? 'fullName-error' : undefined}
            placeholder="Your name"
            className={inputClasses}
          />
        </FormField>

        <FormField id="address" label="Address" error={form.errors.address}>
          <textarea
            id="address"
            rows={3}
            autoComplete="street-address"
            value={form.values.address}
            onChange={(e) =>
              dispatch({ type: 'FIELD_CHANGED', field: 'address', value: e.target.value })
            }
            aria-required="true"
            aria-invalid={Boolean(form.errors.address)}
            aria-describedby={form.errors.address ? 'address-error' : undefined}
            placeholder="Your address"
            className={`${inputClasses} resize-none`}
          />
        </FormField>

        <FormField id="amountPaid" label="Amount Paid" error={form.errors.amountPaid}>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-muted"
            >
              ₹
            </span>
            <input
              id="amountPaid"
              type="number"
              inputMode="numeric"
              value={form.values.amountPaid}
              onChange={(e) =>
                dispatch({
                  type: 'FIELD_CHANGED',
                  field: 'amountPaid',
                  value: e.target.value,
                })
              }
              aria-required="true"
              aria-invalid={Boolean(form.errors.amountPaid)}
              aria-describedby={form.errors.amountPaid ? 'amountPaid-error' : undefined}
              className={`${inputClasses} pl-9`}
            />
          </div>
        </FormField>

        <FormField id="payment-screenshot" label="Payment Screenshot" error={undefined}>
          <ScreenshotUploader
            state={upload.state}
            onSelectFile={upload.selectFile}
            onRemoveFile={upload.removeFile}
            formError={form.errors.screenshot}
          />
        </FormField>

        {form.submission === 'error' && (
          <p role="alert" className="text-sm text-red-deep">
            {form.submissionMessage}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <CircleNotch size={16} className="animate-spin" />
              Submitting…
            </>
          ) : (
            'Confirm Donation'
          )}
        </Button>
      </form>
    </div>
  )
}
