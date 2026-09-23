import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * One consistent error shape across every route, and a single place that
 * guarantees internal details (stack traces, driver error messages, etc.)
 * never reach the client — callers pass a safe, human-readable `message`;
 * anything else gets logged server-side only.
 */
export function sendError(res: VercelResponse, status: number, message: string) {
  res.status(status).json({ error: { message } })
}

export function sendJson<T>(res: VercelResponse, status: number, data: T) {
  res.status(status).json(data)
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]) {
  res.setHeader('Allow', allowed.join(', '))
  sendError(res, 405, 'Method not allowed.')
}

/**
 * Vercel forwards the real client address via `x-forwarded-for` (the
 * function itself sits behind Vercel's edge network, so `req.socket` is
 * never the donor/admin's own connection) — used by both the donation rate
 * limiter and the login rate limiter, which is why it lives here rather than
 * in either route file.
 */
export function getClientIp(req: VercelRequest): string {
  const forwardedFor = req.headers['x-forwarded-for']
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim()
  }
  return req.socket.remoteAddress ?? 'unknown'
}
