import { DONATION_CONFIG } from './config'

export function buildUpiUri(amount: number) {
  // Same payee fields as the trust's official merchant QR, plus the amount.
  // Built with encodeURIComponent (spaces as %20), not URLSearchParams, which
  // writes spaces as "+" that a UPI app may show literally in the payee name.
  const params = {
    pa: DONATION_CONFIG.upiId,
    pn: DONATION_CONFIG.payeeName,
    tr: DONATION_CONFIG.transactionRef,
    cu: 'INR',
    mc: DONATION_CONFIG.merchantCode,
    am: String(amount),
  }
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')
  return `upi://pay?${query}`
}
