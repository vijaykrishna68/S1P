/**
 * Public donation configuration. UPI ID and phone number are content, not
 * secrets — a UPI ID and a contact number are meant to be publicly visible
 * to donors, the same way they'd appear on a poster or a payment app. They
 * are still centralized here (rather than hardcoded per-component) so that
 * updating them — including via `VITE_UPI_ID`/`VITE_PHONE_NUMBER` env vars
 * at build/deploy time, with no code change — is a one-line change.
 *
 * The QR code (PaymentStep.tsx) is generated client-side from `upiId`, not a
 * static image asset, so updating this value automatically updates the QR
 * too — there's no separate image to remember to swap.
 *
 * `minAmount`/`maxAmount` are product rules, not content, so they stay as
 * plain constants rather than env vars.
 *
 * The UPI ID, payee name, merchant category code and reference are the ones
 * encoded in the trust's official merchant QR (Docs/s1p QR.jpeg, decoded and
 * compared), so the generated QR carries the same payee details plus the
 * donor's amount. The phone number is unresolved and has no placeholder
 * fallback: while it is empty, the above-limit message offers the contact
 * email instead. See the Content Checklist in README.md.
 */
import {
  MIN_DONATION_AMOUNT,
  MAX_DONATION_AMOUNT,
  SUGGESTED_DONATION_AMOUNT,
} from '../../../shared/donationLimits'

function usablePhone(value: string | undefined) {
  const phone = value?.trim() ?? ''
  // Judge only the last ten digits, so a country code like +91 cannot make an
  // all-zero number look real.
  const national = phone.replace(/\D/g, '').slice(-10)
  return /[1-9]/.test(national) ? phone : ''
}

export const DONATION_CONFIG = {
  upiId:
    import.meta.env.VITE_UPI_ID?.trim() || 'mssacrifice1pizzawelfaretrust.eazypay@icici',
  payeeName: 'M/S.SACRIFICE 1 PIZZA WELFARE TRUST',
  merchantCode: '8398',
  transactionRef: 'EZYS9894655035',
  // Empty until a real number is supplied. A value whose number is all zeros
  // (such as the old '+91 00000 00000' placeholder) is treated as unset, so a
  // placeholder number can never be rendered or dialled.
  phoneNumber: usablePhone(import.meta.env.VITE_PHONE_NUMBER),
  // Shown instead of a phone number while that is unresolved. Same address as
  // About's Trust list (aboutData.ts TRUST_INFO).
  contactEmail: 's1pwtrust@gmail.com',
  minAmount: MIN_DONATION_AMOUNT,
  suggestedAmount: SUGGESTED_DONATION_AMOUNT,
  maxAmount: MAX_DONATION_AMOUNT,
} as const
