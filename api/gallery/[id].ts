import type { VercelRequest, VercelResponse } from '@vercel/node'
import { deleteGalleryImage } from '../_lib/gallery.js'
import { requireAdmin } from '../_lib/auth.js'
import { sendError, sendJson, methodNotAllowed } from '../_lib/http.js'

/** Admin-only. Public reads go through index.ts (list) and [id]/image.ts
 * (the actual bytes) instead — there's no public single-item metadata
 * endpoint, since the public page only ever needs the full list. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    methodNotAllowed(res, ['DELETE'])
    return
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  const id = req.query.id
  if (typeof id !== 'string') {
    sendError(res, 400, 'Invalid image id.')
    return
  }

  try {
    const deleted = await deleteGalleryImage(id)
    if (!deleted) {
      sendError(res, 404, 'Image not found.')
      return
    }
    sendJson(res, 200, { ok: true })
  } catch (err) {
    console.error('DELETE /api/gallery/[id] failed', err)
    sendError(res, 500, "We couldn't delete that image. Please try again.")
  }
}
