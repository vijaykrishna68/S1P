// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { mockIntersectionObserver, mockReducedMotion } from '../../test/motionMocks'
import { Testimonials } from './Testimonials'
import { TESTIMONIALS } from './testimonialsData'

const AUTOPLAY_MS = 7000
const SWAP_MS = 300

function setup(options: { reducedMotion?: boolean } = {}) {
  const motion = mockReducedMotion(options.reducedMotion ?? false)
  const viewport = mockIntersectionObserver()
  const utils = render(<Testimonials />)
  const section = utils.container.querySelector('section') as HTMLElement
  const leadQuote = () =>
    utils.container.querySelector('blockquote p')?.textContent as string
  const liveRegion = () => utils.container.querySelector('[aria-live]') as HTMLElement
  const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms))
  return { ...utils, motion, viewport, section, leadQuote, liveRegion, advance }
}

const quoteText = (i: number) => `“${TESTIMONIALS[i].quote}”`

describe('Testimonials autoplay lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not autoplay while the section is off screen', () => {
    const t = setup()
    t.advance(AUTOPLAY_MS * 3)
    expect(t.leadQuote()).toBe(quoteText(0))
  })

  it('advances one quote per interval while in view, crossfading through the swap', () => {
    const t = setup()
    t.viewport.setIntersecting(true)

    t.advance(AUTOPLAY_MS)
    expect(t.leadQuote()).toBe(quoteText(0)) // still fading out
    t.advance(SWAP_MS + 50)
    expect(t.leadQuote()).toBe(quoteText(1))

    t.advance(AUTOPLAY_MS)
    t.advance(SWAP_MS + 50)
    expect(t.leadQuote()).toBe(quoteText(2))
  })

  it('stops ticking when the section scrolls out of view', () => {
    const t = setup()
    t.viewport.setIntersecting(true)
    t.viewport.setIntersecting(false)
    t.advance(AUTOPLAY_MS * 3)
    expect(t.leadQuote()).toBe(quoteText(0))
  })

  it('pauses while hovered and resumes on mouse leave', () => {
    const t = setup()
    t.viewport.setIntersecting(true)

    fireEvent.mouseEnter(t.section)
    t.advance(AUTOPLAY_MS * 2)
    expect(t.leadQuote()).toBe(quoteText(0))

    fireEvent.mouseLeave(t.section)
    t.advance(AUTOPLAY_MS + SWAP_MS + 50)
    expect(t.leadQuote()).toBe(quoteText(1))
  })

  it('has a visible pause/play control that stops and restarts autoplay', () => {
    const t = setup()
    t.viewport.setIntersecting(true)

    fireEvent.click(screen.getByRole('button', { name: /pause testimonial autoplay/i }))
    t.advance(AUTOPLAY_MS * 3)
    expect(t.leadQuote()).toBe(quoteText(0))

    fireEvent.click(screen.getByRole('button', { name: /start testimonial autoplay/i }))
    t.advance(AUTOPLAY_MS + SWAP_MS + 50)
    expect(t.leadQuote()).toBe(quoteText(1))
  })

  it('ends autoplay when the visitor picks a quote by hand', () => {
    const t = setup()
    t.viewport.setIntersecting(true)

    fireEvent.click(screen.getByRole('button', { name: 'Show testimonial 3 of 3' }))
    t.advance(SWAP_MS + 50)
    expect(t.leadQuote()).toBe(quoteText(2))

    t.advance(AUTOPLAY_MS * 3)
    expect(t.leadQuote()).toBe(quoteText(2))
    expect(
      screen.getByRole('button', { name: /start testimonial autoplay/i }),
    ).toBeInTheDocument()
  })

  it('is not a live region while autoplay is enabled, and becomes polite once stopped', () => {
    const t = setup()
    expect(t.liveRegion()).toHaveAttribute('aria-live', 'off')

    fireEvent.click(screen.getByRole('button', { name: /pause testimonial autoplay/i }))
    expect(t.liveRegion()).toHaveAttribute('aria-live', 'polite')
  })

  it('leaves no timers behind when unmounted mid-swap', () => {
    const t = setup()
    t.viewport.setIntersecting(true)
    t.advance(AUTOPLAY_MS) // swap timeout is now pending
    expect(vi.getTimerCount()).toBeGreaterThan(0)

    t.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('Testimonials under prefers-reduced-motion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('never autoplays and offers no pause control', () => {
    const t = setup({ reducedMotion: true })
    t.viewport.setIntersecting(true)
    t.advance(AUTOPLAY_MS * 3)

    expect(t.leadQuote()).toBe(quoteText(0))
    expect(screen.queryByRole('button', { name: /testimonial autoplay/i })).toBeNull()
    expect(t.liveRegion()).toHaveAttribute('aria-live', 'polite')
  })

  it('swaps quotes directly on a dot click, with no transition timers', () => {
    const t = setup({ reducedMotion: true })
    fireEvent.click(screen.getByRole('button', { name: 'Show testimonial 2 of 3' }))

    expect(t.leadQuote()).toBe(quoteText(1))
    expect(vi.getTimerCount()).toBe(0)
  })

  it('reacts if the setting changes while the page is open', () => {
    const t = setup()
    expect(
      screen.getByRole('button', { name: /pause testimonial autoplay/i }),
    ).toBeVisible()

    t.motion.set(true)
    expect(screen.queryByRole('button', { name: /testimonial autoplay/i })).toBeNull()
  })
})

describe('Testimonials explicit pause/play control', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  const pauseButton = () =>
    screen.getByRole('button', { name: /pause testimonial autoplay/i })
  const playButton = () =>
    screen.getByRole('button', { name: /start testimonial autoplay/i })

  it('Play resumes autoplay while the pointer is over the section', () => {
    const t = setup()
    t.viewport.setIntersecting(true)
    fireEvent.mouseEnter(t.section) // the pointer rests on the section throughout

    fireEvent.click(pauseButton())
    fireEvent.click(playButton())

    t.advance(AUTOPLAY_MS + SWAP_MS + 50)
    expect(t.leadQuote()).toBe(quoteText(1))
  })

  it('Play resumes autoplay while the Play button itself has focus', () => {
    const t = setup()
    t.viewport.setIntersecting(true)

    fireEvent.click(pauseButton())
    const play = playButton()
    act(() => play.focus()) // focus inside the section is a transient pause
    expect(play).toHaveFocus()
    fireEvent.click(play)

    t.advance(AUTOPLAY_MS + SWAP_MS + 50)
    expect(t.leadQuote()).toBe(quoteText(1))
  })

  it('without pressing Play, hover still pauses the default autoplay', () => {
    const t = setup()
    t.viewport.setIntersecting(true)
    fireEvent.mouseEnter(t.section)

    t.advance(AUTOPLAY_MS * 2)
    expect(t.leadQuote()).toBe(quoteText(0))
  })

  it('an explicit Pause stops autoplay even after Play was forced', () => {
    const t = setup()
    t.viewport.setIntersecting(true)
    fireEvent.mouseEnter(t.section)

    fireEvent.click(pauseButton())
    fireEvent.click(playButton())
    fireEvent.click(pauseButton())

    t.advance(AUTOPLAY_MS * 3)
    expect(t.leadQuote()).toBe(quoteText(0))
  })

  it('choosing a quote by hand stops autoplay and clears a forced Play', () => {
    const t = setup()
    t.viewport.setIntersecting(true)
    fireEvent.mouseEnter(t.section)
    fireEvent.click(pauseButton())
    fireEvent.click(playButton())

    fireEvent.click(screen.getByRole('button', { name: 'Show testimonial 2 of 3' }))
    t.advance(SWAP_MS + 50)
    expect(t.leadQuote()).toBe(quoteText(1))

    t.advance(AUTOPLAY_MS * 3)
    expect(t.leadQuote()).toBe(quoteText(1))
    expect(playButton()).toBeInTheDocument()
  })

  it('stops while out of view and resumes when it re-enters, even after a forced Play', () => {
    const t = setup()
    t.viewport.setIntersecting(true)
    fireEvent.mouseEnter(t.section)
    fireEvent.click(pauseButton())
    fireEvent.click(playButton())

    t.viewport.setIntersecting(false)
    t.advance(AUTOPLAY_MS * 3)
    expect(t.leadQuote()).toBe(quoteText(0))

    t.viewport.setIntersecting(true)
    t.advance(AUTOPLAY_MS + SWAP_MS + 50)
    expect(t.leadQuote()).toBe(quoteText(1))
  })

  it('offers no control and never autoplays under reduced motion, whatever the pointer does', () => {
    const t = setup({ reducedMotion: true })
    t.viewport.setIntersecting(true)
    fireEvent.mouseEnter(t.section)

    t.advance(AUTOPLAY_MS * 3)
    expect(t.leadQuote()).toBe(quoteText(0))
    expect(screen.queryByRole('button', { name: /testimonial autoplay/i })).toBeNull()
  })
})
