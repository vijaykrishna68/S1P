import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@vercel/blob', () => ({ del: vi.fn() }))

import { db } from '../../db/client.js'
import { resetDatabase } from '../../db/testUtils.js'
import { donations } from '../../db/schema.js'
import { createDonation } from './donations.js'
import { MAX_DONATIONS_PER_HOUR } from './rateLimit.js'
import type { CreateDonationInput } from './validation.js'

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0, 0,
])

function mockScreenshotBytes(bytes: Buffer) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      arrayBuffer: async () =>
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    })),
  )
}

function makeInput(overrides: Partial<CreateDonationInput> = {}): CreateDonationInput {
  return {
    fullName: 'Asha Rao',
    address: '12 MG Road, Bengaluru',
    amountPaid: 500,
    screenshotUrl: 'https://example.public.blob.vercel-storage.com/donations/abc.png',
    idempotencyKey: randomUUID(),
    ...overrides,
  }
}

/**
 * Runs against a real Postgres (DATABASE_URL) — see vitest.integration.config.ts
 * and CLAUDE.md's testing-strategy note. `@vercel/blob` and the screenshot
 * fetch are mocked; only the database interaction is real, which is the
 * point of this suite.
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

  it('rejects a file whose actual bytes are not a real image', async () => {
    mockScreenshotBytes(Buffer.from('not an image, just text'))

    const result = await createDonation(makeInput(), '203.0.113.1')

    expect(result.outcome).toBe('invalid_screenshot')
    const rows = await db.select().from(donations)
    expect(rows).toHaveLength(0)
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
