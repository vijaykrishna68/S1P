// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { mockIntersectionObserver } from '../../test/motionMocks'
import { FAQ } from './FAQ'
import { FAQ_ITEMS } from './faqData'

/** The clipped inner wrapper of a panel, which carries `inert` while closed. */
const clip = (i: number) => document.getElementById(`faq-panel-${i}`)!.firstElementChild!

describe('FAQ disclosure state', () => {
  beforeEach(() => {
    mockIntersectionObserver()
  })

  it('starts fully collapsed, with every answer inert and not a region landmark', () => {
    render(<FAQ />)

    FAQ_ITEMS.forEach((item, i) => {
      expect(screen.getByRole('button', { name: item.question })).toHaveAttribute(
        'aria-expanded',
        'false',
      )
      expect(clip(i)).toHaveAttribute('inert')
    })
    expect(screen.queryAllByRole('region')).toHaveLength(0)
  })

  it('opens one answer (removing inert) and closes it again', () => {
    render(<FAQ />)
    const trigger = screen.getByRole('button', { name: FAQ_ITEMS[0].question })

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(clip(0)).not.toHaveAttribute('inert')
    expect(document.getElementById('faq-panel-0')).toHaveStyle({
      gridTemplateRows: '1fr',
    })

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(clip(0)).toHaveAttribute('inert')
  })

  it('keeps a single item open at a time', () => {
    render(<FAQ />)
    const first = screen.getByRole('button', { name: FAQ_ITEMS[0].question })
    const second = screen.getByRole('button', { name: FAQ_ITEMS[1].question })

    fireEvent.click(first)
    fireEvent.click(second)

    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(second).toHaveAttribute('aria-expanded', 'true')
    expect(clip(0)).toHaveAttribute('inert')
    expect(clip(1)).not.toHaveAttribute('inert')
  })
})
