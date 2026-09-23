import { useEffect, useState } from 'react'
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
    <div className="min-h-screen bg-cream px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <button
          onClick={onBack}
          className="font-semibold text-charcoal underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/40"
        >
          ← Back to donations
        </button>

        {state.status === 'loading' && <p className="text-charcoal-muted">Loading…</p>}

        {state.status === 'error' && (
          <p role="alert" className="text-red-deep">
            {state.message}
          </p>
        )}

        {state.status === 'loaded' && (
          <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <h1 className="font-display text-2xl font-bold text-charcoal">
                {state.donation.fullName}
              </h1>
              <p className="mt-1 text-sm text-charcoal-muted capitalize">
                Status: {state.donation.status}
              </p>
            </div>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-charcoal-muted">Amount</dt>
                <dd className="font-semibold text-charcoal">
                  ₹{state.donation.amountPaid.toLocaleString('en-IN')}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-charcoal-muted">Submitted</dt>
                <dd className="font-semibold text-charcoal">
                  {new Date(state.donation.createdAt).toLocaleString()}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-charcoal-muted">Address</dt>
                <dd className="font-semibold text-charcoal">{state.donation.address}</dd>
              </div>
            </dl>

            <div>
              <p className="text-sm text-charcoal-muted">Payment screenshot</p>
              <a href={state.donation.screenshotUrl} target="_blank" rel="noreferrer">
                <img
                  src={state.donation.screenshotUrl}
                  alt={`Payment screenshot uploaded by ${state.donation.fullName}`}
                  loading="lazy"
                  className="mt-2 max-h-96 rounded-xl border border-charcoal/10 object-contain"
                />
              </a>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-charcoal/10 pt-4">
              {state.donation.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusChange('reviewed')}
                    disabled={updating}
                    className="min-h-11 rounded-full bg-green px-5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                  >
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => handleStatusChange('rejected')}
                    disabled={updating}
                    className="min-h-11 rounded-full bg-red-deep px-5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                  >
                    Reject
                  </button>
                </>
              )}
              {state.donation.status !== 'pending' && (
                <button
                  onClick={() => handleStatusChange('pending')}
                  disabled={updating}
                  className="min-h-11 rounded-full border border-charcoal/15 px-5 text-sm font-semibold text-charcoal transition-opacity disabled:opacity-60"
                >
                  Reset to Pending
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
