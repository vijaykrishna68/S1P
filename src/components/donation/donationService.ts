import { uploadPresigned } from '@vercel/blob/client'

export interface DonationSubmission {
  fullName: string
  address: string
  amountPaid: number
  screenshot: File
  /**
   * Generated once per confirmation-form submission attempt (see
   * ConfirmationStep), not per HTTP request — a retry of the same attempt
   * reuses it, which is what lets the server treat a network/double-click
   * retry as a no-op instead of a duplicate donation. See CLAUDE.md's
   * idempotency note.
   */
  idempotencyKey: string
}

const SCREENSHOT_EXTENSION_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

interface ApiErrorBody {
  error?: { message?: string }
}

/**
 * Real submission boundary, replacing the earlier mocked delay — see
 * CLAUDE.md's backend-boundary note. The signature above is unchanged from
 * the mock, so nothing above this function (the reducers, ConfirmationStep)
 * needed to change at all.
 *
 * Uploads the screenshot directly to Vercel Blob from the browser (bypassing
 * this app's own serverless functions, which have a request-body size limit
 * well under the 8MB this app allows), then submits the donation metadata
 * with the resulting Blob URL.
 */
export async function submitDonation(submission: DonationSubmission): Promise<void> {
  const extension = SCREENSHOT_EXTENSION_BY_TYPE[submission.screenshot.type] ?? 'bin'
  // Randomly generated, never derived from the donor's original filename —
  // see CLAUDE.md's upload-handling note on why donor input never becomes a
  // storage path.
  const pathname = `donations/${crypto.randomUUID()}.${extension}`

  const blob = await uploadPresigned(pathname, submission.screenshot, {
    access: 'private',
    handleUploadUrl: '/api/uploads/screenshot',
  })

  const response = await fetch('/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: submission.fullName,
      address: submission.address,
      amountPaid: submission.amountPaid,
      screenshotUrl: blob.url,
      idempotencyKey: submission.idempotencyKey,
    }),
  })

  if (!response.ok) {
    const body: ApiErrorBody | null = await response.json().catch(() => null)
    throw new Error(
      body?.error?.message ?? "We couldn't submit your confirmation. Please try again.",
    )
  }
}
