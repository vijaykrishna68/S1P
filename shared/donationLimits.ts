/**
 * The one source of truth for the UPI donation range, shared by the browser
 * bundle (src/components/donation/config.ts) and the serverless API
 * (api/_lib/validation.ts). Kept in its own plain module — not inside
 * src/components/donation/config.ts — because that file also reads
 * `import.meta.env`, a Vite-only global that doesn't exist in the Node
 * runtime the API functions run in; importing it from API code would throw.
 */
/**
 * The smallest amount a donor may give: ₹1, a whole rupee. This is a technical
 * floor (UPI works in rupees; amountPaid is stored as a whole-rupee integer),
 * NOT the "one pizza" amount. Phase 4D: S1P confirmed that ₹300 is only the
 * encouraged contribution, so any valid amount below it (₹50, ₹100, ₹200 ...)
 * is a legitimate donation.
 */
export const MIN_DONATION_AMOUNT = 1
export const MAX_DONATION_AMOUNT = 3000

/**
 * About the value of one pizza and the amount S1P encourages donors to give.
 * Display and messaging only: it is never a validation limit and is never
 * substituted for the amount a donor enters.
 */
export const SUGGESTED_DONATION_AMOUNT = 300
