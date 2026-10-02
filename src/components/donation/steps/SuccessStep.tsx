import { useEffect, useRef, useState } from 'react'
import { Heart } from '@phosphor-icons/react'
import { Button } from '../../ui/Button'
import { useAutoFocus } from '../../ui/useAutoFocus'

interface SuccessStepProps {
  onRestart: () => void
}

/**
 * Quiet confirmation — a heart icon, no confetti or particle celebration.
 * Enters once via DonationSection's .step-enter wrapper (it previously also
 * applied .reveal, so the entrance ran twice). See CLAUDE.md's motion philosophy.
 */
export function SuccessStep({ onRestart }: SuccessStepProps) {
  const headingRef = useAutoFocus<HTMLHeadingElement>()
  const [linkCopied, setLinkCopied] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  const handleShare = async () => {
    const shareData = {
      title: 'Sacrifice One Pizza',
      text: 'Skip one pizza. Feed a future.',
      url: window.location.origin,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled the native share sheet — nothing to do.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(shareData.url)
      setLinkCopied(true)
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setLinkCopied(false), 1800)
    } catch {
      // Clipboard API unavailable — nothing to do.
    }
  }

  const handleBackToHome = () => {
    onRestart()
    // 'auto' defers to CSS scroll-behavior, which is smooth only when motion is allowed.
    document.getElementById('top')?.scrollIntoView({ behavior: 'auto' })
  }

  return (
    <div className="text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-cream-soft">
        <Heart size={26} weight="fill" className="text-red" />
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 font-display text-2xl font-bold tracking-tight text-charcoal md:text-3xl"
      >
        Thank you for choosing impact over indulgence ❤️
      </h2>
      <p className="mx-auto mt-4 max-w-[46ch] text-base leading-relaxed text-charcoal-muted">
        Your contribution has been recorded. Every small sacrifice helps create a larger
        opportunity.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button type="button" onClick={handleBackToHome}>
          Back to Home
        </Button>
        {/* Both labels share one grid cell (inactive one invisible) so the
            button never resizes; the confirmation is announced from the
            separate live region below, not from inside the button. */}
        <button
          type="button"
          onClick={handleShare}
          className="pressable inline-grid min-h-11 items-center rounded-full border border-charcoal/15 px-6 py-3
            font-display text-[15px] font-semibold text-charcoal
            hover:border-charcoal/30 hover:bg-cream-soft"
        >
          <span className={`col-start-1 row-start-1 ${linkCopied ? 'invisible' : ''}`}>
            Share the Mission
          </span>
          <span className={`col-start-1 row-start-1 ${linkCopied ? '' : 'invisible'}`}>
            Link copied ✓
          </span>
        </button>
        <span role="status" className="sr-only">
          {linkCopied ? 'Link copied ✓' : ''}
        </span>
      </div>
    </div>
  )
}
