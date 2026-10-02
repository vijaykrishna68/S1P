// @vitest-environment jsdom
import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { mockIntersectionObserver, mockReducedMotion } from '../../test/motionMocks'
import { ImpactStat } from './ImpactStat'

const FINAL = '₹50,000+'

function setup(props: { index?: number; reducedMotion?: boolean } = {}) {
  mockReducedMotion(props.reducedMotion ?? false)
  const viewport = mockIntersectionObserver()
  const utils = render(
    <ImpactStat value={50000} prefix="₹" suffix="+" label="Raised" index={props.index} />,
  )
  const srText = () => utils.container.querySelector('.sr-only')?.textContent
  // Visible digits: the absolutely positioned layer inside the aria-hidden slot.
  const shown = () => utils.container.querySelector('.absolute')?.textContent
  // The invisible copy that reserves the final width.
  const reserved = () => utils.container.querySelector('.invisible')?.textContent
  const marker = () =>
    utils.container.querySelector('[data-illustration-slot="impact-stat-marker"] span')
  const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms))
  return { ...utils, viewport, srText, shown, reserved, marker, advance }
}

describe('ImpactStat counter', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'performance',
      ],
    })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('reserves the final width and exposes the finished figure to assistive tech from the start', () => {
    const t = setup()
    expect(t.reserved()).toBe(FINAL)
    expect(t.srText()).toBe(FINAL)
    expect(t.shown()).toBe('₹0+')
    // The animated digits and the reserved copy are hidden from screen readers.
    expect(t.container.querySelector('[aria-hidden="true"].relative')).not.toBeNull()
  })

  it('does not start counting until the stat scrolls into view', () => {
    const t = setup()
    t.advance(3000)
    expect(t.shown()).toBe('₹0+')
    expect(t.marker()).toHaveClass('scale-x-0')
  })

  it('counts up to the final value without ever changing the reserved width or the announced text', () => {
    const t = setup()
    t.viewport.setIntersecting(true)

    t.advance(500)
    const midway = t.shown()
    expect(midway).not.toBe('₹0+')
    expect(midway).not.toBe(FINAL)
    expect(t.reserved()).toBe(FINAL)
    expect(t.srText()).toBe(FINAL)

    t.advance(1500)
    expect(t.shown()).toBe(FINAL)
    expect(t.srText()).toBe(FINAL)
  })

  it('draws the marker rule in as counting begins', () => {
    const t = setup()
    t.viewport.setIntersecting(true)
    t.advance(10)
    expect(t.marker()).toHaveClass('scale-x-100')
  })

  it('staggers later stats by 80ms each', () => {
    const t = setup({ index: 2 })
    t.viewport.setIntersecting(true)

    t.advance(100) // before the 160ms start delay
    expect(t.shown()).toBe('₹0+')
    expect(t.marker()).toHaveClass('scale-x-0')

    t.advance(2000)
    expect(t.shown()).toBe(FINAL)
  })

  it('shows the final value and the full marker immediately under reduced motion', () => {
    const t = setup({ reducedMotion: true })
    expect(t.shown()).toBe(FINAL)
    expect(t.marker()).toHaveClass('scale-x-100')
  })

  it('cancels a pending count on unmount', () => {
    const t = setup({ index: 3 })
    t.viewport.setIntersecting(true) // start delay timer pending
    t.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('ImpactStat counter with early requestAnimationFrame timestamps', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('never displays a negative value when the first frame timestamp precedes the start', () => {
    // Drive the animation by hand so we control the timestamps it sees.
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frames.push(cb)
      return frames.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})

    const t = setup()
    t.viewport.setIntersecting(true)
    t.advance(0) // the 0ms start delay elapses; the first frame is requested

    const startedAt = performance.now()
    const runFrame = (timestamp: number) => {
      const next = frames.shift() as FrameRequestCallback
      act(() => next(timestamp))
    }

    // rAF timestamps 5ms, 80ms and 500ms *before* performance.now() at start.
    for (const early of [5, 80, 500]) {
      runFrame(startedAt - early)
      expect(t.shown()).not.toMatch(/-/)
      expect(t.shown()).toBe('₹0+')
    }

    // Normal progress afterwards still counts up to the exact final value.
    runFrame(startedAt + 550)
    const midway = t.shown() as string
    expect(midway).not.toMatch(/-/)
    expect(midway).not.toBe('₹0+')
    runFrame(startedAt + 5000)
    expect(t.shown()).toBe(FINAL)
    expect(t.srText()).toBe(FINAL)
  })
})
