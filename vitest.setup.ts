import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// vitest.config's `test.globals` is deliberately off (explicit imports
// everywhere else in this project), so React Testing Library's automatic
// per-test cleanup — which only activates when it detects a *global*
// `afterEach` — never runs on its own. Without this, a component rendered in
// one test stays mounted into the next, causing spurious
// "found multiple elements" failures in any later test querying the same
// role/label.
afterEach(() => {
  cleanup()
})
