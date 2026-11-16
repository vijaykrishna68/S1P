import { useEffect, useState } from 'react'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { AdminTable } from './AdminTable'
import { StatusBadge } from './StatusBadge'
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
  onOpenGallery: () => void
}

export function DashboardPage({
  email,
  onLogout,
  onSelectDonation,
  onOpenGallery,
}: DashboardPageProps) {
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
    <div className="min-h-screen bg-canvas px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="heading-1">Donations</h1>
            <p className="body-sm text-ink-2">Signed in as {email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={onOpenGallery}>
              Gallery
            </Button>
            <Button variant="secondary" size="sm" onClick={onLogout}>
              Log Out
            </Button>
          </div>
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
            <Button
              key={option}
              size="sm"
              variant={statusFilter === option ? 'primary' : 'secondary'}
              onClick={() => {
                setState({ status: 'loading' })
                setStatusFilter(option)
                setPage(1)
              }}
              aria-current={statusFilter === option}
              className="capitalize"
            >
              {option}
            </Button>
          ))}
        </div>

        {state.status === 'loading' && <p className="text-ink-2">Loading donations…</p>}

        {state.status === 'error' && (
          <Alert tone="error" title="The donations didn't load.">
            {state.message}
          </Alert>
        )}

        {state.status === 'loaded' && state.items.length === 0 && (
          <p className="text-ink-2">
            No donations{' '}
            {statusFilter === 'all' ? 'yet' : `with status "${statusFilter}"`}.
          </p>
        )}

        {state.status === 'loaded' && state.items.length > 0 && (
          <>
            <AdminTable
              caption="Donations"
              columns={[
                { key: 'donor', label: 'Donor' },
                { key: 'amount', label: 'Amount', align: 'end' },
                { key: 'date', label: 'Date' },
                { key: 'status', label: 'Status' },
              ]}
              rows={state.items.map((donation) => ({
                donor: (
                  <button
                    onClick={() => onSelectDonation(donation.id)}
                    className="min-h-11 text-left font-bold underline-offset-4 hover:underline hover:decoration-highlight hover:decoration-2"
                  >
                    {donation.fullName}
                  </button>
                ),
                amount: `₹${donation.amountPaid.toLocaleString('en-IN')}`,
                date: new Date(donation.createdAt).toLocaleDateString(),
                status: <StatusBadge status={donation.status} />,
              }))}
            />

            <div className="flex items-center justify-between text-sm text-ink-2">
              <Button
                variant="secondary"
                size="sm"
                icon="arrow-left"
                onClick={() => {
                  setState({ status: 'loading' })
                  setPage((p) => Math.max(1, p - 1))
                }}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                iconEnd="arrow-right"
                onClick={() => {
                  setState({ status: 'loading' })
                  setPage((p) => Math.min(totalPages, p + 1))
                }}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border-2 border-line bg-elevated p-5">
      <p className="text-sm text-ink-2">{label}</p>
      <p className="figure-md mt-1 text-ink">{value}</p>
    </div>
  )
}
