import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

/**
 * The single JS-side answer to "should this component skip decorative
 * motion?". It replaces the ad-hoc `matchMedia` reads that used to live in
 * useCountUp and Testimonials, and (unlike them) follows the setting if it
 * changes while the page is open. CSS-only motion doesn't need this: it is
 * covered by the global reduced-motion block in styles/index.css.
 * See CLAUDE.md §3 (reduced-motion policy).
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
