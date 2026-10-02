import type { ReactNode } from 'react'
import { WedgeOnNotebook } from '../illustrations/WedgeOnNotebook'
import { Container } from './Container'
import { TwoTrack } from './TwoTrack'
import { IllustrationSlot } from './IllustrationSlot'
import { revealStep, useScrollReveal } from './useScrollReveal'

interface ClosingBandProps {
  heading: string
  children: ReactNode
  /** Call-to-action rendered under the body copy. */
  action: ReactNode
}

/**
 * The shared closing section for About and Gallery, which previously carried
 * two near-identical copies of the same text block (audit §6, §7.7). Carries
 * the shared Tier B closing illustration, whose baked-in background is this
 * band's cream-soft colour.
 */
export function ClosingBand({ heading, children, action }: ClosingBandProps) {
  const { ref, revealProps } = useScrollReveal<HTMLDivElement>()

  return (
    <section className="bg-cream-soft pad-breathing">
      <Container>
        <div ref={ref} className={revealProps.className}>
          <TwoTrack
            aside={
              <IllustrationSlot name="closing-band">
                <WedgeOnNotebook />
              </IllustrationSlot>
            }
          >
            <h2
              className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl reveal-item"
              style={revealStep(0)}
            >
              {heading}
            </h2>
            <p
              className="mt-4 max-w-xl text-base leading-relaxed text-charcoal-muted md:text-lg reveal-item"
              style={revealStep(1)}
            >
              {children}
            </p>
            <div className="mt-8">{action}</div>
          </TwoTrack>
        </div>
      </Container>
    </section>
  )
}
