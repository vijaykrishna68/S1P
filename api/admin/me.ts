import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth.js'
import { sendJson, methodNotAllowed } from '../_lib/http.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET'])
    return
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  sendJson(res, 200, { email: admin.email })
}
