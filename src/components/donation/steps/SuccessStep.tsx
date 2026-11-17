import { useEffect, useRef, useState } from 'react'
import { Button } from '../../ui/Button'
import { Illustration } from '../../ui/Illustration'
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
      {/* Shown only once the confirmation API has succeeded: this step is only
          rendered after SUBMISSION_SUCCEEDED. */}
      <div className="mx-auto max-w-[280px]">
        <Illustration name="success-celebrate" plate={false} />
      </div>

      <h2 ref={headingRef} tabIndex={-1} className="heading-1 mt-8">
        Thank you for choosing impact over indulgence ❤️
      </h2>
      <p className="body mx-auto mt-4 max-w-[46ch] text-ink-2">
        We&rsquo;ve received your payment details and screenshot. Our team will review
        your submission.
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
          className="pressable inline-grid min-h-12 items-center rounded-full border-2 border-line-ink bg-elevated px-7 py-3
            font-text text-base font-bold text-ink hover:bg-surface"
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
