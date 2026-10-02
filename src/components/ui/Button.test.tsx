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

  it('keeps hover on the resting red and reserves the dark shade for :active only', () => {
    render(<Button>Donate</Button>)
    const classes = screen.getByRole('button').className

    expect(classes).toContain('active:bg-red-darkest')
    // Built from parts so Tailwind's source scan doesn't generate the class from this file.
    expect(classes).not.toContain('hover:bg-red-' + 'darkest')
  })

  it('lists translate and scale in its transition (Tailwind v4 animates them as separate properties)', () => {
    render(<Button>Donate</Button>)
    const classes = screen.getByRole('button').className

    expect(classes).toMatch(/transition-\[[^\]]*\btranslate\b[^\]]*\]/)
    expect(classes).toMatch(/transition-\[[^\]]*\bscale\b[^\]]*\]/)
    expect(classes).toContain('motion-safe:hover:-translate-y-0.5')
  })

  it('renders an anchor, without button semantics, when given an href', () => {
    render(<Button href="/#donate">Donate</Button>)
    const link = screen.getByRole('link', { name: 'Donate' })

    expect(link).toHaveAttribute('href', '/#donate')
  })
})
