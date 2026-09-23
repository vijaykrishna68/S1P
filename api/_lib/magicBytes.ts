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

export {
  ALLOWED_SCREENSHOT_TYPES,
  MAX_SCREENSHOT_BYTES,
} from '../../shared/screenshotLimits.js'
