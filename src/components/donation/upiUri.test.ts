import { describe, expect, it } from 'vitest'
import { DONATION_CONFIG } from './config'
import { buildUpiUri } from './upiUri'

describe('buildUpiUri', () => {
  const uri = buildUpiUri(500)
  const params = new URL(uri.replace('upi://pay', 'https://upi.invalid/pay')).searchParams

  it('carries the trust payee details and the donor amount', () => {
    expect(uri.startsWith('upi://pay?')).toBe(true)
    expect(params.get('pa')).toBe(DONATION_CONFIG.upiId)
    expect(params.get('pn')).toBe(DONATION_CONFIG.payeeName)
    expect(params.get('tr')).toBe(DONATION_CONFIG.transactionRef)
    expect(params.get('mc')).toBe(DONATION_CONFIG.merchantCode)
    expect(params.get('cu')).toBe('INR')
    expect(params.get('am')).toBe('500')
  })

  it('encodes spaces as %20, never "+", so the payee name displays correctly', () => {
    expect(uri).not.toContain('+')
    expect(uri).toContain('pn=M%2FS.SACRIFICE%201%20PIZZA%20WELFARE%20TRUST')
  })

  it.each([50, 100, 200, 299, 300, 3000])(
    'passes the donor amount ₹%i into the payload unchanged',
    (amount) => {
      const p = new URL(
        buildUpiUri(amount).replace('upi://pay', 'https://upi.invalid/pay'),
      ).searchParams
      expect(p.get('am')).toBe(String(amount))
    },
  )
})
