import { Container } from '../components/ui/Container'
import { revealStep, useScrollReveal } from '../components/ui/useScrollReveal'
import { EightSlicesMark } from './EightSlicesMark'
import { ORIGIN_STORY_PARAGRAPHS } from './aboutData'

/**
 * Split editorial layout: narrative + a static visual motif, per
 * Docs/PHASE2_ABOUT_SPEC.md §G. Text-first on mobile — the motif follows
 * the story rather than preceding it, so a mobile reader reaches the actual
 * content before any decorative graphic.
 */
export function OriginStory() {
  const { ref, revealProps } = useScrollReveal<HTMLDivElement>()

  return (
    <section className="bg-cream-soft py-20 md:py-28 lg:py-32">
      <Container>
        <div
          ref={ref}
          className={`grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-20 ${revealProps.className}`}
        >
          <div className="max-w-2xl">
            <h2
              className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl reveal-item"
              style={revealStep(0)}
            >
              The Story That Started It
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-charcoal-muted md:text-lg">
              {ORIGIN_STORY_PARAGRAPHS.map((paragraph, i) => (
                <p
                  key={i}
                  className={i === 0 ? 'reveal-item' : undefined}
                  style={i === 0 ? revealStep(1) : undefined}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <EightSlicesMark />
          </div>
        </div>
      </Container>
    </section>
  )
}
