import { desc, eq } from 'drizzle-orm'
import { db } from '../../db/client.js'
import { galleryImages } from '../../db/schema.js'
import { verifyBlobIsRealImage } from './magicBytes.js'
import { safeDeleteBlob } from './blobCleanup.js'
import type { CreateGalleryImageInput } from './validation.js'

export type GalleryImageRow = typeof galleryImages.$inferSelect

export type CreateGalleryImageResult =
  { outcome: 'created'; image: GalleryImageRow } | { outcome: 'invalid_image' }

/** The shape ever sent to the browser — `blobUrl` (the private Blob
 * reference) never leaves this module. `imageUrl` is this project's own
 * public streaming route, not a direct Blob URL. */
export interface PublicGalleryImage {
  id: string
  imageUrl: string
  caption: string | null
  createdAt: string
}

export function toPublicGalleryImage(row: GalleryImageRow): PublicGalleryImage {
  return {
    id: row.id,
    imageUrl: `/api/gallery/${row.id}/image`,
    caption: row.caption,
    createdAt: row.createdAt.toISOString(),
  }
}

/**
 * No idempotency/rate-limit handling here, unlike createDonation — this is
 * an admin-only, low-frequency, authenticated action (gated by requireAdmin
 * at the route level), not a public endpoint anyone can hit repeatedly.
 */
export async function createGalleryImage(
  input: CreateGalleryImageInput,
): Promise<CreateGalleryImageResult> {
  const isRealImage = await verifyBlobIsRealImage(input.blobUrl)
  if (!isRealImage) {
    await safeDeleteBlob(input.blobUrl)
    return { outcome: 'invalid_image' }
  }

  const [inserted] = await db
    .insert(galleryImages)
    .values({ blobUrl: input.blobUrl, caption: input.caption?.trim() || null })
    .returning()

  return { outcome: 'created', image: inserted }
}

/** Newest first — same convention as listDonations. */
export async function listGalleryImages(): Promise<GalleryImageRow[]> {
  return db.select().from(galleryImages).orderBy(desc(galleryImages.createdAt))
}

export async function getGalleryImageById(id: string): Promise<GalleryImageRow | null> {
  const [row] = await db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.id, id))
    .limit(1)
  return row ?? null
}

/**
 * Deletes the DB row first, then best-effort cleans up the underlying blob
 * — the row is the actual source of truth for "is this still in the
 * gallery," so removing it is what must succeed for the public page to stop
 * showing the image; a lingering orphaned blob afterward is the same
 * accepted minor cost as createDonation's cleanup path.
 */
export async function deleteGalleryImage(id: string): Promise<GalleryImageRow | null> {
  const [deleted] = await db
    .delete(galleryImages)
    .where(eq(galleryImages.id, id))
    .returning()
  if (!deleted) return null
  await safeDeleteBlob(deleted.blobUrl)
  return deleted
}
