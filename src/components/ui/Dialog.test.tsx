// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { Dialog } from './Dialog'

// jsdom does not implement the modal <dialog> methods; the native behaviour
// (focus trap, Escape, focus return) is the browser's job, so only our wiring
// is tested here.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  })
})

describe('Dialog', () => {
  it('opens as a modal and names itself with its title', () => {
    render(
      <Dialog
        open
        onClose={() => {}}
        title="Delete photo?"
        actions={<button>Cancel</button>}
      >
        Body
      </Dialog>,
    )
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: 'Delete photo?' })).toBeInTheDocument()
  })

  it('uses role="alertdialog" for destructive confirmations', () => {
    render(
      <Dialog
        open
        onClose={() => {}}
        title="Delete photo?"
        tone="destructive"
        actions={<button>Cancel</button>}
      >
        This cannot be undone.
      </Dialog>,
    )
    expect(screen.getByRole('alertdialog', { name: 'Delete photo?' })).toBeInTheDocument()
  })

  it('keeps the title visually hidden in the bare (lightbox) form', () => {
    render(
      <Dialog open onClose={() => {}} title="School visit">
        <img alt="School visit" />
      </Dialog>,
    )
    expect(
      screen.getByRole('heading', { name: 'School visit', hidden: true }),
    ).toHaveClass('sr-only')
  })

  it('reports close from the Close button', () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose} title="T" actions={<button>Ok</button>}>
        x
      </Dialog>,
    )
    screen.getByRole('button', { name: 'Close' }).click()
    expect(onClose).toHaveBeenCalled()
  })
})
