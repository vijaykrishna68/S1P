// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { AdminTable } from './AdminTable'
import { StatusBadge } from './StatusBadge'

describe('AdminTable', () => {
  const columns = [
    { key: 'name', label: 'Donor' },
    { key: 'amount', label: 'Amount', align: 'end' as const },
  ]
  const rows = [{ name: 'Asha', amount: '₹300' }]

  it('is a named, keyboard-focusable scroll region with a caption', () => {
    render(<AdminTable caption="Donations" columns={columns} rows={rows} />)
    const region = screen.getByRole('region', { name: 'Donations' })
    expect(region).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('table', { name: 'Donations' })).toBeInTheDocument()
  })

  it('makes the first cell the row header and right-aligns numbers', () => {
    render(<AdminTable caption="Donations" columns={columns} rows={rows} />)
    expect(screen.getByRole('rowheader', { name: 'Asha' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Amount' })).toHaveClass('text-right')
    expect(screen.getByRole('cell', { name: '₹300' })).toHaveClass('tabular')
  })
})

describe('StatusBadge', () => {
  it.each([
    ['pending', 'Pending'],
    ['reviewed', 'Reviewed'],
    ['rejected', 'Rejected'],
  ] as const)('shows %s as words with an icon', (status, label) => {
    const { container } = render(<StatusBadge status={status} />)
    expect(within(container).getByText(label)).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
