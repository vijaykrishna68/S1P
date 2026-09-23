import bcrypt from 'bcryptjs'

/**
 * Pure crypto, deliberately with no dependency on db/client.ts (which
 * throws at import time if DATABASE_URL isn't set) — keeping this separate
 * from auth.ts's session management means these two functions stay a real
 * unit test, not one that accidentally requires a live database just to
 * import the module. See password.test.ts.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
