import { describe, expect, it } from 'vitest'
import { donationReducer, initialDonationState } from './donationReducer'

describe('donationReducer', () => {
  it('AMOUNT_CONFIRMED moves to payment and records the amount', () => {
    const next = donationReducer(initialDonationState, {
      type: 'AMOUNT_CONFIRMED',
      amount: 500,
    })
    expect(next).toEqual({ step: 'payment', amount: 500 })
  })

  it('PAYMENT_CONFIRMED moves to confirmation, keeping the amount', () => {
    const afterAmount = donationReducer(initialDonationState, {
      type: 'AMOUNT_CONFIRMED',
      amount: 700,
    })
    const next = donationReducer(afterAmount, { type: 'PAYMENT_CONFIRMED' })
    expect(next).toEqual({ step: 'confirmation', amount: 700 })
  })

  it('SUBMISSION_SUCCEEDED moves to success, keeping the amount', () => {
    const state = { step: 'confirmation' as const, amount: 1000 }
    const next = donationReducer(state, { type: 'SUBMISSION_SUCCEEDED' })
    expect(next).toEqual({ step: 'success', amount: 1000 })
  })

  it('RESTART resets to the initial state regardless of current state', () => {
    const state = { step: 'success' as const, amount: 1000 }
    const next = donationReducer(state, { type: 'RESTART' })
    expect(next).toEqual(initialDonationState)
  })
})
