import { useCallback, useEffect, useRef, useState } from 'react'
import type { UploadState } from './types'
import {
  ALLOWED_SCREENSHOT_TYPES,
  MAX_SCREENSHOT_BYTES,
} from '../../../shared/screenshotLimits'

/**
 * Owns the payment-screenshot upload state machine, separate from the rest
 * of the confirmation form's field state (see CLAUDE.md's form-architecture
 * note on why these are split).
 *
 * "uploading" here is local file processing (generating a preview URL), not
 * a network request — there is no backend yet, so nothing is actually
 * transferred until the whole form submits via donationService. Simulating
 * a "successful upload to a server" would misrepresent what's happening; a
 * short, honest, client-side processing delay is used instead so the state
 * is perceivable rather than an instant flash.
 */
export function useScreenshotUpload() {
  const [state, setState] = useState<UploadState>({ status: 'empty' })
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  })

  useEffect(() => {
    return () => {
      const current = stateRef.current
      if (current.status === 'uploaded') URL.revokeObjectURL(current.previewUrl)
    }
  }, [])

  const selectFile = useCallback((file: File) => {
    if (!ALLOWED_SCREENSHOT_TYPES.includes(file.type)) {
      setState({ status: 'invalid', message: 'Please upload a PNG, JPG, or WEBP image.' })
      return
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      setState({ status: 'invalid', message: 'Please upload an image under 8MB.' })
      return
    }

    // Revoked here, synchronously, rather than inside the setTimeout below —
    // that callback's own setState only ever sees the 'uploading' state this
    // function is about to set, never the 'uploaded' state being replaced, so
    // checking `prev.status === 'uploaded'` there could never actually catch
    // a replace. Found by a test asserting the revoke call, not by reading
    // this code — see useScreenshotUpload.test.ts and CLAUDE.md.
    if (stateRef.current.status === 'uploaded') {
      URL.revokeObjectURL(stateRef.current.previewUrl)
    }

    setState({ status: 'uploading', fileName: file.name })
    window.setTimeout(() => {
      const previewUrl = URL.createObjectURL(file)
      setState({ status: 'uploaded', file, fileName: file.name, previewUrl })
    }, 500)
  }, [])

  const removeFile = useCallback(() => {
    setState((prev) => {
      if (prev.status === 'uploaded') URL.revokeObjectURL(prev.previewUrl)
      return { status: 'empty' }
    })
  }, [])

  return { state, selectFile, removeFile }
}
