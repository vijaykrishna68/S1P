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
    <section id="impact" className="bg-cream-soft pad-standard">
      <Container>
        <div ref={ref} className={`max-w-2xl ${revealProps.className}`}>
          <h2
            className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl reveal-item"
            style={revealStep(0)}
          >
            Small Sacrifices. Big Change.
          </h2>
          <p
            className="mt-4 text-base leading-relaxed text-charcoal-muted md:text-lg reveal-item"
            style={revealStep(1)}
          >
            This is what happens when people choose purpose over one meal out.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-charcoal/15 pt-10 md:mt-16 md:max-w-2xl md:gap-x-10">
          {IMPACT_FIGURES.map((metric, i) => (
            <ImpactStat key={metric.label} index={i} {...metric} />
          ))}
        </div>
      </Container>
    </section>
  )
}
