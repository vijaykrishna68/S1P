/**
 * Shared between the browser bundle (useScreenshotUpload.ts, client-side UX
 * validation) and the API (api/_lib/magicBytes.ts, the check that actually
 * matters since the client can't be trusted) — see shared/donationLimits.ts
 * for why this lives in its own plain module rather than inside either
 * side's own config file.
 */
export const ALLOWED_SCREENSHOT_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_SCREENSHOT_BYTES = 8 * 1024 * 1024
