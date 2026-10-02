/**
 * Shared between the browser bundle (admin gallery upload UI) and the API
 * (server-side validation, which is the check that actually matters) — same
 * reasoning as shared/screenshotLimits.ts.
 *
 * 5MB, not the donation flow's 8MB: gallery photos are meant for on-page
 * display, not the higher-fidelity proof-of-payment screenshots that limit
 * exists for. Same PNG/JPEG/WEBP set as screenshots — no format need is
 * different here.
 */
export const ALLOWED_GALLERY_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_GALLERY_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_GALLERY_CAPTION_LENGTH = 200
