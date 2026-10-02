import { del } from '@vercel/blob'

/**
 * Best-effort cleanup only — an orphaned blob is a minor storage cost, never
 * a reason to fail a request that's already being rejected/completed for
 * another reason. Shared by api/_lib/donations.ts and api/_lib/gallery.ts.
 */
export async function safeDeleteBlob(url: string): Promise<void> {
  try {
    await del(url)
  } catch (err) {
    console.error('Failed to delete blob during cleanup', url, err)
  }
}
