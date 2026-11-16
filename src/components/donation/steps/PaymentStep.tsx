import { QRCodeSVG } from 'qrcode.react'
import { Button } from '../../ui/Button'
import { useAutoFocus } from '../../ui/useAutoFocus'
import { CopyUpiButton } from '../CopyUpiButton'
import { DONATION_CONFIG } from '../config'
import { buildUpiUri } from '../upiUri'

interface PaymentStepProps {
  amount: number
  onPaid: () => void
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
      <h2 ref={headingRef} tabIndex={-1} className="heading-1">
        Scan to pay ₹{amount.toLocaleString('en-IN')}
      </h2>
      <p className="body mt-4 max-w-[52ch] text-ink-2">
        Scan the QR code or use the UPI ID below with any UPI app.
      </p>

      <div className="mt-10 flex flex-col items-center gap-6 text-center">
        <div className="rounded-card border-2 border-line-ink bg-elevated p-5">
          <QRCodeSVG
            value={buildUpiUri(amount)}
            size={280}
            level="M"
            role="img"
            aria-label="UPI QR code for donating to Sacrifice One Pizza charity"
          />
        </div>

        <p className="font-mono text-base font-medium text-ink break-all">
          {DONATION_CONFIG.upiId}
        </p>

        <CopyUpiButton upiId={DONATION_CONFIG.upiId} />

        <p className="text-sm text-ink-2">Maximum via UPI ₹{DONATION_CONFIG.maxAmount}</p>
      </div>

      <div className="mt-10 border-t-2 border-line pt-8 text-center">
        <p className="text-sm text-ink-2">
          Once you&rsquo;ve completed the payment, confirm it below.
        </p>
        <Button type="button" onClick={onPaid} size="lg" className="mt-4">
          I&rsquo;ve Paid
        </Button>
      </div>
    </div>
  )
}
