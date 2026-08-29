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
 * None of these are real yet — see the Content Checklist in CLAUDE.md and
 * README.md for what must be replaced before this site goes live for real
 * donations.
 */
export const DONATION_CONFIG = {
  upiId: import.meta.env.VITE_UPI_ID?.trim() || 'sacrificeonepizza@upi',
  phoneNumber: import.meta.env.VITE_PHONE_NUMBER?.trim() || '+91 00000 00000',
  minAmount: 300,
  maxAmount: 3000,
} as const
