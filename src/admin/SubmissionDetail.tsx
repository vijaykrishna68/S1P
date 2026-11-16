import { useEffect, useState } from 'react'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { StatusBadge } from './StatusBadge'
import {
  getDonation,
  updateDonationStatus,
  ApiError,
  type Donation,
  type DonationStatus,
} from './api'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; donation: Donation }

interface SubmissionDetailProps {
  id: string
  onBack: () => void
}

export function SubmissionDetail({ id, onBack }: SubmissionDetailProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [updating, setUpdating] = useState(false)

  // No synchronous setState here — the initial state above already starts
  // as 'loading', and this component is remounted fresh (not updated in
  // place) each time AdminApp navigates to a different donation, so `id`
  // never actually changes during this component's lifetime. See
  // DashboardPage's matching note on the set-state-in-effect lint rule.
  useEffect(() => {
    let cancelled = false

    getDonation(id)
      .then((donation) => {
        if (!cancelled) setState({ status: 'loaded', donation })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message:
              err instanceof ApiError
                ? err.message
                : 'Something went wrong. Please try again.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const handleStatusChange = async (status: DonationStatus) => {
    setUpdating(true)
    try {
      const donation = await updateDonationStatus(id, status)
      setState({ status: 'loaded', donation })
    } catch (err) {
      setState({
        status: 'error',
        message:
          err instanceof ApiError
            ? err.message
            : 'Something went wrong. Please try again.',
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <button
          onClick={onBack}
          className="inline-flex min-h-11 items-center font-bold text-ink underline-offset-4 hover:underline hover:decoration-highlight hover:decoration-2"
        >
          ← Back to donations
        </button>

        {state.status === 'loading' && <p className="text-ink-2">Loading…</p>}

        {state.status === 'error' && (
          <Alert tone="error" title="This donation didn't load.">
            {state.message}
          </Alert>
        )}

        {state.status === 'loaded' && (
          <div className="space-y-6 rounded-card border-2 border-line bg-elevated p-6">
            <div>
              <h1 className="heading-2">{state.donation.fullName}</h1>
              <div className="mt-2">
                <StatusBadge status={state.donation.status} />
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-ink-2">Amount</dt>
                <dd className="font-bold text-ink">
                  ₹{state.donation.amountPaid.toLocaleString('en-IN')}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-2">Submitted</dt>
                <dd className="font-bold text-ink">
                  {new Date(state.donation.createdAt).toLocaleString()}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-ink-2">Address</dt>
                <dd className="font-bold text-ink">{state.donation.address}</dd>
              </div>
            </dl>

            <div>
              <p className="text-sm text-ink-2">Payment screenshot</p>
              {/* Routed through the authenticated screenshot endpoint, not
                  donation.screenshotUrl directly — that Blob URL is private
                  and not browser-fetchable on its own. An <img>/top-level
                  <a> navigation to a same-origin URL still sends the admin's
                  session cookie, so no extra wiring is needed here. */}
              <a
                href={`/api/admin/donations/${state.donation.id}/screenshot`}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={`/api/admin/donations/${state.donation.id}/screenshot`}
                  alt={`Payment screenshot uploaded by ${state.donation.fullName}`}
                  loading="lazy"
                  className="mt-2 max-h-96 rounded-chip border-2 border-line object-contain"
                />
              </a>
            </div>

            <div className="flex flex-wrap gap-3 border-t-2 border-line pt-4">
              {state.donation.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('reviewed')}
                    disabled={updating}
                  >
                    Mark Reviewed
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleStatusChange('rejected')}
                    disabled={updating}
                  >
                    Reject
                  </Button>
                </>
              )}
              {state.donation.status !== 'pending' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleStatusChange('pending')}
                  disabled={updating}
                >
                  Reset to Pending
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
