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
