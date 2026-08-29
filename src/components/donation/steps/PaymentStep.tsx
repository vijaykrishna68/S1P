import { QRCodeSVG } from 'qrcode.react'
import { Button } from '../../ui/Button'
import { useAutoFocus } from '../../ui/useAutoFocus'
import { CopyUpiButton } from '../CopyUpiButton'
import { DONATION_CONFIG } from '../config'

interface PaymentStepProps {
  amount: number
  onPaid: () => void
}

function buildUpiUri(amount: number) {
  const params = new URLSearchParams({
    pa: DONATION_CONFIG.upiId,
    pn: 'Sacrifice One Pizza',
    cu: 'INR',
    am: String(amount),
  })
  return `upi://pay?${params.toString()}`
}

/**
 * Payment instructions. Deliberately plain — no card, no decorative frame
 * around the QR code, nothing implying automatic verification. The
 * screenshot the donor uploads next is their proof of payment, not this
 * screen. See CLAUDE.md's donation-trust notes.
 */
export function PaymentStep({ amount, onPaid }: PaymentStepProps) {
  const headingRef = useAutoFocus<HTMLHeadingElement>()

  return (
    <div>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl"
      >
        Scan to pay ₹{amount.toLocaleString('en-IN')}
      </h2>
      <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-charcoal-muted">
        Scan the QR code or use the UPI ID below with any UPI app.
      </p>

      <div className="mt-10 flex flex-col items-center gap-6 text-center">
        <div className="rounded-2xl bg-white p-5">
          <QRCodeSVG
            value={buildUpiUri(amount)}
            size={280}
            level="M"
            role="img"
            aria-label="UPI QR code for donating to Sacrifice One Pizza charity"
          />
        </div>

        <p className="font-display text-base font-medium text-charcoal">
          {DONATION_CONFIG.upiId}
        </p>

        <CopyUpiButton upiId={DONATION_CONFIG.upiId} />

        <p className="text-sm text-charcoal-muted">
          Minimum ₹{DONATION_CONFIG.minAmount} &middot; Maximum via UPI ₹
          {DONATION_CONFIG.maxAmount}
        </p>
      </div>

      <div className="mt-10 border-t border-charcoal/10 pt-8 text-center">
        <p className="text-sm text-charcoal-muted">
          Once you&rsquo;ve completed the payment, confirm it below.
        </p>
        <Button type="button" onClick={onPaid} className="mt-4">
          I&rsquo;ve Paid
        </Button>
      </div>
    </div>
  )
}
