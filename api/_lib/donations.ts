import { desc, eq, sql } from 'drizzle-orm'
import { db } from '../../db/client.js'
import { donations, type donationStatusEnum } from '../../db/schema.js'
import { verifyBlobIsRealImage } from './magicBytes.js'
import { safeDeleteBlob } from './blobCleanup.js'
import { checkAndIncrementRateLimit, MAX_DONATIONS_PER_HOUR } from './rateLimit.js'
import type { CreateDonationInput } from './validation.js'

type DonationStatus = (typeof donationStatusEnum.enumValues)[number]

export type DonationRow = typeof donations.$inferSelect

export type CreateDonationResult =
  | { outcome: 'created'; donation: DonationRow }
  // The idempotency key was already used — this is a retry (double-click,
  // network retry, frontend retry) being safely absorbed, not an error.
  | { outcome: 'duplicate'; donation: DonationRow }
  | { outcome: 'rate_limited' }
  | { outcome: 'invalid_screenshot' }

/**
 * Order of operations is deliberate:
 *  1. Idempotency check FIRST, before spending a rate-limit slot or
 *     re-fetching the screenshot — a retry of an already-accepted
 *     submission should be free, not count against the donor's quota.
 *  2. Rate limit.
 *  3. Screenshot content verification.
 *  4. Insert, with the same idempotency race handled again at the DB level
 *     (unique constraint) in case two requests with the same key arrive
 *     concurrently and both pass step 1.
 * Every rejection path after a blob has already been uploaded cleans it up
 * — see CLAUDE.md's upload-failure-handling note.
 */
export async function createDonation(
  input: CreateDonationInput,
  ipAddress: string,
): Promise<CreateDonationResult> {
  const [existing] = await db
    .select()
    .from(donations)
    .where(eq(donations.idempotencyKey, input.idempotencyKey))
    .limit(1)

  if (existing) {
    if (existing.screenshotUrl !== input.screenshotUrl)
      await safeDeleteBlob(input.screenshotUrl)
    return { outcome: 'duplicate', donation: existing }
  }

  const allowed = await checkAndIncrementRateLimit(
    `donation:${ipAddress}`,
    MAX_DONATIONS_PER_HOUR,
  )
  if (!allowed) {
    await safeDeleteBlob(input.screenshotUrl)
    return { outcome: 'rate_limited' }
  }

  const isRealImage = await verifyBlobIsRealImage(input.screenshotUrl)
  if (!isRealImage) {
    await safeDeleteBlob(input.screenshotUrl)
    return { outcome: 'invalid_screenshot' }
  }

  const [inserted] = await db
    .insert(donations)
    .values({
      fullName: input.fullName,
      address: input.address,
      amountPaid: input.amountPaid,
      screenshotUrl: input.screenshotUrl,
      idempotencyKey: input.idempotencyKey,
      ipAddress,
    })
    .onConflictDoNothing({ target: donations.idempotencyKey })
    .returning()

  if (inserted) return { outcome: 'created', donation: inserted }

  const [raceWinner] = await db
    .select()
    .from(donations)
    .where(eq(donations.idempotencyKey, input.idempotencyKey))
    .limit(1)
  if (!raceWinner)
    throw new Error('Unreachable: unique constraint conflict but no existing row found.')
  await safeDeleteBlob(input.screenshotUrl)
  return { outcome: 'duplicate', donation: raceWinner }
}

export interface ListDonationsParams {
  status?: DonationStatus
  page: number
  pageSize: number
}

export interface ListDonationsResult {
  items: DonationRow[]
  page: number
  pageSize: number
  total: number
}

/** Backs the admin dashboard's paginated, optionally status-filtered list —
 * see db/schema.ts's index note for the exact query shape this is built to
 * satisfy (`WHERE status = ? ORDER BY created_at DESC LIMIT ?`). */
export async function listDonations(
  params: ListDonationsParams,
): Promise<ListDonationsResult> {
  const where = params.status ? eq(donations.status, params.status) : undefined

  const [items, [{ count }]] = await Promise.all([
    db
      .select()
      .from(donations)
      .where(where)
      .orderBy(desc(donations.createdAt))
      .limit(params.pageSize)
      .offset((params.page - 1) * params.pageSize),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(donations)
      .where(where),
  ])

  return { items, page: params.page, pageSize: params.pageSize, total: count }
}

export async function getDonationById(id: string): Promise<DonationRow | null> {
  const [row] = await db.select().from(donations).where(eq(donations.id, id)).limit(1)
  return row ?? null
}

export async function updateDonationStatus(
  id: string,
  status: DonationStatus,
): Promise<DonationRow | null> {
  const [row] = await db
    .update(donations)
    .set({ status, updatedAt: new Date() })
    .where(eq(donations.id, id))
    .returning()
  return row ?? null
}

export interface DonationSummary {
  totalCount: number
  totalAmount: number
  pendingCount: number
}

/** Always computed across ALL donations regardless of the dashboard's
 * current status filter — these are the summary tiles, not a filtered
 * count, so listDonations' `where` clause deliberately doesn't apply here. */
export async function getDonationSummary(): Promise<DonationSummary> {
  const [row] = await db
    .select({
      totalCount: sql<number>`count(*)::int`,
      totalAmount: sql<number>`coalesce(sum(${donations.amountPaid}), 0)::int`,
      pendingCount: sql<number>`count(*) filter (where ${donations.status} = 'pending')::int`,
    })
    .from(donations)
  return row
}
