// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { Alert } from './Alert'
import { Badge } from './Badge'
import { EmptyState } from './EmptyState'
import { Skeleton } from './Skeleton'
import { FormField } from '../donation/FormField'

describe('Alert', () => {
  it('announces errors immediately with role="alert"', () => {
    render(
      <Alert tone="error" title="Upload failed">
        Try again.
      </Alert>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed')
  })

  it('uses role="status" for non-error tones', () => {
    render(<Alert tone="success" title="Saved" />)
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
  })

  it('pairs every tone with an icon, never colour alone', () => {
    const { container } = render(<Alert tone="warning" title="Careful" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('offers dismissal only when asked', () => {
    const { rerender } = render(<Alert title="Hi" />)
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull()
    rerender(<Alert title="Hi" onDismiss={() => {}} />)
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })
})

describe('Badge', () => {
  it('shows its words and an optional icon', () => {
    const { container } = render(
      <Badge tone="success" icon="check-circle">
        Reviewed
      </Badge>,
    )
    expect(screen.getByText('Reviewed')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('draws the placeholder tone dashed', () => {
    render(<Badge tone="placeholder">[000]</Badge>)
    expect(screen.getByText('[000]')).toHaveClass('border-dashed')
  })
})

describe('Skeleton', () => {
  it('is decorative, pulses as a pending indicator and appears after a delay', () => {
    const { container } = render(<Skeleton media lines={2} />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstElementChild).toHaveClass('skeleton-delayed')
    expect(container.querySelector('.skeleton-pulse')).toHaveClass('motion-pending')
  })
})

describe('EmptyState', () => {
  it('says what is empty and offers one next step', () => {
    render(
      <EmptyState
        title="No images yet"
        body="Upload one to get started."
        action={<button>Upload</button>}
      />,
    )
    expect(screen.getByRole('heading', { name: 'No images yet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument()
  })
})

describe('FormField', () => {
  it('writes Required as a word, hidden from AT (the control carries aria-required)', () => {
    render(
      <FormField id="name" label="Full Name" requirement="Required">
        <input id="name" aria-required="true" />
      </FormField>,
    )
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('Required')).toHaveAttribute('aria-hidden', 'true')
  })

  it('shows the error with an icon under the id the control points at', () => {
    const { container } = render(
      <FormField id="name" label="Full Name" error="Please enter your name.">
        <input id="name" aria-describedby="name-error" />
      </FormField>,
    )
    const error = container.querySelector('#name-error')!
    expect(error).toHaveTextContent('Please enter your name.')
    expect(error.querySelector('svg')).toBeInTheDocument()
  })
})
