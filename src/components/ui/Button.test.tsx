// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { Button } from './Button'

describe('Button', () => {
  it('is an enabled, non-busy button by default', () => {
    render(<Button>Donate</Button>)
    const button = screen.getByRole('button', { name: 'Donate' })

    expect(button).toBeEnabled()
    expect(button).not.toHaveAttribute('aria-busy')
  })

  it('shows a pending spinner, disables itself and sets aria-busy while busy', () => {
    const { container } = render(<Button busy>Submitting…</Button>)
    const button = screen.getByRole('button', { name: 'Submitting…' })

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    // The spinner is a pending-state indicator: exempt from the reduced-motion policy.
    expect(container.querySelector('svg')).toHaveClass('motion-pending')
  })

  it('keeps the label while busy so the width holds', () => {
    render(<Button busy>Submitting…</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Submitting…')
  })

  it('uses the pressed colour on :active only, and the offset shadow on hover', () => {
    render(<Button>Donate</Button>)
    const classes = screen.getByRole('button').className

    expect(classes).toContain('active:bg-action-pressed')
    // Built from parts so Tailwind's source scan doesn't generate the class from this file.
    expect(classes).not.toContain('hover:bg-action-' + 'pressed')
    expect(classes).toContain('hover:shadow-offset-sm')
  })

  it('lists translate in its transition (Tailwind v4 animates it as a separate property)', () => {
    render(<Button>Donate</Button>)
    const classes = screen.getByRole('button').className

    expect(classes).toMatch(/transition-\[[^\]]*\btranslate\b[^\]]*\]/)
    expect(classes).toContain('motion-safe:hover:-translate-y-0.5')
  })

  it('renders an anchor, without button semantics, when given an href', () => {
    render(<Button href="/#donate">Donate</Button>)
    const link = screen.getByRole('link', { name: 'Donate' })

    expect(link).toHaveAttribute('href', '/#donate')
  })

  it('has size variants with 40, 48 and 56px minimum heights', () => {
    const { rerender } = render(<Button size="sm">Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('min-h-10')
    rerender(<Button size="md">Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('min-h-12')
    rerender(<Button size="lg">Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('min-h-14')
  })

  it('an icon-only button takes its accessible name from `label`', () => {
    render(<Button icon="close" label="Close" variant="tertiary" />)
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('shows the success state with a check and its own text', () => {
    render(
      <Button success successText="Copied">
        Copy
      </Button>,
    )
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Copied')
    expect(button).toHaveClass('bg-success')
  })

  it('the primary variant is tomato; the destructive one is separate', () => {
    const { rerender } = render(<Button>Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-action')
    rerender(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-error')
  })
})
