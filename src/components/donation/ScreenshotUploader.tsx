import { useState, type ChangeEvent, type DragEvent } from 'react'
import { Icon } from '../ui/Icon'
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
        <div className="flex items-center gap-4 rounded-card border-2 border-line-strong bg-elevated p-3">
          <img
            src={state.previewUrl}
            alt="Preview of the uploaded payment screenshot"
            className="h-16 w-16 shrink-0 rounded-chip object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{state.fileName}</p>
            <p className="text-[13px] text-ink-2">Ready to submit</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <label
              htmlFor={inputId}
              className="pressable flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full
                text-ink hover:bg-surface"
              aria-label="Replace screenshot"
            >
              <Icon name="upload" size={20} />
            </label>
            <button
              type="button"
              onClick={onRemoveFile}
              className="pressable flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink
                hover:bg-error-soft hover:text-error"
              aria-label="Remove screenshot"
            >
              <Icon name="trash" size={20} />
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
        className={`rounded-card border-2 border-dashed p-6 text-center transition-colors duration-(--motion-duration-micro)
          has-[:focus-visible]:border-line-ink has-[:focus-visible]:shadow-focus
          ${
            isDragOver
              ? 'border-line-ink bg-highlight-soft'
              : message
                ? 'border-error bg-elevated'
                : 'border-line-strong bg-elevated hover:border-line-ink'
          }`}
      >
        <label
          htmlFor={inputId}
          className="flex cursor-pointer flex-col items-center gap-2.5"
        >
          {state.status === 'uploading' ? (
            <Icon
              name="spinner"
              size={28}
              className="motion-pending animate-spin text-ink-2"
            />
          ) : message ? (
            <Icon name="alert-circle" size={28} className="text-error" />
          ) : (
            <Icon name="upload" size={28} className="text-ink-2" />
          )}

          <span className="font-text text-base font-bold text-ink">
            {state.status === 'uploading' ? 'Uploading…' : 'Upload payment screenshot'}
          </span>
          {state.status !== 'uploading' && (
            <span className="max-w-xs text-[13px] text-ink-2">
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

      {message && (
        <p className="flex items-start gap-1.5 text-sm font-bold text-error">
          <Icon name="alert-circle" size={16} className="mt-0.5" />
          <span>{message}</span>
        </p>
      )}
    </div>
  )
}
