import { useEffect, useRef, useState } from 'react'

/**
 * Counts up to `target` once, starting when the attached element enters the
 * viewport. Uses requestAnimationFrame for a single ~1.1s finite animation,
 * not a continuous loop — cleaned up on completion and on unmount, and
 * skipped entirely under prefers-reduced-motion (jumps straight to target).
 * See CLAUDE.md's performance rules for why this is a different case from
 * the "no rAF loops" rule that governs the hero.
 */
export function useCountUp(target: number, durationMs = 1100) {
  const ref = useRef<HTMLDivElement>(null)
  // Read once via lazy initializers, not as a setState call inside the
  // effect below — keeps the effect's own body free of synchronous setState.
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [value, setValue] = useState(() => (reducedMotion ? target : 0))

  useEffect(() => {
    if (reducedMotion) return
    const node = ref.current
    if (!node) return

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(target * eased))
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    observer.observe(node)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [target, durationMs, reducedMotion])

  return { ref, value }
}
