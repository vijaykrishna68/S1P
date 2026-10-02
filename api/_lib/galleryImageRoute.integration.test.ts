import { randomUUID } from 'node:crypto'
import { Writable } from 'node:stream'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { get } from '@vercel/blob'
import { db } from '../../db/client.js'
import { resetGalleryImages } from '../../db/testUtils.js'
import { galleryImages } from '../../db/schema.js'
import handler from '../gallery/[id]/image.js'

// Same mocking approach as adminScreenshotRoute.integration.test.ts: the
// route's only Blob dependency is get(), mocked so this never needs a real
// Blob network call, while the database lookup runs against the real
// Postgres from vitest.integration.config.ts.
vi.mock('@vercel/blob', () => ({ get: vi.fn() }))

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

function mockRequest(opts: { id?: string; extraQuery?: Record<string, string> }): VercelRequest {
  return { method: 'GET', query: { id: opts.id, ...opts.extraQuery } } as unknown as VercelRequest
}

/** Same Writable-based response mock as adminScreenshotRoute.integration.test.ts
 * — VercelResponse is a real Node Writable, which Readable.fromWeb(...).pipe(res)
 * requires. */
function mockResponse() {
  const chunks: Buffer[] = []
  const headers: Record<string, string> = {}
  let statusCode = 200

  const res = new Writable({
    write(chunk, _enc, callback) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      callback()
    },
  }) as unknown as VercelResponse

  res.status = ((code: number) => {
    statusCode = code
    return res
  }) as VercelResponse['status']
  res.setHeader = ((name: string, value: string) => {
    headers[name] = value
    return res
  }) as VercelResponse['setHeader']
  res.json = ((body: unknown) => {
    ;(res as unknown as { _jsonBody: unknown })._jsonBody = body
    res.end()
    return res
  }) as VercelResponse['json']

  const finished = new Promise<void>((resolve) => res.on('finish', resolve))

  return {
    res,
    finished,
    getStatus: () => statusCode,
    getHeaders: () => headers,
    getStreamedBody: () => Buffer.concat(chunks),
  }
}

function fakeImageStream(bytes: Uint8Array): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    },
  })
}

/** Runs against a real Postgres — see vitest.integration.config.ts. Uses
 * resetGalleryImages(), not resetDatabase(), so it never touches
 * donations/admin_users. */
describe('GET /api/gallery/[id]/image (integration)', () => {
  beforeEach(async () => {
    await resetGalleryImages()
    vi.mocked(get).mockReset()
  })

  it('serves the image with no authentication required', async () => {
    const image = await insertGalleryImage()
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
    vi.mocked(get).mockResolvedValue({
      statusCode: 200,
      stream: fakeImageStream(bytes),
      headers: new Headers(),
      blob: {
        contentType: 'image/png',
        size: bytes.length,
        url: image.blobUrl,
        downloadUrl: image.blobUrl,
        pathname: 'gallery/real.png',
        contentDisposition: 'inline',
        cacheControl: 'public, max-age=2592000',
        uploadedAt: new Date(),
        etag: 'etag',
      },
    })

    const { res, finished, getStatus, getHeaders, getStreamedBody } = mockResponse()
    await handler(mockRequest({ id: image.id }), res)
    await finished

    expect(getStatus()).toBe(200)
    expect(getHeaders()['Content-Type']).toBe('image/png')
    expect(getHeaders()['Cache-Control']).toBe('public, max-age=86400')
    expect(getStreamedBody()).toEqual(Buffer.from(bytes))
    expect(get).toHaveBeenCalledWith(image.blobUrl, { access: 'private' })
  })

  it('returns 404 for a nonexistent image and never calls Blob', async () => {
    const { res, finished, getStatus } = mockResponse()
    await handler(mockRequest({ id: randomUUID() }), res)
    await finished

    expect(getStatus()).toBe(404)
    expect(get).not.toHaveBeenCalled()
  })

  it("ignores any client-supplied path and only ever fetches the requested image's own blob", async () => {
    const image = await insertGalleryImage()
    const other = await insertGalleryImage()
    vi.mocked(get).mockResolvedValue(null)

    const { res, finished } = mockResponse()
    await handler(
      mockRequest({ id: image.id, extraQuery: { url: other.blobUrl, path: other.blobUrl } }),
      res,
    )
    await finished

    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith(image.blobUrl, { access: 'private' })
    expect(get).not.toHaveBeenCalledWith(other.blobUrl, expect.anything())
  })
})
