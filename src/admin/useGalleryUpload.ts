import { useCallback, useEffect, useRef, useState } from 'react'
import { uploadPresigned } from '@vercel/blob/client'
import {
  ALLOWED_GALLERY_IMAGE_TYPES,
  MAX_GALLERY_IMAGE_BYTES,
} from '../../shared/galleryLimits'
import { createGalleryImage, ApiError } from './api'
import type { GalleryImage } from '../gallery/galleryApi'

type GalleryUploadState =
  | { status: 'idle' }
  | { status: 'invalid'; message: string }
  | { status: 'selected'; file: File; previewUrl: string }
  | { status: 'uploading'; file: File; previewUrl: string }
  | { status: 'error'; file: File; previewUrl: string; message: string }

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

/**
 * Owns the admin upload flow's file/preview/network lifecycle, separate
 * from the caption text field the caller owns — same split rationale as
 * the donation flow's useScreenshotUpload vs. its confirmation form. Unlike
 * that hook's "uploading" (a simulated local delay, no backend existed
 * yet), this one does a real network round trip: a direct-to-Blob
 * presigned upload, then a metadata POST — the same two-step shape as
 * donationService.ts's real submission flow.
 */
export function useGalleryUpload(onUploaded: (image: GalleryImage) => void) {
  const [state, setState] = useState<GalleryUploadState>({ status: 'idle' })
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  })

  useEffect(() => {
    return () => {
      const current = stateRef.current
      if ('previewUrl' in current) URL.revokeObjectURL(current.previewUrl)
    }
  }, [])

  const selectFile = useCallback((file: File) => {
    // Revoked synchronously, not inside a later setState updater — same
    // fix as useScreenshotUpload's replace-file bug (see CLAUDE.md).
    const current = stateRef.current
    if ('previewUrl' in current) URL.revokeObjectURL(current.previewUrl)

    if (!ALLOWED_GALLERY_IMAGE_TYPES.includes(file.type)) {
      setState({ status: 'invalid', message: 'Please choose a PNG, JPG, or WEBP image.' })
      return
    }
    if (file.size > MAX_GALLERY_IMAGE_BYTES) {
      setState({ status: 'invalid', message: 'Please choose an image under 5MB.' })
      return
    }
    setState({ status: 'selected', file, previewUrl: URL.createObjectURL(file) })
  }, [])

  const cancel = useCallback(() => {
    setState((prev) => {
      if ('previewUrl' in prev) URL.revokeObjectURL(prev.previewUrl)
      return { status: 'idle' }
    })
  }, [])

  const upload = useCallback(
    async (caption: string) => {
      const current = stateRef.current
      if (current.status !== 'selected' && current.status !== 'error') return
      setState({
        status: 'uploading',
        file: current.file,
        previewUrl: current.previewUrl,
      })

      try {
        // Random, never the admin's original filename — same reasoning as
        // donationService.ts's pathname generation.
        const extension = EXTENSION_BY_TYPE[current.file.type] ?? 'bin'
        const pathname = `gallery/${crypto.randomUUID()}.${extension}`

        const blob = await uploadPresigned(pathname, current.file, {
          access: 'private',
          handleUploadUrl: '/api/admin/uploads/gallery',
        })
        const image = await createGalleryImage(blob.url, caption)

        URL.revokeObjectURL(current.previewUrl)
        setState({ status: 'idle' })
        onUploaded(image)
      } catch (err) {
        setState({
          status: 'error',
          file: current.file,
          previewUrl: current.previewUrl,
          message:
            err instanceof ApiError
              ? err.message
              : "We couldn't upload that image. Please try again.",
        })
      }
    },
    [onUploaded],
  )

  return { state, selectFile, cancel, upload }
}
