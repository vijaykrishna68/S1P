import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ZodError } from 'zod'
import { createGalleryImageSchema } from '../_lib/validation.js'
import {
  createGalleryImage,
  listGalleryImages,
  toPublicGalleryImage,
} from '../_lib/gallery.js'
import { requireAdmin } from '../_lib/auth.js'
import { sendError, sendJson, methodNotAllowed } from '../_lib/http.js'

/** Public — anyone may view the gallery. Never returns `blobUrl`; only the
 * public-safe shape from toPublicGalleryImage. */
async function handleList(_req: VercelRequest, res: VercelResponse) {
  try {
    const images = await listGalleryImages()
    sendJson(res, 200, { items: images.map(toPublicGalleryImage) })
  } catch (err) {
    console.error('GET /api/gallery failed', err)
    sendError(res, 500, "We couldn't load the gallery. Please try again.")
  }
}

/** Admin-only — the browser has already uploaded the file directly to Blob
 * (see api/admin/uploads/gallery.ts) and is now submitting the resulting
 * blob URL as metadata, the same two-step shape as donation submission. */
async function handleCreate(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res)
  if (!admin) return

  let input
  try {
    input = createGalleryImageSchema.parse(req.body)
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
    const result = await createGalleryImage(input)
    if (result.outcome === 'invalid_image') {
      sendError(
        res,
        400,
        'The uploaded file is not a valid image. Please try a different file.',
      )
      return
    }
    sendJson(res, 201, toPublicGalleryImage(result.image))
  } catch (err) {
    console.error('POST /api/gallery failed', err)
    sendError(res, 500, "We couldn't save that image. Please try again.")
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    await handleList(req, res)
    return
  }
  if (req.method === 'POST') {
    await handleCreate(req, res)
    return
  }
  methodNotAllowed(res, ['GET', 'POST'])
}
