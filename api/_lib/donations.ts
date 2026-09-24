import { desc, eq, sql } from 'drizzle-orm'
import { del, get } from '@vercel/blob'
import { db } from '../../db/client.js'
import { donations, type donationStatusEnum } from '../../db/schema.js'
import { sniffImageType } from './magicBytes.js'
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

async function safeDeleteBlob(url: string): Promise<void> {
  try {
    await del(url)
  } catch (err) {
    // Best-effort cleanup only — an orphaned blob is a minor storage cost,
    // never a reason to fail the request that's already being rejected for
    // another reason.
    console.error('Failed to delete blob during cleanup', url, err)
  }
}

// Matches sniffImageType's longest signature check (WEBP: "RIFF" at 0-3,
// "WEBP" at 8-11) — same byte count the old Range: 'bytes=0-15' request
// fetched, just read from the stream instead of via an HTTP range header.
const MAGIC_BYTE_SNIFF_LENGTH = 16

/**
 * Reads only the leading bytes of a Blob stream needed for signature
 * sniffing, then cancels it — screenshots can be up to 8MB, and nothing
 * downstream needs the rest of the file, so there's no reason to buffer it
 * all just to check the first few bytes.
 */
async function readLeadingBytes(
  stream: ReadableStream<Uint8Array>,
  maxBytes: number,
): Promise<Buffer> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (total < maxBytes) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      total += value.length
    }
  } finally {
    await reader.cancel().catch(() => {})
  }
  return Buffer.concat(chunks).subarray(0, maxBytes)
}

/**
 * Confirms the uploaded file's actual bytes are a real image, rather than
 * trusting the Content-Type recorded at upload time (see
 * api/uploads/screenshot.ts) — a browser sets that header from the file's
 * declared type, which a request crafted outside the browser can set to
 * anything.
 *
 * Reads via the SDK's `get(url, { access: 'private' })`, not a raw `fetch()`
 * — screenshots live in this project's Private Blob store (see CLAUDE.md's
 * OIDC migration note), so an unauthenticated fetch against the blob URL
 * would 401/403 on every call and this function would incorrectly reject
 * every real submission. `get()` resolves the same OIDC credentials
 * (`VERCEL_OIDC_TOKEN` + `BLOB_STORE_ID`) this app's upload route already
 * relies on; no `BLOB_READ_WRITE_TOKEN` involved. A missing/inaccessible
 * blob (`get()` returns `null` or a non-200 result) is treated as
 * verification failure, same as the old `!response.ok` check; an unexpected
 * SDK error (e.g. auth misconfigured) still propagates uncaught, same as an
 * unexpected `fetch()` rejection did before — both surface as this route's
 * existing generic 500, not a silently-swallowed `false`.
 */
async function verifyScreenshotIsRealImage(url: string): Promise<boolean> {
  const result = await get(url, { access: 'private' })
  if (!result || result.statusCode !== 200) return false
  const buffer = await readLeadingBytes(result.stream, MAGIC_BYTE_SNIFF_LENGTH)
  return sniffImageType(buffer) !== null
}

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

  const isRealImage = await verifyScreenshotIsRealImage(input.screenshotUrl)
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
