import { describe, expect, it } from 'vitest'
import { createDonationSchema } from './validation.js'

const base = {
  fullName: 'Test Donor',
  address: '1 Test Street',
  screenshotUrl: 'https://abc123.private.blob.vercel-storage.com/donations/x.png',
  idempotencyKey: '3f2b8c1e-6d1a-4f0e-9f7e-0a1b2c3d4e5f',
}

describe('createDonationSchema amount', () => {
  it.each([1, 50, 100, 200, 300, 3000])('accepts ₹%i', (amountPaid) => {
    expect(createDonationSchema.safeParse({ ...base, amountPaid }).success).toBe(true)
  })

  it.each([0, -50, 3001, 50.5])('rejects %s', (amountPaid) => {
    expect(createDonationSchema.safeParse({ ...base, amountPaid }).success).toBe(false)
  })
})
