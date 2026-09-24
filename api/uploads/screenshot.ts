import type { VercelRequest, VercelResponse } from '@vercel/node'
import { issueSignedToken } from '@vercel/blob'
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from '@vercel/blob/client'
import { ALLOWED_SCREENSHOT_TYPES, MAX_SCREENSHOT_BYTES } from '../_lib/magicBytes.js'
import { sendError, methodNotAllowed } from '../_lib/http.js'

/**
 * Issues a short-lived, constrained presigned upload URL so the browser can
 * PUT the screenshot directly to Vercel Blob — the file never passes through
 * this function's own request body, which matters because Vercel's
 * serverless functions cap request bodies well under the 8MB screenshots
 * this app allows.
 *
 * Uses the Vercel Signed URLs flow (`issueSignedToken` + `handleUploadPresigned`)
 * rather than the legacy `handleUpload`, because this project's Blob store
 * connection now authenticates via OIDC (`VERCEL_OIDC_TOKEN` + `BLOB_STORE_ID`)
 * with no `BLOB_READ_WRITE_TOKEN` provisioned — and `handleUpload` requires
 * that static token to sign client tokens, which OIDC-only projects no longer
 * get by default. `issueSignedToken` accepts OIDC credentials directly, so
 * this flow works without ever needing a long-lived token. See CLAUDE.md's
 * Decision Log for the migration from `handleUpload`.
 *
 * `access: 'private'` is set on the client's `uploadPresigned()` call (see
 * donationService.ts) to match this project's actual Blob store, which is
 * configured Private — unlike the old `handleUpload` token, which couldn't
 * bind or verify an access level at all.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST'])
    return
  }

  try {
    const jsonResponse = await handleUploadPresigned({
      body: req.body as HandleUploadPresignedBody,
      request: req,
      getSignedToken: async (pathname) => ({
        token: await issueSignedToken({
          pathname,
          operations: ['put'],
          allowedContentTypes: ALLOWED_SCREENSHOT_TYPES,
          maximumSizeInBytes: MAX_SCREENSHOT_BYTES,
        }),
        urlOptions: {
          allowedContentTypes: ALLOWED_SCREENSHOT_TYPES,
          maximumSizeInBytes: MAX_SCREENSHOT_BYTES,
          addRandomSuffix: true,
        },
      }),
    })
    res.status(200).json(jsonResponse)
  } catch (err) {
    console.error('POST /api/uploads/screenshot failed', err)
    sendError(res, 400, "We couldn't process that file. Please try a different image.")
  }
}
