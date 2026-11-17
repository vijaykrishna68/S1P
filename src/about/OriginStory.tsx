import { Container } from '../components/ui/Container'
import { revealStep, useScrollReveal } from '../components/ui/useScrollReveal'
import { Illustration } from '../components/ui/Illustration'
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
    <section className="rounded-t-slab bg-story py-16 md:py-24">
      <Container>
        <div
          ref={ref}
          className={`grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12 ${revealProps.className}`}
        >
          <div className="max-w-2xl lg:col-span-7">
            <h2 className="heading-1 reveal-item" style={revealStep(0)}>
              The Story That Started It
            </h2>
            <div className="mt-6 body-lg space-y-5 text-ink-2">
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

          <div className="mx-auto w-full max-w-[520px] lg:col-span-5">
            <Illustration name="set-aside-slice" />
          </div>
        </div>
      </Container>
    </section>
  )
}
