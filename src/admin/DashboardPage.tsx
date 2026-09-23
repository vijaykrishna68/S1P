import { useEffect, useState } from 'react'
import {
  listDonations,
  ApiError,
  type Donation,
  type DonationStatus,
  type DonationSummary,
} from './api'

const PAGE_SIZE = 20
const STATUS_OPTIONS = ['all', 'pending', 'reviewed', 'rejected'] as const
type StatusFilter = (typeof STATUS_OPTIONS)[number]

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; items: Donation[]; total: number; summary: DonationSummary }

interface DashboardPageProps {
  email: string
  onLogout: () => void
  onSelectDonation: (id: string) => void
}

export function DashboardPage({ email, onLogout, onSelectDonation }: DashboardPageProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  // Deliberately no `setState({ status: 'loading' })` here — the initial
  // state above already starts as 'loading' for the first fetch, and every
  // later re-fetch is triggered by a click handler (filter/page buttons
  // below) that sets 'loading' itself before changing `page`/`statusFilter`.
  // Calling setState synchronously inside the effect body is flagged by the
  // React Compiler-aligned `set-state-in-effect` lint rule — see
  // CLAUDE.md's useCountUp decision log entry for the same class of fix.
  useEffect(() => {
    let cancelled = false

    listDonations({
      page,
      pageSize: PAGE_SIZE,
      status: statusFilter === 'all' ? undefined : (statusFilter as DonationStatus),
    })
      .then((data) => {
        if (cancelled) return
        setState({
          status: 'loaded',
          items: data.items,
          total: data.total,
          summary: data.summary,
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setState({
          status: 'error',
          message:
            err instanceof ApiError
              ? err.message
              : 'Something went wrong. Please try again.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [page, statusFilter])

  const totalPages =
    state.status === 'loaded' ? Math.max(1, Math.ceil(state.total / PAGE_SIZE)) : 1

  return (
    <div className="min-h-screen bg-cream px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-charcoal">Donations</h1>
            <p className="text-sm text-charcoal-muted">Signed in as {email}</p>
          </div>
          <button
            onClick={onLogout}
            className="min-h-11 rounded-full border border-charcoal/15 px-5 text-sm font-semibold text-charcoal transition-colors hover:bg-cream-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/40"
          >
            Log Out
          </button>
        </header>

        {state.status === 'loaded' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryTile
              label="Total Submissions"
              value={state.summary.totalCount.toLocaleString()}
            />
            <SummaryTile
              label="Total Donated"
              value={`₹${state.summary.totalAmount.toLocaleString('en-IN')}`}
            />
            <SummaryTile
              label="Pending Review"
              value={state.summary.pendingCount.toLocaleString()}
            />
          </div>
        )}

        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => {
                setState({ status: 'loading' })
                setStatusFilter(option)
                setPage(1)
              }}
              aria-current={statusFilter === option}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/40 ${
                statusFilter === option
                  ? 'bg-red-deep text-white'
                  : 'bg-white text-charcoal hover:bg-cream-soft'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {state.status === 'loading' && (
          <p className="text-charcoal-muted">Loading donations…</p>
        )}

        {state.status === 'error' && (
          <p role="alert" className="text-red-deep">
            {state.message}
          </p>
        )}

        {state.status === 'loaded' && state.items.length === 0 && (
          <p className="text-charcoal-muted">
            No donations{' '}
            {statusFilter === 'all' ? 'yet' : `with status "${statusFilter}"`}.
          </p>
        )}

        {state.status === 'loaded' && state.items.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream-soft text-charcoal-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Donor</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {state.items.map((donation) => (
                    <tr key={donation.id} className="border-t border-charcoal/10">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onSelectDonation(donation.id)}
                          className="font-semibold text-charcoal underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/40"
                        >
                          {donation.fullName}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        ₹{donation.amountPaid.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 capitalize">{donation.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-sm text-charcoal-muted">
              <button
                onClick={() => {
                  setState({ status: 'loading' })
                  setPage((p) => Math.max(1, p - 1))
                }}
                disabled={page <= 1}
                className="min-h-11 rounded-full border border-charcoal/15 px-4 disabled:opacity-40"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => {
                  setState({ status: 'loading' })
                  setPage((p) => Math.min(totalPages, p + 1))
                }}
                disabled={page >= totalPages}
                className="min-h-11 rounded-full border border-charcoal/15 px-4 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-charcoal-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-charcoal">{value}</p>
    </div>
  )
}
