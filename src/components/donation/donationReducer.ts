import type { DonationStep } from './types'

export interface DonationState {
  step: DonationStep
  amount: number | null
}

export type DonationAction =
  | { type: 'AMOUNT_CONFIRMED'; amount: number }
  | { type: 'PAYMENT_CONFIRMED' }
  | { type: 'SUBMISSION_SUCCEEDED' }
  | { type: 'RESTART' }

export const initialDonationState: DonationState = { step: 'amount', amount: null }

/**
 * The donation flow's own step machine — separate from the confirmation
 * form's field/submission state (confirmationFormReducer.ts), because they
 * change for different reasons and at different times. See CLAUDE.md's
 * donation-architecture note for why this stayed as two small reducers
 * instead of one large one.
 */
export function donationReducer(
  state: DonationState,
  action: DonationAction,
): DonationState {
  switch (action.type) {
    case 'AMOUNT_CONFIRMED':
      return { step: 'payment', amount: action.amount }
    case 'PAYMENT_CONFIRMED':
      return { ...state, step: 'confirmation' }
    case 'SUBMISSION_SUCCEEDED':
      return { ...state, step: 'success' }
    case 'RESTART':
      return initialDonationState
    default:
      return state
  }
}
