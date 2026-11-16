// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { Icon } from './Icon'

describe('Icon', () => {
  it('is hidden from assistive technology by default', () => {
    const { container } = render(<Icon name="check" />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('is exposed as an image only when it has a label', () => {
    render(<Icon name="close" label="Close" />)
    expect(screen.getByRole('img', { name: 'Close' })).toBeInTheDocument()
  })

  it('draws on the 24px grid in currentColor with a 2px round stroke', () => {
    const { container } = render(<Icon name="heart" size={16} />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).toHaveAttribute('stroke-width', '2')
    expect(svg).toHaveAttribute('stroke-linecap', 'round')
    expect(svg).toHaveAttribute('width', '16')
  })
})
