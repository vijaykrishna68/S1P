import { Container } from '../ui/Container'
import { TwoTrack } from '../ui/TwoTrack'
import { useScrollReveal } from '../ui/useScrollReveal'
import { EchoMark } from './EchoMark'

/**
 * Left-aligned editorial text with the hero's own mark opposite it (audit
 * D7). The mark is the existing static EchoMark, scaled up so it actually
 * anchors the section; it never moves, so the hero stays the page's only
 * ambient animation. Stacks text-first below lg. See CLAUDE.md's Phase 2
 * design-consistency notes.
 */
export function Mission() {
  const { ref, revealProps } = useScrollReveal<HTMLDivElement>()

  return (
    <section id="mission" className="pad-t-tight pad-b-standard">
      <Container>
        <div ref={ref} className={revealProps.className}>
          <TwoTrack
            aside={<EchoMark className="h-40 w-40 md:h-56 md:w-56 lg:h-72 lg:w-72" />}
          >
            <h2 className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl">
              Why One Pizza Matters
            </h2>

            <p className="mt-6 text-base leading-relaxed text-charcoal-muted md:text-lg">
              Every year, students drop out not because they lack talent, but because they
              lack small financial support. Sometimes ₹500 can cover books. Sometimes ₹700
              can fund a month of meals.
            </p>

            <p className="mt-12 font-display text-2xl font-semibold leading-snug tracking-tight text-charcoal md:mt-16 md:text-3xl">
              What feels small to us can be life-changing to someone else.
            </p>
          </TwoTrack>
        </div>
      </Container>
    </section>
  )
}
