// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { mockIntersectionObserver, mockReducedMotion } from '../../test/motionMocks'
import { Illustration } from './Illustration'

describe('Illustration', () => {
  let io: ReturnType<typeof mockIntersectionObserver>
  let motion: ReturnType<typeof mockReducedMotion>

  beforeEach(() => {
    io = mockIntersectionObserver()
    motion = mockReducedMotion(false)
  })

  it('gives a meaningful scene its default alt text, and lets a caller override it', () => {
    const { rerender } = render(<Illustration name="contribution-pass-it-on" />)
    expect(
      screen.getByRole('img', { name: /hands a wrapped parcel to another/i }),
    ).toBeInTheDocument()
    rerender(<Illustration name="contribution-pass-it-on" label="Passing it on" />)
    expect(screen.getByRole('img', { name: 'Passing it on' })).toBeInTheDocument()
  })

  it('is hidden from assistive technology when decorative, and for empty-state scenes', () => {
    const { container, rerender } = render(
      <Illustration name="impact-many-hands" decorative />,
    )
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
    rerender(<Illustration name="empty-plate" />)
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('has intrinsic size, a 1x/2x srcset and async decoding', () => {
    const { container } = render(<Illustration name="set-aside-slice" />)
    const img = container.querySelector('img')!
    expect(img).toHaveAttribute('width', '600')
    expect(img).toHaveAttribute('height', '450')
    expect(img).toHaveAttribute('decoding', 'async')
    expect(img.getAttribute('srcset')).toMatch(/ 1x, .* 2x$/)
  })

  it('lazy-loads everything except the priority (hero) image', () => {
    const { container, rerender } = render(<Illustration name="success-celebrate" />)
    expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy')
    rerender(<Illustration name="hero-shared-table" priority />)
    const img = container.querySelector('img')!
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })

  it('swaps to the square mobile scene below 900px for the hero', () => {
    const { container } = render(<Illustration name="hero-shared-table" priority />)
    const source = container.querySelector('source')!
    expect(source).toHaveAttribute('media', '(max-width: 899px)')
    expect(source.getAttribute('srcset')).toContain('002')
  })

  it('shows the plate by default, and a plate that only dark theme turns on when plate={false}', () => {
    const { container, rerender } = render(<Illustration name="empty-plate" />)
    expect(container.querySelector('figure')).toHaveClass('illo-plate')
    rerender(<Illustration name="empty-plate" plate={false} />)
    expect(container.querySelector('figure')).toHaveClass('illo-plate-dark')
  })

  it('rises in once at 35% visibility and never replays', () => {
    const { container } = render(<Illustration name="impact-many-hands" />)
    const figure = container.querySelector('figure')!
    expect(figure.dataset.illo).toBe('armed')

    io.setIntersecting(true)
    expect(figure.dataset.illo).toBe('in')

    io.setIntersecting(false)
    io.setIntersecting(true)
    expect(figure.dataset.illo).toBe('in')
  })

  it('is never armed under reduced motion, or with animate="off"', () => {
    motion.set(true)
    const { container, rerender } = render(<Illustration name="impact-many-hands" />)
    expect(container.querySelector('figure')!.dataset.illo).toBeUndefined()

    motion.set(false)
    rerender(<Illustration name="impact-many-hands" animate="off" />)
    expect(container.querySelector('figure')!.dataset.illo).toBeUndefined()
  })
})
