import { randomBytes, createHash } from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../../db/client'
import { adminSessions, adminUsers } from '../../db/schema'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12 // 12 hours

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  await db
    .insert(adminSessions)
    .values({ userId, tokenHash: hashToken(token), expiresAt })
  return token
}

export function setSessionCookie(res: VercelResponse, token: string) {
  const isProd = process.env.NODE_ENV === 'production'
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_DURATION_MS / 1000}${isProd ? '; Secure' : ''}`,
  )
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0`,
  )
}

function readSessionToken(req: VercelRequest): string | undefined {
  return req.cookies?.[SESSION_COOKIE_NAME]
}

export async function invalidateSession(req: VercelRequest): Promise<void> {
  const token = readSessionToken(req)
  if (!token) return
  await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hashToken(token)))
}

export interface AdminIdentity {
  userId: string
  email: string
}

/**
 * Verifies the session cookie against the database (existence + not
 * expired), returning the admin's identity on success or null otherwise.
 * Every admin-only route calls this (directly, or via requireAdmin below)
 * rather than trusting the cookie's mere presence.
 */
export async function getAdminIdentity(
  req: VercelRequest,
): Promise<AdminIdentity | null> {
  const token = readSessionToken(req)
  if (!token) return null

  const [row] = await db
    .select({
      userId: adminUsers.id,
      email: adminUsers.email,
      expiresAt: adminSessions.expiresAt,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
    .where(eq(adminSessions.tokenHash, hashToken(token)))
    .limit(1)

  if (!row || row.expiresAt.getTime() < Date.now()) return null
  return { userId: row.userId, email: row.email }
}

/**
 * Guard for admin-only route handlers. Returns the identity on success;
 * sends a 401 and returns null on failure, so callers can
 * `const admin = await requireAdmin(req, res); if (!admin) return`.
 */
export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse,
): Promise<AdminIdentity | null> {
  const identity = await getAdminIdentity(req)
  if (!identity) {
    res.status(401).json({ error: { message: 'Authentication required.' } })
    return null
  }
  return identity
}
