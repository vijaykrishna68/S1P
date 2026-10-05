// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Footer } from '../layout/Footer'
import { AmountStep } from './steps/AmountStep'
import { SuccessStep } from './steps/SuccessStep'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('phone number placeholder guard', () => {
  async function loadConfig(phone?: string) {
    vi.resetModules()
    if (phone !== undefined) vi.stubEnv('VITE_PHONE_NUMBER', phone)
    return (await import('./config')).DONATION_CONFIG
  }

  it('is empty when unset', async () => {
    expect((await loadConfig('')).phoneNumber).toBe('')
  })

  it('treats the old all-zero placeholder as unset', async () => {
    expect((await loadConfig('+91 00000 00000')).phoneNumber).toBe('')
  })

  it('judges the number, not the country code, and ignores formatting', async () => {
    expect((await loadConfig('+91-00000-00000')).phoneNumber).toBe('')
    expect((await loadConfig('00000 00000')).phoneNumber).toBe('')
    expect((await loadConfig('+91 00000 00001')).phoneNumber).toBe('+91 00000 00001')
  })

  it('passes a usable number through', async () => {
    expect((await loadConfig('+91 98765 43210')).phoneNumber).toBe('+91 98765 43210')
  })
})

describe('amount step: ₹300 is encouraged, not a minimum', () => {
  function enter(value: string) {
    const onContinue = vi.fn()
    const utils = render(<AmountStep onContinue={onContinue} />)
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue to Payment' }))
    return { onContinue, ...utils }
  }

  it('presents ₹300 as the encouraged one-pizza amount, never as a minimum', () => {
    const { container } = render(<AmountStep onContinue={() => {}} />)
    const text = container.textContent ?? ''
    expect(text).toMatch(
      /₹300\s*—\s*about the value of one pizza\s*—\s*is what we encourage you to contribute/,
    )
    expect(text).toMatch(/smaller amount is just as welcome/)
    expect(text).not.toMatch(/minimum|at least ₹300|from ₹300/i)
  })

  it.each([50, 100, 200, 300, 500, 3000])('lets ₹%i proceed to payment', (amount) => {
    const { onContinue } = enter(String(amount))
    expect(onContinue).toHaveBeenCalledWith(amount)
  })

  it.each(['0', '-50', '-1', ''])('does not let "%s" proceed', (value) => {
    const { onContinue } = enter(value)
    expect(onContinue).not.toHaveBeenCalled()
  })

  it('shows no "minimum ₹300" wording when an amount below ₹300 is entered', () => {
    const { container } = enter('50')
    expect(container.textContent).not.toMatch(/between ₹300|minimum|at least/i)
  })

  it('rejects above the UPI ceiling', () => {
    const { onContinue } = enter('3001')
    expect(onContinue).not.toHaveBeenCalled()
  })
})

describe('amount step', () => {
  it('names its action honestly', () => {
    render(<AmountStep onContinue={() => {}} />)
    expect(
      screen.getByRole('button', { name: 'Continue to Payment' }),
    ).toBeInTheDocument()
  })

  it('never shows a placeholder phone above the limit; offers the contact email', () => {
    const { container } = render(<AmountStep onContinue={() => {}} />)
    const input = screen.getByLabelText('Amount')
    fireEvent.change(input, { target: { value: '3500' } })
    fireEvent.blur(input)

    expect(container.textContent).not.toMatch(/00000/)
    expect(container.querySelector('a[href^="tel:"]')).toBeNull()
    expect(container.querySelector('a[href^="mailto:"]')).not.toBeNull()
  })
})

describe('success state', () => {
  it('confirms receipt for review without claiming a verified donation', () => {
    const { container } = render(<SuccessStep onRestart={() => {}} />)
    const text = container.textContent ?? ''
    expect(text).toMatch(/received your payment details and screenshot/i)
    expect(text).toMatch(/team will review your submission/i)
    expect(text).not.toMatch(/recorded|verified|successfully/i)
  })
})

describe('footer', () => {
  it('makes no transparency-report promise', () => {
    const { container } = render(<Footer />)
    expect(container.textContent).not.toMatch(/transparency/i)
    expect(container.textContent).toMatch(/All donations are voluntary\./)
  })
})
