import { useEffect, useRef } from 'react'

/**
 * Focuses the returned ref's element once, on mount. Used on each donation
 * step's heading (with tabIndex={-1}, so it's programmatically focusable
 * without joining the normal tab order) so that advancing the flow moves
 * both keyboard focus and the screen reader's position to the new step's
 * heading, instead of leaving focus on a button that just left the DOM
 * (which most browsers silently reset to <body>, stranding keyboard and
 * screen reader users with no indication anything changed).
 */
export function useAutoFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return ref
}
