import { get } from '@vercel/blob'

const SIGNATURES: { type: string; bytes: number[] }[] = [
  { type: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { type: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  // WEBP: "RIFF"...."WEBP" — bytes 0-3 and 8-11, not contiguous.
]

/**
 * Checks the file's actual leading bytes against known image signatures,
 * rather than trusting the Content-Type the browser reported during upload
 * (which is present but not enforced against the real bytes anywhere in the
 * upload path — see api/uploads/screenshot.ts). A file renamed to end in
 * .png doesn't pass this check unless it's actually a PNG.
 */
export function sniffImageType(buffer: Buffer): string | null {
  for (const { type, bytes } of SIGNATURES) {
    if (buffer.length >= bytes.length && bytes.every((byte, i) => buffer[i] === byte)) {
      return type
    }
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp'
  }
  return null
}

// Matches sniffImageType's longest signature check (WEBP: "RIFF" at 0-3,
// "WEBP" at 8-11).
export const MAGIC_BYTE_SNIFF_LENGTH = 16

/**
 * Reads only the leading bytes of a Blob stream needed for signature
 * sniffing, then cancels it — uploaded images can be several MB, and nothing
 * downstream needs the rest of the file just to check the first few bytes.
 */
export async function readLeadingBytes(
  stream: ReadableStream<Uint8Array>,
  maxBytes: number,
): Promise<Buffer> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (total < maxBytes) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      total += value.length
    }
  } finally {
    await reader.cancel().catch(() => {})
  }
  return Buffer.concat(chunks).subarray(0, maxBytes)
}

/**
 * Confirms a blob's actual bytes are a real image, rather than trusting
 * whatever Content-Type was recorded at upload time. Shared by
 * api/_lib/donations.ts (payment screenshots) and api/_lib/gallery.ts
 * (gallery photos) — both kinds of upload live in this project's one Blob
 * store, which is genuinely configured Private (see CLAUDE.md's OIDC
 * migration note), so both read via `get(url, { access: 'private' })`,
 * resolving the same OIDC credentials (`VERCEL_OIDC_TOKEN` + `BLOB_STORE_ID`)
 * the upload routes already rely on — no `BLOB_READ_WRITE_TOKEN` involved. A
 * missing/inaccessible blob is treated as verification failure; an
 * unexpected SDK error still propagates uncaught, surfacing as the caller's
 * existing generic 500.
 */
export async function verifyBlobIsRealImage(url: string): Promise<boolean> {
  const result = await get(url, { access: 'private' })
  if (!result || result.statusCode !== 200) return false
  const buffer = await readLeadingBytes(result.stream, MAGIC_BYTE_SNIFF_LENGTH)
  return sniffImageType(buffer) !== null
}

export {
  ALLOWED_SCREENSHOT_TYPES,
  MAX_SCREENSHOT_BYTES,
} from '../../shared/screenshotLimits.js'
