import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../ui/usePrefersReducedMotion'

interface CountUpOptions {
  /** Count duration. Defaults to the 1100ms counter token. */
  durationMs?: number
  /** Wait this long after the element scrolls into view before counting, so
   * neighbouring stats start in sequence rather than all at once. */
  startDelayMs?: number
}

/**
 * Counts up to `target` once, starting when the attached element enters the
 * viewport. Uses requestAnimationFrame for a single ~1.1s finite animation,
 * not a continuous loop — cleaned up on completion and on unmount, and
 * skipped entirely under prefers-reduced-motion (the target is shown at once).
 * See CLAUDE.md's performance rules for why this is a different case from
 * the "no rAF loops" rule that governs the hero.
 *
 * `started` flips to true the moment counting begins (immediately under
 * reduced motion), so related visuals, like the stat's marker rule, can
 * arrive in step with the number.
 */
export function useCountUp(
  target: number,
  { durationMs = 1100, startDelayMs = 0 }: CountUpOptions = {},
) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [animatedValue, setAnimatedValue] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (reducedMotion) return
    const node = ref.current
    if (!node) return

    let frame = 0
    let delayTimer: number | undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        delayTimer = window.setTimeout(() => {
          setHasStarted(true)
          const start = performance.now()
          const tick = (now: number) => {
            // The first rAF timestamp can precede performance.now() (taken a moment
            // earlier), so clamp to [0, 1]: the count must never go negative.
            const progress = Math.min(Math.max((now - start) / durationMs, 0), 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setAnimatedValue(Math.round(target * eased))
            if (progress < 1) frame = requestAnimationFrame(tick)
          }
          frame = requestAnimationFrame(tick)
        }, startDelayMs)
      },
      { threshold: 0.4 },
    )
    observer.observe(node)

    return () => {
      observer.disconnect()
      window.clearTimeout(delayTimer)
      cancelAnimationFrame(frame)
    }
  }, [target, durationMs, startDelayMs, reducedMotion])

  return {
    ref,
    value: reducedMotion ? target : animatedValue,
    started: reducedMotion || hasStarted,
  }
}
