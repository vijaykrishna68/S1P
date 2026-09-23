import { randomUUID } from 'node:crypto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../db/client'
import { resetDatabase } from '../../db/testUtils'
import { donations } from '../../db/schema'
import {
  getDonationById,
  getDonationSummary,
  listDonations,
  updateDonationStatus,
} from './donations'

async function insertDonation(overrides: Partial<typeof donations.$inferInsert> = {}) {
  const [row] = await db
    .insert(donations)
    .values({
      fullName: 'Asha Rao',
      address: '12 MG Road',
      amountPaid: 500,
      screenshotUrl: 'https://example.public.blob.vercel-storage.com/donations/abc.png',
      idempotencyKey: randomUUID(),
      ...overrides,
    })
    .returning()
  return row
}

/** Runs against a real Postgres — see vitest.integration.config.ts. */
describe('admin donation queries (integration)', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  describe('listDonations', () => {
    it('paginates and orders by createdAt descending', async () => {
      const first = await insertDonation({ createdAt: new Date('2026-01-01T00:00:00Z') })
      const second = await insertDonation({ createdAt: new Date('2026-01-02T00:00:00Z') })
      await insertDonation({ createdAt: new Date('2026-01-03T00:00:00Z') })

      const page1 = await listDonations({ page: 1, pageSize: 2 })
      expect(page1.total).toBe(3)
      expect(page1.items).toHaveLength(2)
      expect(page1.items[0].createdAt.toISOString()).toBe('2026-01-03T00:00:00.000Z')

      const page2 = await listDonations({ page: 2, pageSize: 2 })
      expect(page2.items).toHaveLength(1)
      expect(page2.items[0].id).toBe(first.id)
      expect(page2.items[0].id).not.toBe(second.id)
    })

    it('filters by status', async () => {
      const pending = await insertDonation({ status: 'pending' })
      await insertDonation({ status: 'reviewed' })

      const result = await listDonations({ page: 1, pageSize: 10, status: 'pending' })

      expect(result.total).toBe(1)
      expect(result.items[0].id).toBe(pending.id)
    })
  })

  describe('getDonationById', () => {
    it('returns the matching row', async () => {
      const inserted = await insertDonation()
      const found = await getDonationById(inserted.id)
      expect(found?.id).toBe(inserted.id)
    })

    it('returns null for a nonexistent id', async () => {
      expect(await getDonationById(randomUUID())).toBeNull()
    })
  })

  describe('updateDonationStatus', () => {
    it('updates the status and returns the updated row', async () => {
      const inserted = await insertDonation({ status: 'pending' })
      const updated = await updateDonationStatus(inserted.id, 'reviewed')
      expect(updated?.status).toBe('reviewed')

      const reloaded = await getDonationById(inserted.id)
      expect(reloaded?.status).toBe('reviewed')
    })

    it('returns null for a nonexistent id', async () => {
      expect(await updateDonationStatus(randomUUID(), 'reviewed')).toBeNull()
    })
  })

  describe('getDonationSummary', () => {
    it('computes totals across all donations regardless of status', async () => {
      await insertDonation({ amountPaid: 300, status: 'pending' })
      await insertDonation({ amountPaid: 700, status: 'reviewed' })
      await insertDonation({ amountPaid: 1000, status: 'rejected' })

      const summary = await getDonationSummary()

      expect(summary).toEqual({ totalCount: 3, totalAmount: 2000, pendingCount: 1 })
    })

    it('returns zeroed values with no donations', async () => {
      expect(await getDonationSummary()).toEqual({
        totalCount: 0,
        totalAmount: 0,
        pendingCount: 0,
      })
    })
  })
})
