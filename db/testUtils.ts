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

/**
 * Separate from resetDatabase() deliberately — gallery integration tests
 * only ever need this table reset, and keeping it out of resetDatabase()
 * means running just the gallery test file never touches donations/admin
 * data that other integration test files (or a developer's local seeded
 * admin account) may depend on.
 */
export async function resetGalleryImages(): Promise<void> {
  await db.execute(sql`TRUNCATE TABLE gallery_images`)
}
