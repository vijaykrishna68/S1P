// @vitest-environment jsdom
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockReducedMotion } from '../../test/motionMocks'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

describe('usePrefersReducedMotion', () => {
  it('reads the current preference', () => {
    mockReducedMotion(true)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
  })

  it('follows the preference if it changes while mounted', () => {
    const motion = mockReducedMotion(false)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)

    motion.set(true)
    expect(result.current).toBe(true)

    motion.set(false)
    expect(result.current).toBe(false)
  })
})
