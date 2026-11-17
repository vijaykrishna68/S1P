import { useReducer } from 'react'
import { Container } from '../ui/Container'
import { Illustration } from '../ui/Illustration'
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
    <section id="donate" className="pt-8 pb-16 md:pt-12 md:pb-24">
      <Container>
        <div className="mx-auto grid max-w-xl items-center gap-12 lg:max-w-none lg:grid-cols-12">
          {/* The side scene is dropped below lg: on a phone the controls lead. */}
          <div className="hidden lg:col-span-5 lg:block">
            <Illustration name="impact-many-hands" />
          </div>

          {/* Panel framing at lg+ only: a bounded task area. Below lg the column is unframed. */}
          <div className="lg:col-span-7 lg:rounded-slab lg:border-2 lg:border-line lg:bg-elevated lg:px-12 lg:py-12">
            <div className="mx-auto max-w-xl lg:max-w-none">
              {/* Keying by step remounts this wrapper on every transition, which
              is what replays the step-enter animation — see index.css. */}
              <div key={state.step} className="step-enter">
                {state.step === 'amount' && (
                  <AmountStep
                    onContinue={(amount) =>
                      dispatch({ type: 'AMOUNT_CONFIRMED', amount })
                    }
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
          </div>
        </div>
      </Container>
    </section>
  )
}
