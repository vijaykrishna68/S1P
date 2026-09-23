import type { VercelRequest } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../db/client.js'
import { resetDatabase } from '../../db/testUtils.js'
import { adminSessions, adminUsers } from '../../db/schema.js'
import { createSession, getAdminIdentity, invalidateSession } from './auth.js'
import { hashPassword } from './password.js'

function requestWithCookie(token?: string): VercelRequest {
  return { cookies: token ? { admin_session: token } : {} } as unknown as VercelRequest
}

async function createTestAdmin(email = 'admin@example.com') {
  const [user] = await db
    .insert(adminUsers)
    .values({ email, passwordHash: await hashPassword('irrelevant-for-these-tests') })
    .returning()
  return user
}

/** Runs against a real Postgres — see vitest.integration.config.ts. */
describe('session lifecycle (integration)', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  it('a freshly created session resolves to its admin identity', async () => {
    const admin = await createTestAdmin()
    const token = await createSession(admin.id)

    const identity = await getAdminIdentity(requestWithCookie(token))

    expect(identity).toEqual({ userId: admin.id, email: admin.email })
  })

  it('only the hashed token is stored, never the raw one', async () => {
    const admin = await createTestAdmin()
    const token = await createSession(admin.id)

    const [row] = await db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.userId, admin.id))
    expect(row.tokenHash).not.toBe(token)
  })

  it('returns null when no session cookie is present', async () => {
    await expect(getAdminIdentity(requestWithCookie())).resolves.toBeNull()
  })

  it('returns null for a token that was never issued', async () => {
    await expect(
      getAdminIdentity(requestWithCookie('not-a-real-token')),
    ).resolves.toBeNull()
  })

  it('returns null for an expired session', async () => {
    const admin = await createTestAdmin()
    const token = await createSession(admin.id)
    await db
      .update(adminSessions)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(adminSessions.userId, admin.id))

    await expect(getAdminIdentity(requestWithCookie(token))).resolves.toBeNull()
  })

  it('invalidateSession deletes the session so the same token no longer resolves', async () => {
    const admin = await createTestAdmin()
    const token = await createSession(admin.id)

    await invalidateSession(requestWithCookie(token))

    await expect(getAdminIdentity(requestWithCookie(token))).resolves.toBeNull()
    const rows = await db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.userId, admin.id))
    expect(rows).toHaveLength(0)
  })
})
