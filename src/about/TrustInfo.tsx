import { Container } from '../components/ui/Container'
import { TrustSeal } from '../components/illustrations/TrustSeal'
import { IllustrationSlot } from '../components/ui/IllustrationSlot'
import { TwoTrack } from '../components/ui/TwoTrack'
import { revealStep, useScrollReveal } from '../components/ui/useScrollReveal'
import { TRUST_INFO } from './aboutData'

/**
 * Plain label/value list — deliberately not a stat tile or card grid (this
 * is factual/legal information, not a metric to celebrate). Only what the
 * source material explicitly supports: no 80G, no other registrations, no
 * full street address. See Docs/PHASE2_ABOUT_SPEC.md §H.
 */
export function TrustInfo() {
  const { ref, revealProps } = useScrollReveal<HTMLDivElement>()

  return (
    <section className="pad-tight">
      <Container>
        <div ref={ref} className={revealProps.className}>
          <TwoTrack
            aside={
              <IllustrationSlot name="trust-seal">
                <TrustSeal />
              </IllustrationSlot>
            }
          >
            <h2
              className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl reveal-item"
              style={revealStep(0)}
            >
              About the Trust
            </h2>
            <p
              className="mt-4 text-base leading-relaxed text-charcoal-muted md:text-lg reveal-item"
              style={revealStep(1)}
            >
              Here&rsquo;s the official information, for anyone who wants it:
            </p>

            <dl className="mt-10 divide-y divide-charcoal/10 border-y border-charcoal/10">
              {TRUST_INFO.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-8"
                >
                  <dt className="w-full shrink-0 font-display text-sm font-semibold text-charcoal sm:w-48">
                    {label}
                  </dt>
                  <dd className="text-base text-charcoal-muted">{value}</dd>
                </div>
              ))}
            </dl>
          </TwoTrack>
        </div>
      </Container>
    </section>
  )
}
