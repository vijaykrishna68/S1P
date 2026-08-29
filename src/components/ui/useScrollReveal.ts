import { useEffect, useRef, useState } from 'react'

/**
 * Attach the returned ref to an element and spread `revealProps` onto it to
 * get the shared one-time entrance treatment (`.reveal` in styles/index.css)
 * — fades and lifts in once when the element enters the viewport, animates
 * only under prefers-reduced-motion: no-preference. Also fires correctly for
 * an element that mounts already in view (e.g. the donation success state),
 * since IntersectionObserver reports the initial intersection immediately.
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
