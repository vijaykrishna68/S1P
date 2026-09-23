import { sql } from 'drizzle-orm'
import { db } from './client.js'

/**
 * Test-only: truncates every table so each integration test starts from a
 * known-empty state. Never imported by production code. Truncating all four
 * tables in one statement satisfies admin_sessions' FK to admin_users
 * without needing CASCADE.
 */
export async function resetDatabase(): Promise<void> {
  await db.execute(
    sql`TRUNCATE TABLE donations, rate_limits, admin_sessions, admin_users`,
  )
}
