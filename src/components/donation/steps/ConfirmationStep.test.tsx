// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
// Type-only side effect: augments Vitest's `Assertion` with jest-dom matchers
// (toHaveFocus, etc.) for this compilation unit. Already loaded at runtime via
// vitest.setup.ts, but that file isn't part of tsconfig.app.json's program
// (it's a Node-context config file, checked under tsconfig.node.json), so
// `tsc -b` needs this import here to see the matcher types.
import '@testing-library/jest-dom/vitest'
import { ConfirmationStep } from './ConfirmationStep'

/**
 * Regression test for a real, previously-shipped bug (see CLAUDE.md's
 * accessibility-audit note): submitting the confirmation form with invalid
 * fields updated `aria-describedby`/`aria-invalid`, but never moved focus —
 * a screen reader user who submitted an incomplete form heard nothing
 * change. The fix focuses the first invalid field in a fixed priority order.
 * This test fails again if that fix is ever reverted.
 */
describe('ConfirmationStep — failed validation focus management', () => {
  it('focuses the full name field when the form is submitted empty', async () => {
    const user = userEvent.setup()
    render(<ConfirmationStep initialAmount={500} onSuccess={() => {}} />)

    await user.click(screen.getByRole('button', { name: /confirm donation/i }))

    expect(screen.getByLabelText(/full name/i)).toHaveFocus()
  })

  it('focuses the address field when only the name is filled in', async () => {
    const user = userEvent.setup()
    render(<ConfirmationStep initialAmount={500} onSuccess={() => {}} />)

    await user.type(screen.getByLabelText(/full name/i), 'Asha Rao')
    await user.click(screen.getByRole('button', { name: /confirm donation/i }))

    expect(screen.getByLabelText(/address/i)).toHaveFocus()
  })
})
