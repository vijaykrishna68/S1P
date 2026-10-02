import { randomUUID } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { get, del, issueSignedToken } from '@vercel/blob'
import { handleUploadPresigned } from '@vercel/blob/client'
import { db } from '../../db/client.js'
import { resetGalleryImages } from '../../db/testUtils.js'
import { adminUsers, galleryImages } from '../../db/schema.js'
import { createSession } from './auth.js'
import { hashPassword } from './password.js'
import galleryIndexHandler from '../gallery/index.js'
import galleryDeleteHandler from '../gallery/[id].js'
import galleryUploadTokenHandler from '../admin/uploads/gallery.js'

vi.mock('@vercel/blob', async () => {
  const actual = await vi.importActual<typeof import('@vercel/blob')>('@vercel/blob')
  return { ...actual, get: vi.fn(), del: vi.fn(), issueSignedToken: vi.fn() }
})
vi.mock('@vercel/blob/client', async () => {
  const actual =
    await vi.importActual<typeof import('@vercel/blob/client')>('@vercel/blob/client')
  return { ...actual, handleUploadPresigned: vi.fn() }
})

/**
 * Every admin row this file creates is deleted by id in afterEach — this
 * file deliberately never calls resetDatabase() (which truncates
 * admin_users/admin_sessions along with donations), so it can run without
 * disturbing a developer's real seeded admin account or the other
 * integration test files' data. admin_sessions cascades on admin_users
 * delete (see db/schema.ts), so deleting the user is enough.
 */
const createdAdminIds: string[] = []

async function createTestAdmin() {
  const [user] = await db
    .insert(adminUsers)
    .values({
      email: `gallery-route-test-${randomUUID()}@example.com`,
      passwordHash: await hashPassword('irrelevant'),
    })
    .returning()
  createdAdminIds.push(user.id)
  return user
}

function mockRequest(opts: {
  method: string
  sessionToken?: string
  body?: unknown
  id?: string
}): VercelRequest {
  return {
    method: opts.method,
    cookies: opts.sessionToken ? { admin_session: opts.sessionToken } : {},
    query: opts.id ? { id: opts.id } : {},
    body: opts.body,
  } as unknown as VercelRequest
}

function mockResponse() {
  let statusCode = 200
  let jsonBody: unknown
  const headers: Record<string, string> = {}

  const res = {
    status(code: number) {
      statusCode = code
      return res
    },
    json(body: unknown) {
      jsonBody = body
      return res
    },
    setHeader(name: string, value: string) {
      headers[name] = value
      return res
    },
  } as unknown as VercelResponse

  return {
    res,
    getStatus: () => statusCode,
    getJsonBody: () => jsonBody,
    getHeaders: () => headers,
  }
}

describe('gallery routes (integration)', () => {
  beforeEach(async () => {
    await resetGalleryImages()
    vi.mocked(get).mockReset()
    vi.mocked(del).mockReset()
    vi.mocked(issueSignedToken).mockReset()
    vi.mocked(handleUploadPresigned).mockReset()
  })

  afterEach(async () => {
    while (createdAdminIds.length > 0) {
      const id = createdAdminIds.pop()!
      await db.delete(adminUsers).where(eq(adminUsers.id, id))
    }
  })

  describe('GET /api/gallery', () => {
    it('is public — no session required', async () => {
      const { res, getStatus, getJsonBody } = mockResponse()
      await galleryIndexHandler(mockRequest({ method: 'GET' }), res)
      expect(getStatus()).toBe(200)
      expect(getJsonBody()).toEqual({ items: [] })
    })

    it('never includes the underlying blob URL', async () => {
      await db.insert(galleryImages).values({
        blobUrl: 'https://example.private.blob.vercel-storage.com/gallery/secret.png',
        caption: 'A moment',
      })

      const { res, getJsonBody } = mockResponse()
      await galleryIndexHandler(mockRequest({ method: 'GET' }), res)

      const body = getJsonBody() as { items: { imageUrl: string }[] }
      expect(body.items).toHaveLength(1)
      expect(body.items[0].imageUrl).toMatch(/^\/api\/gallery\/.+\/image$/)
      expect(JSON.stringify(body)).not.toContain('blob.vercel-storage.com')
    })
  })

  describe('POST /api/gallery', () => {
    it('rejects an unauthenticated request with 401 and never touches Blob or the database', async () => {
      const { res, getStatus } = mockResponse()
      await galleryIndexHandler(
        mockRequest({
          method: 'POST',
          body: {
            blobUrl: 'https://example.private.blob.vercel-storage.com/gallery/x.png',
          },
        }),
        res,
      )
      expect(getStatus()).toBe(401)
      expect(get).not.toHaveBeenCalled()

      const { res: listRes, getJsonBody } = mockResponse()
      await galleryIndexHandler(mockRequest({ method: 'GET' }), listRes)
      expect((getJsonBody() as { items: unknown[] }).items).toHaveLength(0)
    })

    it('accepts an authenticated admin submitting a real image', async () => {
      const admin = await createTestAdmin()
      const token = await createSession(admin.id)
      const url = 'https://example.private.blob.vercel-storage.com/gallery/real.png'
      vi.mocked(get).mockResolvedValue({
        statusCode: 200,
        stream: new ReadableStream({
          start(controller) {
            controller.enqueue(
              new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
            )
            controller.close()
          },
        }),
        headers: new Headers(),
        blob: {
          contentType: 'image/png',
          size: 8,
          url,
          downloadUrl: url,
          pathname: 'gallery/real.png',
          contentDisposition: 'inline',
          cacheControl: 'public, max-age=2592000',
          uploadedAt: new Date(),
          etag: 'etag',
        },
      })

      const { res, getStatus, getJsonBody } = mockResponse()
      await galleryIndexHandler(
        mockRequest({
          method: 'POST',
          sessionToken: token,
          body: { blobUrl: url, caption: 'A school visit' },
        }),
        res,
      )

      expect(getStatus()).toBe(201)
      expect((getJsonBody() as { caption: string }).caption).toBe('A school visit')
    })

    it('rejects a file that fails image-signature verification', async () => {
      const admin = await createTestAdmin()
      const token = await createSession(admin.id)
      const url = 'https://example.private.blob.vercel-storage.com/gallery/fake.png'
      vi.mocked(get).mockResolvedValue({
        statusCode: 200,
        stream: new ReadableStream({
          start(controller) {
            controller.enqueue(new Uint8Array([0, 1, 2, 3]))
            controller.close()
          },
        }),
        headers: new Headers(),
        blob: {
          contentType: 'image/png',
          size: 4,
          url,
          downloadUrl: url,
          pathname: 'gallery/fake.png',
          contentDisposition: 'inline',
          cacheControl: 'public, max-age=2592000',
          uploadedAt: new Date(),
          etag: 'etag',
        },
      })

      const { res, getStatus } = mockResponse()
      await galleryIndexHandler(
        mockRequest({ method: 'POST', sessionToken: token, body: { blobUrl: url } }),
        res,
      )

      expect(getStatus()).toBe(400)
      expect(del).toHaveBeenCalledWith(url)
    })

    it('rejects a request body that is not a valid Vercel Blob URL', async () => {
      const admin = await createTestAdmin()
      const token = await createSession(admin.id)

      const { res, getStatus } = mockResponse()
      await galleryIndexHandler(
        mockRequest({
          method: 'POST',
          sessionToken: token,
          body: { blobUrl: 'https://evil.example.com/not-a-blob.png' },
        }),
        res,
      )

      expect(getStatus()).toBe(400)
      expect(get).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /api/gallery/[id]', () => {
    it('rejects an unauthenticated request with 401 and never touches Blob', async () => {
      const [image] = await db
        .insert(galleryImages)
        .values({
          blobUrl: 'https://example.private.blob.vercel-storage.com/gallery/x.png',
        })
        .returning()

      const { res, getStatus } = mockResponse()
      await galleryDeleteHandler(mockRequest({ method: 'DELETE', id: image.id }), res)

      expect(getStatus()).toBe(401)
      expect(del).not.toHaveBeenCalled()
    })

    it('deletes for an authenticated admin', async () => {
      const admin = await createTestAdmin()
      const token = await createSession(admin.id)
      const [image] = await db
        .insert(galleryImages)
        .values({
          blobUrl: 'https://example.private.blob.vercel-storage.com/gallery/x.png',
        })
        .returning()
      vi.mocked(del).mockResolvedValue(undefined)

      const { res, getStatus, getJsonBody } = mockResponse()
      await galleryDeleteHandler(
        mockRequest({ method: 'DELETE', sessionToken: token, id: image.id }),
        res,
      )

      expect(getStatus()).toBe(200)
      expect(getJsonBody()).toEqual({ ok: true })
      expect(del).toHaveBeenCalledWith(image.blobUrl)
    })

    it('returns 404 for a nonexistent image', async () => {
      const admin = await createTestAdmin()
      const token = await createSession(admin.id)

      const { res, getStatus } = mockResponse()
      await galleryDeleteHandler(
        mockRequest({ method: 'DELETE', sessionToken: token, id: randomUUID() }),
        res,
      )

      expect(getStatus()).toBe(404)
    })
  })

  describe('POST /api/admin/uploads/gallery', () => {
    it('rejects an unauthenticated request with 401 and never issues a signed token', async () => {
      const { res, getStatus } = mockResponse()
      await galleryUploadTokenHandler(mockRequest({ method: 'POST', body: {} }), res)

      expect(getStatus()).toBe(401)
      expect(issueSignedToken).not.toHaveBeenCalled()
      expect(handleUploadPresigned).not.toHaveBeenCalled()
    })

    it('proceeds to handleUploadPresigned for an authenticated admin', async () => {
      const admin = await createTestAdmin()
      const token = await createSession(admin.id)
      vi.mocked(handleUploadPresigned).mockResolvedValue({
        type: 'blob.generate-client-token',
      } as never)

      const { res, getStatus } = mockResponse()
      await galleryUploadTokenHandler(
        mockRequest({ method: 'POST', sessionToken: token, body: {} }),
        res,
      )

      expect(getStatus()).toBe(200)
      expect(handleUploadPresigned).toHaveBeenCalledTimes(1)
    })
  })
})
