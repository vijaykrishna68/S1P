import { randomUUID } from 'node:crypto'
import { Writable } from 'node:stream'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { get } from '@vercel/blob'
import { db } from '../../../../db/client.js'
import { resetDatabase } from '../../../../db/testUtils.js'
import { adminUsers, donations } from '../../../../db/schema.js'
import { createSession } from '../../../_lib/auth.js'
import { hashPassword } from '../../../_lib/password.js'
import handler from './screenshot.js'

// The route's only Blob dependency is `get()` — mocked so this test never
// needs a real Blob network call, while donation lookup and admin-session
// verification still run against the real Postgres from
// vitest.integration.config.ts (the database behavior is what actually
// matters here: which donation, whose session).
vi.mock('@vercel/blob', () => ({ get: vi.fn() }))

async function createTestAdmin() {
  const [user] = await db
    .insert(adminUsers)
    .values({
      email: 'admin@example.com',
      passwordHash: await hashPassword('irrelevant'),
    })
    .returning()
  return user
}

async function insertDonation(overrides: Partial<typeof donations.$inferInsert> = {}) {
  const [row] = await db
    .insert(donations)
    .values({
      fullName: 'Asha Rao',
      address: '12 MG Road',
      amountPaid: 500,
      screenshotUrl:
        'https://o4wocoukxzqczn4w.private.blob.vercel-storage.com/donations/real.png',
      idempotencyKey: randomUUID(),
      ...overrides,
    })
    .returning()
  return row
}

function mockRequest(opts: {
  id?: string
  sessionToken?: string
  extraQuery?: Record<string, string>
}): VercelRequest {
  return {
    method: 'GET',
    cookies: opts.sessionToken ? { admin_session: opts.sessionToken } : {},
    query: { id: opts.id, ...opts.extraQuery },
  } as unknown as VercelRequest
}

/**
 * `VercelResponse` is a real Node `Writable` (it extends `http.ServerResponse`
 * under the hood), which is what `Readable.fromWeb(...).pipe(res)` in the
 * handler requires — a plain object stub can't be piped to. This captures
 * everything written to it so tests can assert on the streamed body, not
 * just the status/headers a JSON mock would normally expose.
 */
function mockResponse() {
  const chunks: Buffer[] = []
  const headers: Record<string, string> = {}
  let statusCode = 200
  let jsonBody: unknown

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
    jsonBody = body
    res.end()
    return res
  }) as VercelResponse['json']

  const finished = new Promise<void>((resolve) => res.on('finish', resolve))

  return {
    res,
    finished,
    getStatus: () => statusCode,
    getHeaders: () => headers,
    getJsonBody: () => jsonBody,
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

/** Runs against a real Postgres — see vitest.integration.config.ts. */
describe('GET /api/admin/donations/[id]/screenshot (integration)', () => {
  beforeEach(async () => {
    await resetDatabase()
    vi.mocked(get).mockReset()
  })

  it('rejects an unauthenticated request with 401 and never touches the donation or Blob', async () => {
    const donation = await insertDonation()
    const { res, finished, getStatus } = mockResponse()

    await handler(mockRequest({ id: donation.id }), res)
    await finished

    expect(getStatus()).toBe(401)
    expect(get).not.toHaveBeenCalled()
  })

  it('streams the screenshot for an authenticated admin with a valid donation', async () => {
    const admin = await createTestAdmin()
    const token = await createSession(admin.id)
    const donation = await insertDonation()
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
    vi.mocked(get).mockResolvedValue({
      statusCode: 200,
      stream: fakeImageStream(bytes),
      headers: new Headers(),
      blob: {
        contentType: 'image/png',
        size: bytes.length,
        url: donation.screenshotUrl,
        downloadUrl: donation.screenshotUrl,
        pathname: 'donations/real.png',
        contentDisposition: 'inline',
        cacheControl: 'public, max-age=2592000',
        uploadedAt: new Date(),
        etag: 'etag-value',
      },
    })

    const { res, finished, getStatus, getHeaders, getStreamedBody } = mockResponse()
    await handler(mockRequest({ id: donation.id, sessionToken: token }), res)
    await finished

    expect(getStatus()).toBe(200)
    expect(getHeaders()['Content-Type']).toBe('image/png')
    expect(getHeaders()['Cache-Control']).toBe('private, no-store')
    expect(getStreamedBody()).toEqual(Buffer.from(bytes))
    expect(get).toHaveBeenCalledWith(donation.screenshotUrl, { access: 'private' })
  })

  it('returns 404 for a nonexistent donation', async () => {
    const admin = await createTestAdmin()
    const token = await createSession(admin.id)
    const { res, finished, getStatus } = mockResponse()

    await handler(mockRequest({ id: randomUUID(), sessionToken: token }), res)
    await finished

    expect(getStatus()).toBe(404)
    expect(get).not.toHaveBeenCalled()
  })

  it('returns 404 when the Blob store has no object for this donation', async () => {
    const admin = await createTestAdmin()
    const token = await createSession(admin.id)
    const donation = await insertDonation()
    vi.mocked(get).mockResolvedValue(null)

    const { res, finished, getStatus } = mockResponse()
    await handler(mockRequest({ id: donation.id, sessionToken: token }), res)
    await finished

    expect(getStatus()).toBe(404)
  })

  it("ignores any client-supplied pathname/url and only ever fetches the requested donation's own screenshot", async () => {
    const admin = await createTestAdmin()
    const token = await createSession(admin.id)
    const donation = await insertDonation()
    const other = await insertDonation({
      screenshotUrl:
        'https://o4wocoukxzqczn4w.private.blob.vercel-storage.com/donations/other.png',
    })
    vi.mocked(get).mockResolvedValue(null)

    const { res, finished } = mockResponse()
    await handler(
      mockRequest({
        id: donation.id,
        sessionToken: token,
        // An attacker-controlled query string trying to redirect the fetch
        // to a different blob — the handler never reads these.
        extraQuery: { pathname: other.screenshotUrl, url: other.screenshotUrl },
      }),
      res,
    )
    await finished

    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith(donation.screenshotUrl, { access: 'private' })
    expect(get).not.toHaveBeenCalledWith(other.screenshotUrl, expect.anything())
  })
})
