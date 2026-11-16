import { useId, useState, type FormEvent } from 'react'
import { Button } from '../../ui/Button'
import { useAutoFocus } from '../../ui/useAutoFocus'
import { DONATION_CONFIG } from '../config'
import { fieldControlClasses } from '../FormField'

interface AmountStepProps {
  onContinue: (amount: number) => void
}

export function AmountStep({ onContinue }: AmountStepProps) {
  const headingRef = useAutoFocus<HTMLHeadingElement>()
  const [rawValue, setRawValue] = useState('')
  const [touched, setTouched] = useState(false)
  const inputId = useId()
  const errorId = useId()

  const amount = Number(rawValue)
  const isEmpty = rawValue.trim() === ''
  const isTooLow = !isEmpty && amount < DONATION_CONFIG.minAmount
  const isTooHigh = !isEmpty && amount > DONATION_CONFIG.maxAmount
  const isValid = !isEmpty && !isTooLow && !isTooHigh && Number.isFinite(amount)

  const handleContinue = (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (isValid) onContinue(Math.round(amount))
  }

  return (
    <div>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="heading-1"
      >
        Donate One Pizza
      </h2>
      <p className="body-lg mt-4 max-w-[52ch] text-ink-2">
        Give what you would normally spend on a pizza. Every contribution becomes part of
        something bigger.
      </p>
      <p className="body-lg mt-3 max-w-[52ch]">
        ₹{DONATION_CONFIG.suggestedAmount} &mdash; about the value of one pizza &mdash; is
        what we encourage you to contribute. Any smaller amount is just as welcome.
      </p>

      <form onSubmit={handleContinue} className="mt-10 max-w-sm">
        <label
          htmlFor={inputId}
          className="block font-text text-base font-bold text-ink"
        >
          Amount
        </label>
        <div className="relative mt-2">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-lg text-ink-2"
          >
            ₹
          </span>
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            min={DONATION_CONFIG.minAmount}
            max={DONATION_CONFIG.maxAmount}
            value={rawValue}
            onChange={(event) => setRawValue(event.target.value)}
            onBlur={() => setTouched(true)}
            aria-describedby={errorId}
            aria-invalid={touched && (isTooLow || isTooHigh)}
            placeholder={String(DONATION_CONFIG.suggestedAmount)}
            className={`${fieldControlClasses} pl-9 font-display`}
          />
        </div>

        <p id={errorId} className="mt-2 min-h-5 text-sm">
          {touched && isTooLow && (
            <span className="font-bold text-error">
              Please enter an amount between ₹{DONATION_CONFIG.minAmount} and ₹
              {DONATION_CONFIG.maxAmount}.
            </span>
          )}
          {touched && isTooHigh && (
            <span className="font-bold text-error">
              {DONATION_CONFIG.phoneNumber ? (
                <>
                  For donations above ₹{DONATION_CONFIG.maxAmount}, please give us a call
                  at{' '}
                  <a href={`tel:${DONATION_CONFIG.phoneNumber}`} className="underline decoration-2 underline-offset-2">
                    {DONATION_CONFIG.phoneNumber}
                  </a>
                  .
                </>
              ) : (
                <>
                  For donations above ₹{DONATION_CONFIG.maxAmount}, please get in touch
                  with us at{' '}
                  <a
                    href={`mailto:${DONATION_CONFIG.contactEmail}`}
                    className="underline decoration-2 underline-offset-2"
                  >
                    {DONATION_CONFIG.contactEmail}
                  </a>
                  .
                </>
              )}
            </span>
          )}
          {!(touched && (isTooLow || isTooHigh)) && (
            <span className="text-ink-2">
              Enter any amount up to ₹{DONATION_CONFIG.maxAmount}.
            </span>
          )}
        </p>

        <Button type="submit" size="lg" fullWidth className="mt-4">
          Continue to Payment
        </Button>
      </form>
    </div>
  )
}
