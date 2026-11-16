import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
  /** Buttons for the footer, safest first and the action last. Passing them
   * (or `panel`) renders the standard panel with a visible heading; without
   * them the dialog is "bare" and the caller supplies all the content, as the
   * gallery's lightbox does. */
  actions?: ReactNode
  panel?: boolean
  /** `destructive` confirmations use role="alertdialog". */
  tone?: 'default' | 'destructive'
}

/**
 * Thin wrapper around the native `<dialog>` element, shared by the gallery's
 * image viewer and the admin delete confirmation. `showModal()` gives focus
 * trapping, Escape-to-close, an inert background, and a `::backdrop` natively,
 * and the browser returns focus to the trigger on close, so none of that is
 * hand-rolled. `title` always names the dialog: visible in the panel form,
 * visually hidden (`sr-only`) in the bare form.
 *
 * Destructive confirmations should name the thing and the consequence, and the
 * destructive button should repeat the verb ("Delete photo", not "OK").
 *
 * Opens and closes with a short fade + scale, written as plain CSS in
 * styles/index.css (.dialog-motion: @starting-style + allow-discrete
 * transitions). Browsers without that support just open and close instantly.
 * Page scroll behind an open dialog is locked there too. Callers should keep
 * their content mounted until the dialog has closed so it doesn't empty out
 * mid-fade.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  className = '',
  actions,
  panel = false,
  tone = 'default',
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const isPanel = panel || actions != null

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
      role={tone === 'destructive' ? 'alertdialog' : undefined}
      onClick={(event) => {
        // Clicking the backdrop reports the dialog itself as the target
        // (the backdrop isn't a separately hit-testable element); clicking
        // real content inside never does, since that content is its own
        // target. This is the standard way to detect a backdrop click on a
        // native <dialog>.
        if (event.target === ref.current) onClose()
      }}
      className={`dialog-motion m-auto max-w-[min(90vw,640px)] rounded-card bg-transparent p-0 text-ink backdrop:bg-[color-mix(in_srgb,var(--palette-crust-950)_70%,transparent)] ${className}`}
    >
      {isPanel ? (
        <div className="relative w-[min(90vw,480px)] rounded-card border-2 border-line-ink bg-elevated p-6 shadow-float">
          <h2 id={titleId} className="heading-3 pr-12">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="pressable absolute right-3 top-3 flex size-11 items-center justify-center rounded-full text-ink hover:bg-surface"
          >
            <Icon name="close" />
          </button>
          <div className="mt-3 text-[17px] leading-relaxed">{children}</div>
          {actions && (
            <div className="mt-6 flex flex-wrap justify-end gap-3">{actions}</div>
          )}
        </div>
      ) : (
        <>
          <h2 id={titleId} className="sr-only">
            {title}
          </h2>
          <div className="relative">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="pressable absolute right-2 top-2 z-10 flex size-11 items-center justify-center rounded-full
                bg-elevated/90 text-ink hover:bg-elevated"
            >
              <Icon name="close" />
            </button>
            {children}
          </div>
        </>
      )}
    </dialog>
  )
}
