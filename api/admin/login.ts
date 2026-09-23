import type { VercelRequest, VercelResponse } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { ZodError } from 'zod'
import { db } from '../../db/client'
import { adminUsers } from '../../db/schema'
import { loginSchema } from '../_lib/validation'
import { verifyPassword } from '../_lib/password'
import { createSession, setSessionCookie } from '../_lib/auth'
import {
  checkAndIncrementRateLimit,
  MAX_LOGIN_ATTEMPTS_PER_HOUR,
} from '../_lib/rateLimit'
import { sendError, sendJson, methodNotAllowed, getClientIp } from '../_lib/http'

// A precomputed, valid bcrypt hash that no real password will ever match.
// Compared against on every login attempt for an email that doesn't exist,
// so an unknown-email response takes roughly the same time as a
// wrong-password one — without it, the two cases are distinguishable by
// timing alone (bcrypt only runs when a user is actually found), which leaks
// whether a given email has an admin account.
const DUMMY_PASSWORD_HASH = '$2b$12$lPXHga403d1QOhYbDBDF7.9bD2e4E51D49rGOS65npOLlBp3LK5ta'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST'])
    return
  }

  let input
  try {
    input = loginSchema.parse(req.body)
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

  const allowed = await checkAndIncrementRateLimit(
    `login:${getClientIp(req)}`,
    MAX_LOGIN_ATTEMPTS_PER_HOUR,
  )
  if (!allowed) {
    sendError(res, 429, 'Too many login attempts. Please try again later.')
    return
  }

  try {
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, input.email))
      .limit(1)

    const passwordMatches = await verifyPassword(
      input.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    )
    if (!user || !passwordMatches) {
      sendError(res, 401, 'Invalid email or password.')
      return
    }

    const token = await createSession(user.id)
    setSessionCookie(res, token)
    sendJson(res, 200, { email: user.email })
  } catch (err) {
    console.error('POST /api/admin/login failed', err)
    sendError(res, 500, "We couldn't sign you in. Please try again.")
  }
}
