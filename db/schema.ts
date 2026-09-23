import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core'

export const donationStatusEnum = pgEnum('donation_status', [
  'pending',
  'reviewed',
  'rejected',
])

/**
 * amountPaid is stored as a whole-rupee integer, never a float. Paise-level
 * precision was considered and rejected: the donation UI only ever collects
 * whole rupees (₹300–₹3000, no decimal input anywhere), so paise would add a
 * unit-conversion concern with no real requirement behind it. See CLAUDE.md's
 * decision log.
 */
export const donations = pgTable(
  'donations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    fullName: text('full_name').notNull(),
    address: text('address').notNull(),
    amountPaid: integer('amount_paid').notNull(),
    screenshotUrl: text('screenshot_url').notNull(),
    status: donationStatusEnum('status').notNull().default('pending'),
    // A client-generated UUID, one per confirmation-form submission attempt
    // (not per HTTP request) — retries of the same attempt reuse it so the
    // unique constraint below turns a network/double-click retry into a
    // no-op instead of a duplicate donation row.
    idempotencyKey: uuid('idempotency_key').notNull(),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('donations_idempotency_key_key').on(table.idempotencyKey),
    // Supports the admin dashboard's default "all submissions, newest first"
    // listing with no status filter.
    index('donations_created_at_idx').on(table.createdAt),
    // Supports the admin dashboard's filtered listing:
    //   WHERE status = ? ORDER BY created_at DESC LIMIT ?
    // Composite so Postgres can satisfy both the filter and the sort from a
    // single index scan. Deliberately separate from the plain created_at
    // index above — a (status, created_at) index can't efficiently serve a
    // query with no status predicate, since status is the leading column.
    index('donations_status_created_at_idx').on(table.status, table.createdAt),
  ],
)

export const adminUsers = pgTable(
  'admin_users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // A real invariant (two admin accounts sharing an email makes no sense),
    // not just a lookup-speed optimization.
    uniqueIndex('admin_users_email_key').on(table.email),
  ],
)

/**
 * Only a SHA-256 hash of the session token is ever stored — mirrors password
 * hashing so that a database read alone (e.g. a leaked backup) can't be used
 * to forge a valid session cookie. Session tokens are high-entropy random
 * values already, so a fast cryptographic hash is appropriate here; bcrypt
 * (deliberately slow, for low-entropy secrets like passwords) would add
 * needless latency to every authenticated request.
 */
export const adminSessions = pgTable(
  'admin_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('admin_sessions_token_hash_key').on(table.tokenHash)],
)

/**
 * Fixed-window rate limiting: `windowStart` is the current window truncated
 * to a whole hour (see api/_lib/rateLimit.ts), so every request within the
 * same clock hour for the same key maps to one row. The composite primary
 * key lets the check-and-increment happen as a single atomic
 * `INSERT ... ON CONFLICT DO UPDATE ... RETURNING count`, with no separate
 * read-then-write race to reason about — deliberately simple, since this is
 * a low-traffic app, not a system that needs sliding-window or token-bucket
 * precision.
 *
 * `key` is a purpose-prefixed identifier (`donation:<ip>`, `login:<ip>`), not
 * a bare IP address — the same table and mechanism back rate limits for more
 * than one endpoint, each with its own threshold (see rateLimit.ts), and
 * without a prefix, a donor's submissions and an admin's login attempts from
 * the same network would incorrectly share one counter.
 */
export const rateLimits = pgTable(
  'rate_limits',
  {
    key: text('key').notNull(),
    windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
    count: integer('count').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.key, table.windowStart] })],
)
