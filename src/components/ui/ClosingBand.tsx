import type { ReactNode } from 'react'
import { Container } from './Container'
import { revealStep, useScrollReveal } from './useScrollReveal'

interface ClosingBandProps {
  heading: string
  children: ReactNode
  /** Call-to-action rendered under the body copy. */
  action: ReactNode
}

/**
 * The shared closing call to action for About and Gallery: an inverse crust
 * band (`s1-inverse` turns focus rings gold) with one display line, one short
 * paragraph and one primary action.
 */
export function ClosingBand({ heading, children, action }: ClosingBandProps) {
  const { ref, revealProps } = useScrollReveal<HTMLDivElement>()

  return (
    <section className="s1-inverse bg-inverse pad-standard text-ink-inverse">
      <Container>
        <div ref={ref} className={`max-w-2xl ${revealProps.className}`}>
          <h2 className="heading-1 reveal-item" style={revealStep(0)}>
            {heading}
          </h2>
          <p className="body-lg mt-4 max-w-xl text-ink-inverse/85 reveal-item" style={revealStep(1)}>
            {children}
          </p>
          <div className="mt-8 reveal-item" style={revealStep(2)}>
            {action}
          </div>
        </div>
      </Container>
    </section>
  )
}
