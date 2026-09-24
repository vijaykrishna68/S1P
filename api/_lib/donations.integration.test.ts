import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@vercel/blob', () => ({ del: vi.fn(), get: vi.fn() }))

import { del, get } from '@vercel/blob'
import { db } from '../../db/client.js'
import { resetDatabase } from '../../db/testUtils.js'
import { donations } from '../../db/schema.js'
import { createDonation } from './donations.js'
import { MAX_DONATIONS_PER_HOUR } from './rateLimit.js'
import type { CreateDonationInput } from './validation.js'

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0, 0,
])
const JPEG_SIGNATURE = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
])
const WEBP_SIGNATURE = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0, 0, 0, 0,
])

/**
 * `verifyScreenshotIsRealImage` reads the blob via the SDK's authenticated
 * `get(url, { access: 'private' })`, not a raw `fetch()` — screenshots live
 * in a Private Blob store, so this mocks the same SDK call the production
 * code actually makes (see donations.ts's own doc comment on why a plain
 * fetch would 401 against this store).
 */
function mockScreenshotBytes(bytes: Buffer) {
  // A fresh stream per call — some tests call createDonation (and therefore
  // get()) more than once, and a real ReadableStream can only be read once;
  // reusing one static mocked object across calls would throw "ReadableStream
  // is locked" on the second read, which a real, repeated get() call never
  // would.
  vi.mocked(get).mockImplementation(async () => ({
    statusCode: 200,
    stream: new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(bytes))
        controller.close()
      },
    }),
    headers: new Headers(),
    blob: {
      contentType: 'application/octet-stream',
      size: bytes.length,
      url: 'https://example.private.blob.vercel-storage.com/donations/abc.png',
      downloadUrl: 'https://example.private.blob.vercel-storage.com/donations/abc.png',
      pathname: 'donations/abc.png',
      contentDisposition: 'inline',
      cacheControl: 'public, max-age=2592000',
      uploadedAt: new Date(),
      etag: 'etag-value',
    },
  }))
}

/** The blob is missing/inaccessible — `get()`'s documented "not found" result. */
function mockScreenshotUnavailable() {
  vi.mocked(get).mockResolvedValue(null)
}

function makeInput(overrides: Partial<CreateDonationInput> = {}): CreateDonationInput {
  return {
    fullName: 'Asha Rao',
    address: '12 MG Road, Bengaluru',
    amountPaid: 500,
    screenshotUrl: 'https://example.private.blob.vercel-storage.com/donations/abc.png',
    idempotencyKey: randomUUID(),
    ...overrides,
  }
}

/**
 * Runs against a real Postgres (DATABASE_URL) — see vitest.integration.config.ts
 * and CLAUDE.md's testing-strategy note. `@vercel/blob`'s `del`/`get` are
 * mocked; only the database interaction is real, which is the point of this
 * suite. `get` is mocked at the SDK boundary (not `fetch`) so these tests
 * exercise the same private-Blob authenticated-read call
 * `verifyScreenshotIsRealImage` actually makes in production.
 */
describe('createDonation (integration)', () => {
  beforeEach(async () => {
    await resetDatabase()
    vi.restoreAllMocks()
  })

  it('persists a donation with pending status for a valid image', async () => {
    mockScreenshotBytes(PNG_SIGNATURE)

    const result = await createDonation(makeInput(), '203.0.113.1')

    expect(result.outcome).toBe('created')
    if (result.outcome !== 'created') throw new Error('expected outcome "created"')
    expect(result.donation.status).toBe('pending')
    expect(result.donation.amountPaid).toBe(500)

    const rows = await db
      .select()
      .from(donations)
      .where(eq(donations.id, result.donation.id))
    expect(rows).toHaveLength(1)
  })

  it('persists a donation for a valid JPEG', async () => {
    mockScreenshotBytes(JPEG_SIGNATURE)

    const result = await createDonation(makeInput(), '203.0.113.2')

    expect(result.outcome).toBe('created')
  })

  it('persists a donation for a valid WEBP', async () => {
    mockScreenshotBytes(WEBP_SIGNATURE)

    const result = await createDonation(makeInput(), '203.0.113.3')

    expect(result.outcome).toBe('created')
  })

  it('rejects a file whose actual bytes are not a real image, and cleans up the blob', async () => {
    const input = makeInput()
    mockScreenshotBytes(Buffer.from('not an image, just text'))

    const result = await createDonation(input, '203.0.113.1')

    expect(result.outcome).toBe('invalid_screenshot')
    const rows = await db.select().from(donations)
    expect(rows).toHaveLength(0)
    expect(del).toHaveBeenCalledWith(input.screenshotUrl)
  })

  it('rejects (fails safely) and cleans up the blob when the private Blob is missing or inaccessible', async () => {
    const input = makeInput()
    mockScreenshotUnavailable()

    const result = await createDonation(input, '203.0.113.4')

    expect(result.outcome).toBe('invalid_screenshot')
    const rows = await db.select().from(donations)
    expect(rows).toHaveLength(0)
    expect(del).toHaveBeenCalledWith(input.screenshotUrl)
  })

  it('treats a repeated idempotency key as a no-op, not a second row', async () => {
    mockScreenshotBytes(PNG_SIGNATURE)
    const input = makeInput()

    const first = await createDonation(input, '203.0.113.1')
    const second = await createDonation(input, '203.0.113.1')

    expect(first.outcome).toBe('created')
    expect(second.outcome).toBe('duplicate')
    if (first.outcome !== 'created' || second.outcome !== 'duplicate') {
      throw new Error('expected first="created" and second="duplicate"')
    }
    expect(second.donation.id).toBe(first.donation.id)

    const rows = await db
      .select()
      .from(donations)
      .where(eq(donations.idempotencyKey, input.idempotencyKey))
    expect(rows).toHaveLength(1)
  })

  it('enforces the idempotency-key uniqueness constraint at the database level', async () => {
    const key = randomUUID()
    const row = {
      fullName: 'Asha Rao',
      address: '12 MG Road',
      amountPaid: 500,
      screenshotUrl: 'https://example.public.blob.vercel-storage.com/donations/abc.png',
      idempotencyKey: key,
    }

    await db.insert(donations).values(row)
    await expect(db.insert(donations).values(row)).rejects.toThrow()
  })

  it('rate-limits a single IP after MAX_DONATIONS_PER_HOUR submissions', async () => {
    mockScreenshotBytes(PNG_SIGNATURE)
    const ip = '198.51.100.7'

    for (let i = 0; i < MAX_DONATIONS_PER_HOUR; i++) {
      const result = await createDonation(makeInput(), ip)
      expect(result.outcome).toBe('created')
    }

    const limited = await createDonation(makeInput(), ip)
    expect(limited.outcome).toBe('rate_limited')

    const rows = await db.select().from(donations)
    expect(rows).toHaveLength(MAX_DONATIONS_PER_HOUR)
  })

  it('does not rate-limit a different IP', async () => {
    mockScreenshotBytes(PNG_SIGNATURE)

    for (let i = 0; i < MAX_DONATIONS_PER_HOUR; i++) {
      await createDonation(makeInput(), '198.51.100.7')
    }
    const otherIp = await createDonation(makeInput(), '198.51.100.8')

    expect(otherIp.outcome).toBe('created')
  })
})
