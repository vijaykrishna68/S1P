import { Container } from '../ui/Container'
import { useScrollReveal } from '../ui/useScrollReveal'
import { EchoMark } from './EchoMark'

/**
 * Editorial, single-column composition — deliberately NOT a split layout
 * like the hero, so the page doesn't repeat the same layout family back to
 * back. No cards, no icons-in-circles, no eyebrow. See CLAUDE.md's Phase 2
 * design-consistency notes.
 */
export function Mission() {
  const { ref, revealProps } = useScrollReveal<HTMLDivElement>()

  return (
    <section id="mission" className="py-20 md:py-28 lg:py-32">
      <Container>
        <div ref={ref} className={`mx-auto max-w-2xl ${revealProps.className}`}>
          <h2 className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl">
            Why One Pizza Matters
          </h2>

          <p className="mt-6 text-base leading-relaxed text-charcoal-muted md:text-lg">
            Every year, students drop out not because they lack talent, but because they
            lack small financial support. Sometimes ₹500 can cover books. Sometimes ₹700
            can fund a month of meals.
          </p>

          <div className="mt-12 flex items-start gap-6 md:mt-16 md:gap-8">
            <EchoMark />
            <p className="font-display text-2xl font-semibold leading-snug tracking-tight text-charcoal md:text-3xl">
              What feels small to us can be life-changing to someone else.
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
