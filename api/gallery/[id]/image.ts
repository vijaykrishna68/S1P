import { Readable } from 'node:stream'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { get } from '@vercel/blob'
import { getGalleryImageById } from '../../_lib/gallery.js'
import { sendError, methodNotAllowed } from '../../_lib/http.js'

/**
 * Public, unauthenticated — anyone may view a gallery image. This is what
 * makes an otherwise-private blob effectively public: the project's one
 * Blob store is genuinely configured Private (access mode is fixed at store
 * creation — see CLAUDE.md's Decision Log), so a direct Blob URL would
 * 401/403 for a browser. This route resolves the blob URL from its own
 * database row (never from client input, same as the admin donation
 * screenshot route) and streams the bytes through server-side, so the
 * browser only ever receives image bytes — never a Blob URL or the OIDC
 * credential that authorizes reading one.
 *
 * `Cache-Control: public, max-age=86400` (not the donation screenshot
 * route's `no-store`, and not a full year/`immutable`): each blob pathname
 * is unique per upload, so content at a given URL never changes while it
 * exists, but a full year would let a deleted image keep being served from
 * caches far longer than reasonable for a small site's moderation needs.
 * One day meaningfully cuts repeat function invocations for a popular image
 * while still making a delete take effect within, at most, a day.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET'])
    return
  }

  const id = req.query.id
  if (typeof id !== 'string') {
    sendError(res, 400, 'Invalid image id.')
    return
  }

  try {
    const image = await getGalleryImageById(id)
    if (!image) {
      sendError(res, 404, 'Image not found.')
      return
    }

    const result = await get(image.blobUrl, { access: 'private' })
    if (!result || result.statusCode !== 200) {
      sendError(res, 404, 'Image not found.')
      return
    }

    res.setHeader('Content-Type', result.blob.contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.status(200)
    Readable.fromWeb(result.stream).pipe(res)
  } catch (err) {
    console.error('GET /api/gallery/[id]/image failed', err)
    sendError(res, 500, "We couldn't load that image. Please try again.")
  }
}
