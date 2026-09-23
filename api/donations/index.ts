import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ZodError } from 'zod'
import { createDonationSchema, listDonationsQuerySchema } from '../_lib/validation'
import { createDonation, listDonations, getDonationSummary } from '../_lib/donations'
import { requireAdmin } from '../_lib/auth'
import { sendError, sendJson, methodNotAllowed, getClientIp } from '../_lib/http'

async function handleList(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res)
  if (!admin) return

  let query
  try {
    query = listDonationsQuerySchema.parse(req.query)
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
    const [list, summary] = await Promise.all([
      listDonations(query),
      getDonationSummary(),
    ])
    sendJson(res, 200, { ...list, summary })
  } catch (err) {
    console.error('GET /api/donations failed', err)
    sendError(res, 500, "We couldn't load donations. Please try again.")
  }
}

async function handleCreate(req: VercelRequest, res: VercelResponse) {
  let input
  try {
    input = createDonationSchema.parse(req.body)
  } catch (err) {
    if (err instanceof ZodError) {
      sendError(res, 400, err.issues[0]?.message ?? 'Invalid request.')
      return
    }
    sendError(res, 400, 'Invalid request.')
    return
  }

  try {
    const result = await createDonation(input, getClientIp(req))

    switch (result.outcome) {
      case 'created':
        sendJson(res, 201, { id: result.donation.id, status: result.donation.status })
        return
      case 'duplicate':
        // Same idempotency key as an already-accepted submission — return
        // the original result rather than an error, so a frontend retry
        // (network blip, double-click) sees success either way.
        sendJson(res, 200, { id: result.donation.id, status: result.donation.status })
        return
      case 'rate_limited':
        sendError(
          res,
          429,
          `Too many submissions from this network. Please try again later.`,
        )
        return
      case 'invalid_screenshot':
        sendError(
          res,
          400,
          'The uploaded file is not a valid image. Please upload your payment screenshot again.',
        )
        return
    }
  } catch (err) {
    console.error('POST /api/donations failed', err)
    sendError(res, 500, "We couldn't submit your confirmation. Please try again.")
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    await handleCreate(req, res)
    return
  }
  if (req.method === 'GET') {
    await handleList(req, res)
    return
  }
  methodNotAllowed(res, ['GET', 'POST'])
}
