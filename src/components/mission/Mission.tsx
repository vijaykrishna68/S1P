import { Container } from '../ui/Container'
import { Illustration } from '../ui/Illustration'
import { revealStep, useScrollReveal } from '../ui/useScrollReveal'

/**
 * Story band (rose, with a rounded top): copy left, the pass-it-on scene right.
 * Stacks text-first below lg.
 */
export function Mission() {
  const { ref, revealProps } = useScrollReveal<HTMLDivElement>()

  return (
    <section id="mission" className="rounded-t-slab bg-story py-16 md:py-24">
      <Container>
        <div
          ref={ref}
          className={`grid items-center gap-10 lg:grid-cols-12 lg:gap-12 ${revealProps.className}`}
        >
          <div className="lg:col-span-7">
            <h2 className="heading-1 reveal-item" style={revealStep(0)}>
              Why One Pizza Matters
            </h2>

            <p className="body-lg mt-6 max-w-[60ch] reveal-item" style={revealStep(1)}>
              Every year, students drop out not because they lack talent, but because they
              lack small financial support. Sometimes ₹500 can cover books. Sometimes ₹700
              can fund a month of meals.
            </p>

            <p className="heading-2 mt-10 max-w-[28ch] md:mt-12">
              What feels small to us can be life-changing to someone else.
            </p>
          </div>

          <div className="mx-auto w-full max-w-[520px] lg:col-span-5">
            <Illustration name="contribution-pass-it-on" plate={false} />
          </div>
        </div>
      </Container>
    </section>
  )
}
