import { z } from 'zod'
import { MIN_DONATION_AMOUNT, MAX_DONATION_AMOUNT } from '../../shared/donationLimits'

/**
 * Server-side re-validation of exactly the same rule the frontend already
 * enforces (src/components/donation/confirmationFormReducer.ts's
 * validateConfirmationForm). The client check exists for UX; this one exists
 * because the client can never be trusted — anyone can POST directly to this
 * endpoint bypassing the browser entirely.
 */
export const createDonationSchema = z.object({
  fullName: z.string().trim().min(1, 'Please enter your name.').max(200),
  address: z.string().trim().min(1, 'Please enter your address.').max(1000),
  amountPaid: z
    .number()
    .int('Amount must be a whole number of rupees.')
    .min(MIN_DONATION_AMOUNT, `Amount must be at least ₹${MIN_DONATION_AMOUNT}.`)
    .max(MAX_DONATION_AMOUNT, `Amount must be at most ₹${MAX_DONATION_AMOUNT}.`),
  screenshotUrl: z
    .string()
    .url('Invalid screenshot reference.')
    // Matches the exact suffix @vercel/blob's own SDK checks internally.
    .refine((url) => new URL(url).hostname.endsWith('.blob.vercel-storage.com'), {
      message: 'Screenshot must be a Vercel Blob URL.',
    }),
  idempotencyKey: z.string().uuid('Invalid idempotency key.'),
})

export type CreateDonationInput = z.infer<typeof createDonationSchema>

export const updateDonationStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'rejected']),
})

export const listDonationsQuerySchema = z.object({
  status: z.enum(['pending', 'reviewed', 'rejected']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email.'),
  password: z.string().min(1, 'Password is required.'),
})
