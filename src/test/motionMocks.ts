import { act } from '@testing-library/react'

/**
 * jsdom has neither `matchMedia` nor `IntersectionObserver`. These mocks give
 * tests a controllable `prefers-reduced-motion` setting and viewport
 * intersection, which is what the Phase 4B motion code branches on.
 */

export function mockReducedMotion(initial = false) {
  let reduce = initial
  const listeners = new Set<() => void>()

  window.matchMedia = ((query: string) => ({
    get matches() {
      return query.includes('prefers-reduced-motion') ? reduce : false
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) =>
      listeners.delete(listener),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia

  return {
    /** Flip the user's setting, as if changed in OS preferences mid-session. */
    set(value: boolean) {
      reduce = value
      act(() => listeners.forEach((listener) => listener()))
    },
  }
}

interface ObserverInstance {
  callback: IntersectionObserverCallback
  elements: Set<Element>
}

export function mockIntersectionObserver() {
  const instances: ObserverInstance[] = []

  class MockIntersectionObserver {
    private instance: ObserverInstance

    constructor(callback: IntersectionObserverCallback) {
      this.instance = { callback, elements: new Set() }
      instances.push(this.instance)
    }
    observe(element: Element) {
      this.instance.elements.add(element)
    }
    unobserve(element: Element) {
      this.instance.elements.delete(element)
    }
    disconnect() {
      this.instance.elements.clear()
    }
    takeRecords() {
      return []
    }
  }

  window.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver

  return {
    /** Report every currently observed element as entering/leaving the viewport. */
    setIntersecting(isIntersecting: boolean) {
      act(() => {
        for (const instance of [...instances]) {
          for (const element of [...instance.elements]) {
            instance.callback(
              [{ isIntersecting, target: element } as IntersectionObserverEntry],
              instance as unknown as IntersectionObserver,
            )
          }
        }
      })
    },
  }
}
