/**
 * The one source of truth for the UPI donation range, shared by the browser
 * bundle (src/components/donation/config.ts) and the serverless API
 * (api/_lib/validation.ts). Kept in its own plain module — not inside
 * src/components/donation/config.ts — because that file also reads
 * `import.meta.env`, a Vite-only global that doesn't exist in the Node
 * runtime the API functions run in; importing it from API code would throw.
 */
export const MIN_DONATION_AMOUNT = 300
export const MAX_DONATION_AMOUNT = 3000
