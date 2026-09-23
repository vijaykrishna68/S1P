import { sql } from 'drizzle-orm'
import { db } from '../../db/client.js'
import { rateLimits } from '../../db/schema.js'

/**
 * Threshold for POST /api/donations. Documented and easy to change: this is
 * a low-traffic charity page, not a system under real load — a generous
 * limit that only actually bites obvious abuse (scripted/repeated
 * submissions), not a legitimate donor who mistypes and resubmits a few
 * times.
 */
export const MAX_DONATIONS_PER_HOUR = 10

/**
 * Threshold for POST /api/admin/login, keyed separately from donations (see
 * db/schema.ts's `key` column note) so the two never share a counter. 20/hour
 * is generous for a real admin who mistypes a password a few times, while
 * still bounding an automated guessing attempt to 20 attempts/hour against a
 * bcrypt-hashed password — not a substitute for a strong password, but a
 * real, cheap backstop with no new infrastructure.
 */
export const MAX_LOGIN_ATTEMPTS_PER_HOUR = 20

/**
 * Fixed-window counter, atomically incremented via a single upsert — no
 * separate "read count, then decide, then write" round trip to race against.
 * Postgres resolves concurrent increments for the same (key, window) row
 * itself. Deliberately not a sliding window or token bucket: at this traffic
 * level the fixed-window's edge-of-window imprecision (a burst spanning two
 * windows could in theory allow up to ~2x the limit) is an acceptable,
 * documented tradeoff against the complexity of a more precise scheme — see
 * CLAUDE.md's decision log and the "no Redis" rationale there.
 *
 * `key` is purpose-prefixed by the caller (e.g. `donation:<ip>`,
 * `login:<ip>`) so different endpoints never share a counter.
 */
export async function checkAndIncrementRateLimit(
  key: string,
  maxPerHour: number,
): Promise<boolean> {
  const windowStart = new Date()
  windowStart.setMinutes(0, 0, 0)

  const [row] = await db
    .insert(rateLimits)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.key, rateLimits.windowStart],
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count })

  return row.count <= maxPerHour
}
