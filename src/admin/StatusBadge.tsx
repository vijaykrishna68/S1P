import { Badge } from '../components/ui/Badge'
import type { DonationStatus } from './api'

const MAP = {
  pending: { tone: 'warning', icon: 'info', label: 'Pending' },
  reviewed: { tone: 'success', icon: 'check-circle', label: 'Reviewed' },
  rejected: { tone: 'error', icon: 'alert-circle', label: 'Rejected' },
} as const

/**
 * Review status of a donation, as a pill with an icon and a word (never colour
 * alone). Only the states the system really has: pending, reviewed, rejected.
 */
export function StatusBadge({ status }: { status: DonationStatus }) {
  const { tone, icon, label } = MAP[status]
  return (
    <Badge tone={tone} icon={icon}>
      {label}
    </Badge>
  )
}
