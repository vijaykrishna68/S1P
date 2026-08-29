export interface DonationSubmission {
  fullName: string
  address: string
  amountPaid: number
  screenshot: File
}

/**
 * MOCK submission boundary — there is no backend yet. This is the ONLY
 * place a real API call would go; every component above it depends on this
 * function's signature (accepts a DonationSubmission, resolves on success,
 * throws on failure), not on how it's implemented. Swapping this body for a
 * real `fetch()` to a donations endpoint (including uploading `screenshot`)
 * requires no changes anywhere else. See CLAUDE.md's backend-boundary note.
 *
 * The artificial delay simulates network latency so the "Submitting…" state
 * is actually visible during development — it is not hiding a real request.
 */
export async function submitDonation(_submission: DonationSubmission): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1100))
}
