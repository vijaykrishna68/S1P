import { hashPassword } from '../api/_lib/password'
import { db } from './client'
import { adminUsers } from './schema'

/**
 * One-off script to create (or rotate the password of) the single admin
 * account — there's no sign-up flow by design (see CLAUDE.md's
 * admin-auth-scope note: one admin, not a user-management system). Run with:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npx tsx db/seedAdmin.ts
 * Re-running with the same email updates its password hash rather than
 * failing on the unique constraint, so this also doubles as "how do I change
 * the admin password" until there's a real UI for that.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim()
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error('Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx db/seedAdmin.ts')
    process.exit(1)
  }
  if (password.length < 12) {
    console.error('ADMIN_PASSWORD must be at least 12 characters.')
    process.exit(1)
  }

  const passwordHash = await hashPassword(password)

  await db
    .insert(adminUsers)
    .values({ email, passwordHash })
    .onConflictDoUpdate({ target: adminUsers.email, set: { passwordHash } })

  console.log(`Admin account ready for ${email}.`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Failed to seed admin account:', err)
  process.exit(1)
})
