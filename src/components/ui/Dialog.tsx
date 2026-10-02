import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from '@phosphor-icons/react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

/**
 * Thin wrapper around the native `<dialog>` element, shared by the gallery's
 * image viewer and the admin delete-confirmation dialog — chosen instead of
 * a hand-rolled overlay/portal or a dependency (no heavy lightbox/modal
 * library exists anywhere in this project) because `showModal()` gives
 * focus trapping, `Escape`-to-close, an inert/non-interactive background,
 * and a `::backdrop` for free, all natively, with zero new code for any of
 * it. `title` is visually hidden (`sr-only`) but required — every dialog
 * needs an accessible name, and callers already have a natural one (the
 * image's alt text, "Delete this image?", etc.) rather than needing to
 * invent a separate visible heading.
 *
 * Opens and closes with a short fade + scale, written as plain CSS in
 * styles/index.css (.dialog-motion: @starting-style + allow-discrete
 * transitions). Browsers without that support just open and close instantly.
 * Page scroll behind an open dialog is locked there too. Callers should keep
 * their content mounted until the dialog has closed so it doesn't empty out
 * mid-fade.
 */
export function Dialog({ open, onClose, title, children, className = '' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    // 'close' fires for both Escape (native 'cancel' -> 'close') and our own
    // dialog.close() call above — one listener covers every close path, so
    // the caller's state always stays in sync with the actual DOM state.
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClick={(event) => {
        // Clicking the backdrop reports the dialog itself as the target
        // (the backdrop isn't a separately hit-testable element); clicking
        // real content inside never does, since that content is its own
        // target. This is the standard way to detect a backdrop click on a
        // native <dialog>.
        if (event.target === ref.current) onClose()
      }}
      className={`dialog-motion m-auto max-w-[min(90vw,640px)] rounded-2xl bg-transparent p-0 backdrop:bg-charcoal/70 ${className}`}
    >
      <h2 id={titleId} className="sr-only">
        {title}
      </h2>
      <div className="relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="pressable absolute right-2 top-2 z-10 flex size-11 items-center justify-center rounded-full
            bg-white/90 text-charcoal hover:bg-white
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/40"
        >
          <X size={20} weight="bold" />
        </button>
        {children}
      </div>
    </dialog>
  )
}
