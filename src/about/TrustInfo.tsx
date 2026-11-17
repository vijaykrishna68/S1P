import { Container } from '../components/ui/Container'
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
    <section className="py-12 md:py-16">
      <Container>
        <div ref={ref} className={revealProps.className}>
          <div className="max-w-3xl">
            <h2 className="heading-1 reveal-item" style={revealStep(0)}>
              About the Trust
            </h2>
            <p className="mt-4 body-lg text-ink-2 reveal-item" style={revealStep(1)}>
              Here&rsquo;s the official information, for anyone who wants it:
            </p>

            <dl className="mt-10 divide-y-2 divide-line border-y-2 border-line">
              {TRUST_INFO.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-8"
                >
                  <dt className="w-full shrink-0 label w-full shrink-0 text-ink sm:w-48">
                    {label}
                  </dt>
                  <dd className="body text-ink-2">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  )
}
