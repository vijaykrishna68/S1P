import { Header } from '../components/navigation/Header'
import { Footer } from '../components/layout/Footer'
import { Container } from '../components/ui/Container'
import { Button } from '../components/ui/Button'
import { ClosingBand } from '../components/ui/ClosingBand'
import { revealStep, useScrollReveal } from '../components/ui/useScrollReveal'
import { ImpactStat } from '../components/impact/ImpactStat'
import { IMPACT_FIGURES } from '../components/impact/impactFigures'
import { OriginStory } from './OriginStory'
import { JourneyTimeline } from './JourneyTimeline'
import { TrustInfo } from './TrustInfo'

/**
 * Page-level component for the /about entry — see Docs/PHASE2_ABOUT_SPEC.md
 * for the full section-by-section rationale. Sections small enough to have
 * no independent reuse case ("What S1P Is," "Why Education," the closing
 * CTA) stay inline here rather than becoming their own files, matching
 * App.tsx's own "no premature splitting of markup used once" convention.
 */
export function AboutPage() {
  // Destructured directly per call (not aliased to a named object) — the
  // stricter react-hooks/refs rule flags property access on an intermediate
  // object that also carries a ref as an unprovable "access during render,"
  // even for sibling fields like revealProps.className. Matches how every
  // other section component in this codebase already calls the hook.
  const { ref: heroRef, revealProps: heroReveal } = useScrollReveal<HTMLDivElement>()
  const { ref: whatItIsRef, revealProps: whatItIsReveal } =
    useScrollReveal<HTMLDivElement>()
  const { ref: whyEducationRef, revealProps: whyEducationReveal } =
    useScrollReveal<HTMLDivElement>()
  const { ref: impactRef, revealProps: impactReveal } = useScrollReveal<HTMLDivElement>()

  return (
    <>
      <Header />
      <main>
        <div id="scroll-sentinel" aria-hidden="true" style={{ height: 1 }} />

        <section className="py-16 md:py-24">
          <Container>
            <div ref={heroRef} className={`max-w-3xl ${heroReveal.className}`}>
              <h1 className="display-page reveal-item" style={revealStep(0)}>
                It started with a pizza order that never happened.
              </h1>
              <p
                className="body-lg mt-6 max-w-[52ch] text-ink-2 reveal-item"
                style={revealStep(1)}
              >
                Sacrifice 1 Pizza (S1P) is a Chennai-based trust that turns everyday
                choices — like skipping a pizza — into real educational support for
                students who need it.
              </p>
              <p
                className="eyebrow mt-6 uppercase text-ink-brand reveal-item"
                style={revealStep(2)}
              >
                Registered Trust · No. 316/2016
              </p>
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <div
              ref={whatItIsRef}
              className={`grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-16 ${whatItIsReveal.className}`}
            >
              <h2 className="heading-1 reveal-item" style={revealStep(0)}>
                What S1P Is
              </h2>
              <div className="max-w-2xl">
                <p className="body-lg text-ink-2 reveal-item" style={revealStep(1)}>
                  Sacrifice 1 Pizza Welfare Trust is a registered non-profit that funds
                  education for underprivileged students — from UKG through MBBS. Some
                  students receive one-time help with a specific need; others are
                  supported for years at a time, for as long as it takes to finish what
                  they started. Every rupee comes from people who decided that what
                  they&rsquo;d spend on one pizza could do something better.
                </p>
                <p className="eyebrow mt-6 uppercase text-ink-2">
                  Non-profit · Education-focused · Community-funded
                </p>
              </div>
            </div>
          </Container>
        </section>

        <OriginStory />

        <section className="py-12 md:py-16">
          <Container>
            <div
              ref={whyEducationRef}
              className={`max-w-2xl ${whyEducationReveal.className}`}
            >
              <h2 className="sr-only">Why Education</h2>
              <p className="heading-2">
                Every one of those eight small things solved a problem for a single day.
                Education solves one for a lifetime. That&rsquo;s why S1P exists — to fund
                school fees, books, and support for students who&rsquo;d otherwise have to
                choose between them and everything else.
              </p>
            </div>
          </Container>
        </section>

        <JourneyTimeline />

        <section className="bg-surface py-16 md:py-24">
          <Container>
            <div ref={impactRef} className={`max-w-2xl ${impactReveal.className}`}>
              <h2 className="heading-1 reveal-item" style={revealStep(0)}>
                What It&rsquo;s Added Up To
              </h2>
              <p className="mt-4 body-lg text-ink-2 reveal-item" style={revealStep(1)}>
                None of this is hypothetical — here&rsquo;s the total, so far:
              </p>
            </div>
            <div className="mt-14 grid grid-cols-1 gap-x-12 gap-y-12 border-t-2 border-line pt-10 sm:grid-cols-2 md:mt-16">
              {IMPACT_FIGURES.map((metric, i) => (
                <ImpactStat key={metric.label} size="lg" index={i} {...metric} />
              ))}
            </div>
          </Container>
        </section>

        <TrustInfo />

        <ClosingBand
          heading="Be part of the next chapter."
          action={<Button href="/#donate">Donate One Pizza</Button>}
        >
          The same choice is still there — one pizza, or one student&rsquo;s next school
          fee.
        </ClosingBand>
      </main>
      <Footer />
    </>
  )
}
