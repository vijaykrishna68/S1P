import type { VercelRequest, VercelResponse } from '@vercel/node'
import { invalidateSession, clearSessionCookie } from '../_lib/auth.js'
import { sendJson, methodNotAllowed } from '../_lib/http.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST'])
    return
  }

  // Deletes the session row server-side — this is real invalidation, not
  // just clearing the cookie. A copy of the old cookie value is useless
  // after this, even if it were somehow replayed.
  await invalidateSession(req)
  clearSessionCookie(res)
  sendJson(res, 200, { ok: true })
}
