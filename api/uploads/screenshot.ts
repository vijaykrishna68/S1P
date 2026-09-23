import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { ALLOWED_SCREENSHOT_TYPES, MAX_SCREENSHOT_BYTES } from '../_lib/magicBytes.js'
import { sendError, methodNotAllowed } from '../_lib/http.js'

/**
 * Issues a short-lived, constrained client upload token so the browser can
 * PUT the screenshot directly to Vercel Blob — the file never passes through
 * this function's own request body, which matters because Vercel's
 * serverless functions cap request bodies well under the 8MB screenshots
 * this app allows.
 *
 * `access` is deliberately NOT set here: in the installed @vercel/blob
 * version (2.8.0), the client-upload token this endpoint signs does not
 * bind an access level at all — reading the SDK's own
 * generateClientTokenFromReadWriteToken source confirms the signed payload
 * carries pathname/content-type/size constraints but not `access`. The
 * frontend's upload() call decides public vs. private, and this server
 * cannot verify or override that choice for this flow. Screenshots are
 * therefore public-but-unguessable (random path, never linked from the
 * public site) rather than authenticated-private. Documented as a known
 * limitation, not a claimed security property — see CLAUDE.md.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST'])
    return
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_SCREENSHOT_TYPES,
        maximumSizeInBytes: MAX_SCREENSHOT_BYTES,
        addRandomSuffix: true,
      }),
    })
    res.status(200).json(jsonResponse)
  } catch (err) {
    console.error('POST /api/uploads/screenshot failed', err)
    sendError(res, 400, "We couldn't process that file. Please try a different image.")
  }
}
