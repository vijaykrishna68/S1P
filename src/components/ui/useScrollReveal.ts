import { useEffect, useRef, useState, type CSSProperties } from 'react'

/**
 * Attach the returned ref to an element and spread `revealProps` onto it. The
 * element gets the `.reveal` class, which switches to `.reveal-visible` once
 * it first enters the viewport. Elements inside it (or the element itself)
 * that carry `.reveal-item` fade and rise once at that moment; everything else
 * is left alone. Use it for a section's lead block (heading + intro) only. See
 * the reveal comment in styles/index.css and CLAUDE.md's Phase 4B notes.
 *
 * Fires correctly for an element that mounts already in view, since
 * IntersectionObserver reports the initial intersection immediately.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsVisible(true)
        observer.disconnect()
      },
      { threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return {
    ref,
    revealProps: { className: `reveal${isVisible ? ' reveal-visible' : ''}` },
  }
}

/** Stagger position (0 to 3) for a `.reveal-item`: 60ms per step. */
export function revealStep(step: 0 | 1 | 2 | 3): CSSProperties {
  return { '--reveal-step': step } as CSSProperties
}
