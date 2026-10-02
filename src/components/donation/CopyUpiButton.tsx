import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from '@phosphor-icons/react'

interface CopyUpiButtonProps {
  upiId: string
}

/**
 * Copy UPI ID → Copied ✓ → Copy UPI ID. Compact, no toast. If the Clipboard
 * API is unavailable or denied, this silently no-ops — the UPI ID text
 * itself remains visible and selectable, so the donor is never blocked.
 *
 * Both labels are laid in the same grid cell and the inactive one is
 * `invisible`, so the button keeps the wider label's width and never resizes
 * (or nudges its neighbours) when it changes state. `invisible` also removes
 * the inactive label from the accessible name. The confirmation is announced
 * from a separate live region, not from inside the button.
 */
export function CopyUpiButton({ upiId }: CopyUpiButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upiId)
      setCopied(true)
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard API unavailable or permission denied.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        className="pressable inline-flex min-h-11 items-center gap-2 rounded-full border border-charcoal/15
          px-5 py-2.5 font-display text-sm font-semibold text-charcoal
          hover:border-charcoal/30 hover:bg-cream-soft"
      >
        <span className="relative size-4 shrink-0" aria-hidden="true">
          <Copy
            size={16}
            className={`absolute inset-0 transition-opacity duration-(--duration-fast) ease-state ${
              copied ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <Check
            size={16}
            weight="bold"
            className={`absolute inset-0 text-green-deep transition-opacity duration-(--duration-fast) ease-state ${
              copied ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </span>
        <span className="grid">
          <span className={`col-start-1 row-start-1 ${copied ? 'invisible' : ''}`}>
            Copy UPI ID
          </span>
          <span className={`col-start-1 row-start-1 ${copied ? '' : 'invisible'}`}>
            Copied ✓
          </span>
        </span>
      </button>
      <span role="status" className="sr-only">
        {copied ? 'Copied ✓' : ''}
      </span>
    </>
  )
}
