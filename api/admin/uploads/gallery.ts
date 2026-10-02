import type { VercelRequest, VercelResponse } from '@vercel/node'
import { issueSignedToken } from '@vercel/blob'
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from '@vercel/blob/client'
import {
  ALLOWED_GALLERY_IMAGE_TYPES,
  MAX_GALLERY_IMAGE_BYTES,
} from '../../../shared/galleryLimits.js'
import { requireAdmin } from '../../_lib/auth.js'
import { sendError, methodNotAllowed } from '../../_lib/http.js'

/**
 * Admin-only counterpart to api/uploads/screenshot.ts's presigned-upload
 * pattern (same Vercel Signed URLs flow: `issueSignedToken` +
 * `handleUploadPresigned`, no long-lived `BLOB_READ_WRITE_TOKEN`). The
 * donation screenshot route is intentionally public — any donor can upload
 * a payment screenshot as part of the public donation flow — but gallery
 * images may only be uploaded by an authenticated admin, so this route
 * checks `requireAdmin` before issuing any token at all: an unauthenticated
 * caller can never obtain a token to upload with, regardless of how
 * short-lived or scoped that token is. This is the actual security boundary
 * — no Blob write credential of any kind ever reaches the browser either
 * way, admin-gated or not.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST'])
    return
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  try {
    const jsonResponse = await handleUploadPresigned({
      body: req.body as HandleUploadPresignedBody,
      request: req,
      getSignedToken: async (pathname) => ({
        token: await issueSignedToken({
          pathname,
          operations: ['put'],
          allowedContentTypes: ALLOWED_GALLERY_IMAGE_TYPES,
          maximumSizeInBytes: MAX_GALLERY_IMAGE_BYTES,
        }),
        urlOptions: {
          allowedContentTypes: ALLOWED_GALLERY_IMAGE_TYPES,
          maximumSizeInBytes: MAX_GALLERY_IMAGE_BYTES,
          addRandomSuffix: true,
        },
      }),
    })
    res.status(200).json(jsonResponse)
  } catch (err) {
    console.error('POST /api/admin/uploads/gallery failed', err)
    sendError(res, 400, "We couldn't process that file. Please try a different image.")
  }
}
