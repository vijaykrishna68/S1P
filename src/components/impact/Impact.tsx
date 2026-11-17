import { Container } from '../ui/Container'
import { revealStep, useScrollReveal } from '../ui/useScrollReveal'
import { ImpactStat } from './ImpactStat'
import { IMPACT_FIGURES } from './impactFigures'

// The two real, sourced figures, shared with About (impactFigures.ts). The
// PRD's other placeholder stats (meals, donors) were dropped in Phase 4D (D1)
// because no source exists for them.
export function Impact() {
  const { ref, revealProps } = useScrollReveal<HTMLDivElement>()

  return (
    <section id="impact" className="pt-16 pb-8 md:pt-24 md:pb-12">
      <Container>
        <div ref={ref} className={`max-w-2xl ${revealProps.className}`}>
          <h2 className="heading-1 reveal-item" style={revealStep(0)}>
            Small Sacrifices. Big Change.
          </h2>
          <p className="body-lg mt-4 text-ink-2 reveal-item" style={revealStep(1)}>
            This is what happens when people choose purpose over one meal out.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 border-t-2 border-line pt-10 sm:grid-cols-2 md:mt-16 md:max-w-3xl">
          {IMPACT_FIGURES.map((metric, i) => (
            <ImpactStat key={metric.label} index={i} {...metric} />
          ))}
        </div>
      </Container>
    </section>
  )
}
