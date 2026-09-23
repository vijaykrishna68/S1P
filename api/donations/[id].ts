import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ZodError } from 'zod'
import { updateDonationStatusSchema } from '../_lib/validation'
import { getDonationById, updateDonationStatus } from '../_lib/donations'
import { requireAdmin } from '../_lib/auth'
import { sendError, sendJson, methodNotAllowed } from '../_lib/http'

/** Admin-only donation detail + status transitions — both actions need the
 * same auth guard and the same id, so they share this one file rather than
 * being split, matching Vercel's [id].ts dynamic-route convention. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res)
  if (!admin) return

  const id = req.query.id
  if (typeof id !== 'string') {
    sendError(res, 400, 'Invalid donation id.')
    return
  }

  if (req.method === 'GET') {
    try {
      const donation = await getDonationById(id)
      if (!donation) {
        sendError(res, 404, 'Donation not found.')
        return
      }
      sendJson(res, 200, donation)
    } catch (err) {
      console.error('GET /api/donations/[id] failed', err)
      sendError(res, 500, "We couldn't load that donation. Please try again.")
    }
    return
  }

  if (req.method === 'PATCH') {
    let input
    try {
      input = updateDonationStatusSchema.parse(req.body)
    } catch (err) {
      sendError(
        res,
        400,
        err instanceof ZodError
          ? (err.issues[0]?.message ?? 'Invalid request.')
          : 'Invalid request.',
      )
      return
    }

    try {
      const donation = await updateDonationStatus(id, input.status)
      if (!donation) {
        sendError(res, 404, 'Donation not found.')
        return
      }
      sendJson(res, 200, donation)
    } catch (err) {
      console.error('PATCH /api/donations/[id] failed', err)
      sendError(res, 500, "We couldn't update that donation. Please try again.")
    }
    return
  }

  methodNotAllowed(res, ['GET', 'PATCH'])
}
