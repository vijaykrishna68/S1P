import { randomUUID } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { get, del } from '@vercel/blob'
import { db } from '../../db/client.js'
import { resetGalleryImages } from '../../db/testUtils.js'
import { galleryImages } from '../../db/schema.js'
import {
  createGalleryImage,
  deleteGalleryImage,
  getGalleryImageById,
  listGalleryImages,
  toPublicGalleryImage,
} from './gallery.js'

// Deliberately does NOT use resetDatabase() — this file only ever touches
// gallery_images (via resetGalleryImages()), never donations/admin_users/
// rate_limits, so running it never disturbs a developer's seeded admin
// account or other integration test files' data.
vi.mock('@vercel/blob', async () => {
  const actual = await vi.importActual<typeof import('@vercel/blob')>('@vercel/blob')
  return { ...actual, get: vi.fn(), del: vi.fn() }
})

function fakeImageStream(bytes: Uint8Array): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    },
  })
}

const REAL_PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const NOT_AN_IMAGE_BYTES = new Uint8Array([0x00, 0x01, 0x02, 0x03])

async function insertGalleryImage(overrides: Partial<typeof galleryImages.$inferInsert> = {}) {
  const [row] = await db
    .insert(galleryImages)
    .values({
      blobUrl: `https://example.private.blob.vercel-storage.com/gallery/${randomUUID()}.png`,
      ...overrides,
    })
    .returning()
  return row
}

/** Runs against a real Postgres — see vitest.integration.config.ts. Run in
 * isolation (not via the blanket `npm run test:integration`) to avoid
 * pulling in the other integration files' own cleanup, though
 * fileParallelism:false makes running everything together safe too. */
describe('gallery images (integration)', () => {
  beforeEach(async () => {
    await resetGalleryImages()
    vi.mocked(get).mockReset()
    vi.mocked(del).mockReset()
  })

  describe('createGalleryImage', () => {
    it('accepts a real image and stores it', async () => {
      const url = 'https://example.private.blob.vercel-storage.com/gallery/real.png'
      vi.mocked(get).mockResolvedValue({
        statusCode: 200,
        stream: fakeImageStream(REAL_PNG_BYTES),
        headers: new Headers(),
        blob: {
          contentType: 'image/png',
          size: REAL_PNG_BYTES.length,
          url,
          downloadUrl: url,
          pathname: 'gallery/real.png',
          contentDisposition: 'inline',
          cacheControl: 'public, max-age=2592000',
          uploadedAt: new Date(),
          etag: 'etag-value',
        },
      })

      const result = await createGalleryImage({ blobUrl: url, caption: 'A school visit' })

      expect(result.outcome).toBe('created')
      if (result.outcome !== 'created') throw new Error('unreachable')
      expect(result.image.blobUrl).toBe(url)
      expect(result.image.caption).toBe('A school visit')
      expect(del).not.toHaveBeenCalled()
    })

    it('rejects a file whose bytes are not a real image and cleans up the blob', async () => {
      const url = 'https://example.private.blob.vercel-storage.com/gallery/fake.png'
      vi.mocked(get).mockResolvedValue({
        statusCode: 200,
        stream: fakeImageStream(NOT_AN_IMAGE_BYTES),
        headers: new Headers(),
        blob: {
          contentType: 'image/png',
          size: NOT_AN_IMAGE_BYTES.length,
          url,
          downloadUrl: url,
          pathname: 'gallery/fake.png',
          contentDisposition: 'inline',
          cacheControl: 'public, max-age=2592000',
          uploadedAt: new Date(),
          etag: 'etag-value',
        },
      })

      const result = await createGalleryImage({ blobUrl: url })

      expect(result.outcome).toBe('invalid_image')
      expect(del).toHaveBeenCalledWith(url)
      const rows = await listGalleryImages()
      expect(rows).toHaveLength(0)
    })

    it('stores no caption as null, not an empty string', async () => {
      const url = 'https://example.private.blob.vercel-storage.com/gallery/nocaption.png'
      vi.mocked(get).mockResolvedValue({
        statusCode: 200,
        stream: fakeImageStream(REAL_PNG_BYTES),
        headers: new Headers(),
        blob: {
          contentType: 'image/png',
          size: REAL_PNG_BYTES.length,
          url,
          downloadUrl: url,
          pathname: 'gallery/nocaption.png',
          contentDisposition: 'inline',
          cacheControl: 'public, max-age=2592000',
          uploadedAt: new Date(),
          etag: 'etag-value',
        },
      })

      const result = await createGalleryImage({ blobUrl: url, caption: '  ' })

      expect(result.outcome).toBe('created')
      if (result.outcome !== 'created') throw new Error('unreachable')
      expect(result.image.caption).toBeNull()
    })
  })

  describe('listGalleryImages', () => {
    it('orders newest first', async () => {
      const first = await insertGalleryImage({ createdAt: new Date('2026-01-01T00:00:00Z') })
      await insertGalleryImage({ createdAt: new Date('2026-01-02T00:00:00Z') })
      const third = await insertGalleryImage({ createdAt: new Date('2026-01-03T00:00:00Z') })

      const rows = await listGalleryImages()

      expect(rows).toHaveLength(3)
      expect(rows[0].id).toBe(third.id)
      expect(rows[2].id).toBe(first.id)
    })

    it('returns an empty list with no images', async () => {
      expect(await listGalleryImages()).toEqual([])
    })
  })

  describe('getGalleryImageById', () => {
    it('returns the matching row', async () => {
      const inserted = await insertGalleryImage()
      const found = await getGalleryImageById(inserted.id)
      expect(found?.id).toBe(inserted.id)
    })

    it('returns null for a nonexistent id', async () => {
      expect(await getGalleryImageById(randomUUID())).toBeNull()
    })
  })

  describe('deleteGalleryImage', () => {
    it('removes the row and cleans up the blob', async () => {
      const inserted = await insertGalleryImage()
      vi.mocked(del).mockResolvedValue(undefined)

      const deleted = await deleteGalleryImage(inserted.id)

      expect(deleted?.id).toBe(inserted.id)
      expect(del).toHaveBeenCalledWith(inserted.blobUrl)
      expect(await getGalleryImageById(inserted.id)).toBeNull()
    })

    it('returns null for a nonexistent id and never touches Blob', async () => {
      expect(await deleteGalleryImage(randomUUID())).toBeNull()
      expect(del).not.toHaveBeenCalled()
    })

    it('still removes the row even if the blob cleanup itself fails', async () => {
      const inserted = await insertGalleryImage()
      vi.mocked(del).mockRejectedValue(new Error('network blip'))

      const deleted = await deleteGalleryImage(inserted.id)

      expect(deleted?.id).toBe(inserted.id)
      expect(await getGalleryImageById(inserted.id)).toBeNull()
    })
  })

  describe('toPublicGalleryImage', () => {
    it('never exposes blobUrl, only the streaming route path', () => {
      const row = {
        id: 'abc-123',
        blobUrl: 'https://example.private.blob.vercel-storage.com/gallery/secret.png',
        caption: 'Hello',
        createdAt: new Date('2026-01-01T00:00:00Z'),
      }

      const publicShape = toPublicGalleryImage(row)

      expect(publicShape).toEqual({
        id: 'abc-123',
        imageUrl: '/api/gallery/abc-123/image',
        caption: 'Hello',
        createdAt: '2026-01-01T00:00:00.000Z',
      })
      expect(JSON.stringify(publicShape)).not.toContain('blob.vercel-storage.com')
    })
  })
})
