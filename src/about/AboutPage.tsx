import { Header } from '../components/navigation/Header'
import { Footer } from '../components/layout/Footer'
import { Container } from '../components/ui/Container'
import { Button } from '../components/ui/Button'
import { useScrollReveal } from '../components/ui/useScrollReveal'
import { ImpactStat } from '../components/impact/ImpactStat'
import { OriginStory } from './OriginStory'
import { JourneyTimeline } from './JourneyTimeline'
import { TrustInfo } from './TrustInfo'

// Headline figures only (₹29L+, 55+ students) — the 58-active-members figure
// lives in JourneyTimeline's narrative instead, per
// Docs/PHASE2_ABOUT_SPEC.md §E. ₹29 is rounded, not ₹29.87 — see that
// section for why a headline stat stays round while the exact figure
// appears as supporting precision in the Journey section.
const ABOUT_IMPACT_METRICS = [
  { value: 29, prefix: '₹', suffix: 'L+', label: 'Disbursed cumulatively, since 2016' },
  { value: 55, suffix: '+', label: 'Students supported, UKG to MBBS' },
]

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
  const { ref: ctaRef, revealProps: ctaReveal } = useScrollReveal<HTMLDivElement>()

  return (
    <>
      <Header />
      <main>
        <div id="scroll-sentinel" aria-hidden="true" style={{ height: 1 }} />

        <section className="py-20 md:py-28 lg:py-32">
          <Container>
            <div ref={heroRef} className={`max-w-2xl ${heroReveal.className}`}>
              <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-charcoal md:text-5xl">
                It started with a pizza order that never happened.
              </h1>
              <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-charcoal-muted md:text-lg">
                Sacrifice 1 Pizza (S1P) is a Chennai-based trust that turns everyday
                choices — like skipping a pizza — into real educational support for
                students who need it.
              </p>
              <p className="mt-6 font-display text-sm font-semibold uppercase tracking-wide text-charcoal-muted">
                Registered Trust · No. 316/2016
              </p>
            </div>
          </Container>
        </section>

        <section className="py-20 md:py-28 lg:py-32">
          <Container>
            <div ref={whatItIsRef} className={`max-w-2xl ${whatItIsReveal.className}`}>
              <h2 className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl">
                What S1P Is
              </h2>
              <p className="mt-6 text-base leading-relaxed text-charcoal-muted md:text-lg">
                Sacrifice 1 Pizza Welfare Trust is a registered non-profit that funds
                education for underprivileged students — from UKG through MBBS. Some
                students receive one-time help with a specific need; others are supported
                for years at a time, for as long as it takes to finish what they started.
                Every rupee comes from people who decided that what they&rsquo;d spend on
                one pizza could do something better.
              </p>
              <p className="mt-6 text-sm uppercase tracking-wide text-charcoal-muted">
                Non-profit · Education-focused · Community-funded
              </p>
            </div>
          </Container>
        </section>

        <OriginStory />

        <section className="py-16 md:py-20">
          <Container>
            <div
              ref={whyEducationRef}
              className={`max-w-2xl ${whyEducationReveal.className}`}
            >
              <h2 className="sr-only">Why Education</h2>
              <p className="font-display text-2xl font-semibold leading-snug tracking-tight text-charcoal md:text-3xl">
                Every one of those eight small things solved a problem for a single day.
                Education solves one for a lifetime. That&rsquo;s why S1P exists — to fund
                school fees, books, and support for students who&rsquo;d otherwise have to
                choose between them and everything else.
              </p>
            </div>
          </Container>
        </section>

        <JourneyTimeline />

        <section className="bg-cream-soft py-20 md:py-28 lg:py-32">
          <Container>
            <div ref={impactRef} className={`max-w-2xl ${impactReveal.className}`}>
              <h2 className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl">
                What It&rsquo;s Added Up To
              </h2>
              <p className="mt-4 text-base leading-relaxed text-charcoal-muted md:text-lg">
                None of this is hypothetical — here&rsquo;s the total, so far:
              </p>
            </div>
            <div className="mt-14 grid max-w-xl grid-cols-2 gap-x-8 gap-y-10 md:mt-16">
              {ABOUT_IMPACT_METRICS.map((metric) => (
                <ImpactStat key={metric.label} {...metric} />
              ))}
            </div>
          </Container>
        </section>

        <TrustInfo />

        <section className="bg-cream-soft py-20 md:py-28 lg:py-32">
          <Container>
            <div ref={ctaRef} className={`max-w-xl ${ctaReveal.className}`}>
              <h2 className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl">
                Be part of the next chapter.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-charcoal-muted md:text-lg">
                The same choice is still there — one pizza, or one student&rsquo;s next
                school fee.
              </p>
              <div className="mt-8">
                <Button href="/#donate">Donate One Pizza</Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  )
}
