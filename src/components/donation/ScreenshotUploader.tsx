import { useState, type ChangeEvent, type DragEvent } from 'react'
import {
  ArrowsClockwise,
  CircleNotch,
  Trash,
  UploadSimple,
  WarningCircle,
} from '@phosphor-icons/react'
import type { UploadState } from './types'

interface ScreenshotUploaderProps {
  state: UploadState
  onSelectFile: (file: File) => void
  onRemoveFile: () => void
  formError?: string
}

const ACCEPT = 'image/png,image/jpeg,image/webp'

/**
 * Fully controlled: all "real" state (empty/uploading/uploaded/invalid/error)
 * lives in useScreenshotUpload and is passed in. "Hover" is plain CSS
 * (:hover); "drag-over" is the only transient UI-only state kept locally
 * here, since it has no meaning outside this component.
 */
export function ScreenshotUploader({
  state,
  onSelectFile,
  onRemoveFile,
  formError,
}: ScreenshotUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputId = 'payment-screenshot'

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file) onSelectFile(file)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onSelectFile(file)
    event.target.value = ''
  }

  const message =
    state.status === 'invalid' || state.status === 'error' ? state.message : formError

  if (state.status === 'uploaded') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-4 rounded-xl border border-charcoal/12 bg-white p-3">
          <img
            src={state.previewUrl}
            alt="Preview of the uploaded payment screenshot"
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-charcoal">{state.fileName}</p>
            <p className="text-xs text-charcoal-muted">Ready to submit</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <label
              htmlFor={inputId}
              className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full
                text-charcoal-muted transition-colors duration-200 hover:bg-cream-soft hover:text-charcoal"
              aria-label="Replace screenshot"
            >
              <ArrowsClockwise size={18} />
            </label>
            <button
              type="button"
              onClick={onRemoveFile}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-charcoal-muted
                transition-colors duration-200 hover:bg-cream-soft hover:text-red"
              aria-label="Remove screenshot"
            >
              <Trash size={18} />
            </button>
          </div>
          <input
            id={inputId}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={handleChange}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-200
          has-[:focus-visible]:border-red has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-red/30
          ${
            isDragOver
              ? 'border-red bg-cream-soft'
              : message
                ? 'border-red/50 bg-white'
                : 'border-charcoal/20 bg-white hover:border-charcoal/35'
          }`}
      >
        <label
          htmlFor={inputId}
          className="flex cursor-pointer flex-col items-center gap-2.5"
        >
          {state.status === 'uploading' ? (
            <CircleNotch size={26} className="animate-spin text-charcoal-muted" />
          ) : message ? (
            <WarningCircle size={26} className="text-red" />
          ) : (
            <UploadSimple size={26} className="text-charcoal-muted" />
          )}

          <span className="font-display text-sm font-semibold text-charcoal">
            {state.status === 'uploading' ? 'Uploading…' : 'Upload payment screenshot'}
          </span>
          {state.status !== 'uploading' && (
            <span className="max-w-xs text-xs text-charcoal-muted">
              Add a screenshot of your completed UPI payment. PNG, JPG, or WEBP, up to
              8MB.
            </span>
          )}

          <input
            id={inputId}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={handleChange}
            disabled={state.status === 'uploading'}
          />
        </label>
      </div>

      {message && <p className="text-sm text-red-deep">{message}</p>}
    </div>
  )
}
