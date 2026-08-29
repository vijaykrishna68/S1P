import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from '@phosphor-icons/react'

interface CopyUpiButtonProps {
  upiId: string
}

/**
 * Copy UPI ID → Copied ✓ → Copy UPI ID. Compact, no toast. If the Clipboard
 * API is unavailable or denied, this silently no-ops — the UPI ID text
 * itself remains visible and selectable, so the donor is never blocked.
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
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-charcoal/15
        px-5 py-2.5 font-display text-sm font-semibold text-charcoal transition-colors
        duration-200 hover:border-charcoal/30 hover:bg-cream-soft"
    >
      {copied ? (
        <Check size={16} weight="bold" className="text-green" />
      ) : (
        <Copy size={16} />
      )}
      <span aria-live="polite">{copied ? 'Copied ✓' : 'Copy UPI ID'}</span>
    </button>
  )
}
