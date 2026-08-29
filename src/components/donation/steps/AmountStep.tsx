import { useId, useState, type FormEvent } from 'react'
import { Button } from '../../ui/Button'
import { useAutoFocus } from '../../ui/useAutoFocus'
import { DONATION_CONFIG } from '../config'

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
        className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl"
      >
        Donate One Pizza
      </h2>
      <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-charcoal-muted md:text-lg">
        Give what you would normally spend on a pizza. Every contribution becomes part of
        something bigger.
      </p>

      <form onSubmit={handleContinue} className="mt-10 max-w-sm">
        <label
          htmlFor={inputId}
          className="block font-display text-sm font-semibold text-charcoal"
        >
          Amount
        </label>
        <div className="relative mt-2">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-lg text-charcoal-muted"
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
            placeholder="500"
            className={`w-full rounded-xl border bg-white py-3 pl-9 pr-4 font-display text-lg text-charcoal
              transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-red/40 ${
                touched && (isTooLow || isTooHigh)
                  ? 'border-red/60'
                  : 'border-charcoal/15 focus:border-charcoal/30'
              }`}
          />
        </div>

        <p id={errorId} className="mt-2 min-h-5 text-sm">
          {touched && isTooLow && (
            <span className="text-red-deep">
              Please enter an amount between ₹{DONATION_CONFIG.minAmount} and ₹
              {DONATION_CONFIG.maxAmount}.
            </span>
          )}
          {touched && isTooHigh && (
            <span className="text-red-deep">
              For donations above ₹{DONATION_CONFIG.maxAmount}, please give us a call at{' '}
              <a href={`tel:${DONATION_CONFIG.phoneNumber}`} className="underline">
                {DONATION_CONFIG.phoneNumber}
              </a>
              .
            </span>
          )}
          {!(touched && (isTooLow || isTooHigh)) && (
            <span className="text-charcoal-muted">
              Enter any amount from ₹{DONATION_CONFIG.minAmount} to ₹
              {DONATION_CONFIG.maxAmount}.
            </span>
          )}
        </p>

        <Button type="submit" className="mt-4 w-full">
          Donate One Pizza
        </Button>
      </form>
    </div>
  )
}
