// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { mockIntersectionObserver } from '../../test/motionMocks'
import { Header } from './Header'

const panel = () => document.getElementById('mobile-nav') as HTMLElement
const toggle = () => screen.getByRole('button', { name: /open menu|close menu/i })

describe('Header current-page indicator', () => {
  beforeEach(() => {
    mockIntersectionObserver()
  })

  it('marks the matching page link with aria-current', () => {
    window.history.pushState({}, '', '/about.html')
    render(<Header />)

    const about = screen.getAllByRole('link', { name: 'About' })
    expect(about.length).toBeGreaterThan(0)
    about.forEach((link) => expect(link).toHaveAttribute('aria-current', 'page'))
    screen.getAllByRole('link', { name: 'Gallery' }).forEach((link) => {
      expect(link).not.toHaveAttribute('aria-current')
    })
  })

  it('never marks in-page anchors as the current page', () => {
    window.history.pushState({}, '', '/')
    const { container } = render(<Header />)
    expect(container.querySelector('[aria-current]')).toBeNull()
  })
})

describe('Header mobile menu', () => {
  beforeEach(() => {
    mockIntersectionObserver()
    window.history.pushState({}, '', '/')
  })

  it('stays mounted but inert (out of the tab order) while closed', () => {
    render(<Header />)
    expect(panel()).toBeInTheDocument()
    expect(panel()).toHaveAttribute('inert')
    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens from the toggle and becomes interactive', () => {
    render(<Header />)
    fireEvent.click(toggle())

    expect(panel()).not.toHaveAttribute('inert')
    expect(toggle()).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes on a press outside the menu, but not inside it', () => {
    render(<Header />)
    fireEvent.click(toggle())

    fireEvent.pointerDown(panel())
    expect(panel()).not.toHaveAttribute('inert')

    fireEvent.pointerDown(document.body)
    expect(panel()).toHaveAttribute('inert')
    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes on Escape and returns focus to the toggle', () => {
    render(<Header />)
    fireEvent.click(toggle())
    const firstLink = panel().querySelector('a') as HTMLElement
    firstLink.focus()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(panel()).toHaveAttribute('inert')
    expect(toggle()).toHaveFocus()
  })

  it('closes when a link is chosen', () => {
    render(<Header />)
    fireEvent.click(toggle())

    const link = panel().querySelector('a') as HTMLElement
    // jsdom can't navigate; the test only cares that the menu closes.
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)
    expect(panel()).toHaveAttribute('inert')
  })

  it('removes its listeners once closed', () => {
    render(<Header />)
    fireEvent.click(toggle())
    fireEvent.pointerDown(document.body)
    // A second outside press after closing must not throw or reopen anything.
    fireEvent.pointerDown(document.body)
    expect(panel()).toHaveAttribute('inert')
  })
})
