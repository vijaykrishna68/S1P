import { useReducer } from 'react'
import { Container } from '../ui/Container'
import { donationReducer, initialDonationState } from './donationReducer'
import { AmountStep } from './steps/AmountStep'
import { PaymentStep } from './steps/PaymentStep'
import { ConfirmationStep } from './steps/ConfirmationStep'
import { SuccessStep } from './steps/SuccessStep'

/**
 * Owns the donation flow's step state (amount → payment → confirmation →
 * success). Each step is a separate component; this section only decides
 * which one to render and how they hand off to each other. See
 * donationReducer.ts and CLAUDE.md's donation-architecture note.
 */
export function DonationSection() {
  const [state, dispatch] = useReducer(donationReducer, initialDonationState)

  return (
    <section id="donate" className="py-20 md:py-28 lg:py-32">
      <Container>
        <div className="mx-auto max-w-xl">
          {/* Keying by step remounts this wrapper on every transition, which
              is what replays the step-enter animation — see index.css. */}
          <div key={state.step} className="step-enter">
            {state.step === 'amount' && (
              <AmountStep
                onContinue={(amount) => dispatch({ type: 'AMOUNT_CONFIRMED', amount })}
              />
            )}
            {state.step === 'payment' && state.amount !== null && (
              <PaymentStep
                amount={state.amount}
                onPaid={() => dispatch({ type: 'PAYMENT_CONFIRMED' })}
              />
            )}
            {state.step === 'confirmation' && state.amount !== null && (
              <ConfirmationStep
                initialAmount={state.amount}
                onSuccess={() => dispatch({ type: 'SUBMISSION_SUCCEEDED' })}
              />
            )}
            {state.step === 'success' && (
              <SuccessStep onRestart={() => dispatch({ type: 'RESTART' })} />
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
