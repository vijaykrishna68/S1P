import { Container } from '../ui/Container'
import { useScrollReveal } from '../ui/useScrollReveal'
import { ImpactStat } from './ImpactStat'

// Figures from Docs/02UI_UX.md §4 — placeholders until real numbers are
// confirmed (see CLAUDE.md's Open Content Decisions note). Not invented.
const IMPACT_METRICS = [
  { value: 50000, prefix: '₹', suffix: '+', label: 'Raised' },
  { value: 120, suffix: '+', label: 'Meals Funded' },
  { value: 30, suffix: '+', label: 'Students Supported' },
  { value: 200, suffix: '+', label: 'Donors Joined' },
]

export function Impact() {
  const { ref, revealProps } = useScrollReveal<HTMLDivElement>()

  return (
    <section id="impact" className="bg-cream-soft py-20 md:py-28 lg:py-32">
      <Container>
        <div ref={ref} className={`max-w-2xl ${revealProps.className}`}>
          <h2 className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl">
            Small Sacrifices. Big Change.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-charcoal-muted md:text-lg">
            This is what happens when people choose purpose over one meal out.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 md:mt-16 md:grid-cols-4 md:gap-x-10">
          {IMPACT_METRICS.map((metric) => (
            <ImpactStat key={metric.label} {...metric} />
          ))}
        </div>
      </Container>
    </section>
  )
}
