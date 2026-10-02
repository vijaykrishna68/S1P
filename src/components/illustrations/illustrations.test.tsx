// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EchoMark } from '../mission/EchoMark'
import { TrustSeal } from './TrustSeal'
import { ViewfinderMark } from './ViewfinderMark'
import { WedgeOnNotebook } from './WedgeOnNotebook'

/**
 * Phase 4C guardrails (audit §6): mechanical rules only. Whether the art is
 * good is a human review.
 */
describe('EchoMark (code-drawn)', () => {
  const svg = render(<EchoMark />).container.querySelector('svg') as SVGSVGElement

  it('is decorative and unfocusable', () => {
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.getAttribute('focusable')).toBe('false')
    expect(svg.querySelector('title, desc, text')).toBeNull()
  })

  it('uses tokens only, with no gradients or filters', () => {
    expect(svg.outerHTML).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(
      svg.querySelector('linearGradient, radialGradient, filter, pattern'),
    ).toBeNull()
  })

  it('draws every outline with a non-scaling stroke', () => {
    svg.querySelectorAll('[stroke]:not([stroke="none"])').forEach((el) => {
      expect(el.getAttribute('vector-effect')).toBe('non-scaling-stroke')
    })
  })
})

describe.each([
  ['TrustSeal', <TrustSeal key="t" />],
  ['ViewfinderMark', <ViewfinderMark key="v" />],
  ['WedgeOnNotebook', <WedgeOnNotebook key="w" />],
])('%s (supplied raster)', (_name, node) => {
  const img = render(node).container.querySelector('img') as HTMLImageElement

  it('is hidden from assistive tech and announces nothing', () => {
    expect(img.getAttribute('aria-hidden')).toBe('true')
    expect(img.getAttribute('alt')).toBe('')
    expect(img.hasAttribute('title')).toBe(false)
  })

  it('reserves its box with intrinsic dimensions', () => {
    expect(Number(img.getAttribute('width'))).toBeGreaterThan(0)
    expect(Number(img.getAttribute('height'))).toBeGreaterThan(0)
  })
})
