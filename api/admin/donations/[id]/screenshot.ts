import { Readable } from 'node:stream'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { get } from '@vercel/blob'
import { getDonationById } from '../../../_lib/donations.js'
import { requireAdmin } from '../../../_lib/auth.js'
import { sendError, methodNotAllowed } from '../../../_lib/http.js'

/**
 * Streams a donation's payment screenshot to an authenticated admin.
 *
 * Screenshots live in the project's Private Blob store (see CLAUDE.md's OIDC
 * migration note), so `donation.screenshotUrl` is no longer a directly
 * browser-fetchable URL — it requires the same OIDC credentials this server
 * already uses for uploads, fetched here with `get()` and streamed through
 * this response rather than ever being handed to the client. The donation id
 * in the route is the only client input; the Blob URL it resolves to always
 * comes from this server's own database row, never from anything the request
 * supplies, so there's no way to ask this route for an unrelated blob.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET'])
    return
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  const id = req.query.id
  if (typeof id !== 'string') {
    sendError(res, 400, 'Invalid donation id.')
    return
  }

  try {
    const donation = await getDonationById(id)
    if (!donation) {
      sendError(res, 404, 'Donation not found.')
      return
    }

    if (!donation.screenshotUrl) {
      sendError(res, 404, 'This donation has no screenshot.')
      return
    }

    const result = await get(donation.screenshotUrl, { access: 'private' })
    // `statusCode` narrows `stream`/`blob.contentType` for TS — always 200
    // here since this route never passes `ifNoneMatch` to trigger a 304.
    if (!result || result.statusCode !== 200) {
      sendError(res, 404, 'Screenshot not found.')
      return
    }

    // Never cached by a shared/public cache — this is a donor's proof-of-payment
    // image, not public content, even though it's already gated by admin auth.
    res.setHeader('Content-Type', result.blob.contentType)
    res.setHeader('Cache-Control', 'private, no-store')
    res.status(200)
    Readable.fromWeb(result.stream).pipe(res)
  } catch (err) {
    console.error('GET /api/admin/donations/[id]/screenshot failed', err)
    sendError(res, 500, "We couldn't load that screenshot. Please try again.")
  }
}
