import { Header } from '../components/navigation/Header'
import { Footer } from '../components/layout/Footer'
import { Container } from '../components/ui/Container'
import { Button } from '../components/ui/Button'
import { ClosingBand } from '../components/ui/ClosingBand'
import { ViewfinderMark } from '../components/illustrations/ViewfinderMark'
import { IllustrationSlot } from '../components/ui/IllustrationSlot'
import { SectionDivider } from '../components/ui/SectionDivider'
import { TwoTrack } from '../components/ui/TwoTrack'
import { revealStep, useScrollReveal } from '../components/ui/useScrollReveal'
import { GalleryGrid } from './GalleryGrid'

/**
 * Public /gallery entry. Mirrors AboutPage's own shape (Header, a short
 * hero-scale intro, one focused content section, a closing donate CTA,
 * Footer) rather than inventing a separate template for this page.
 */
export function GalleryPage() {
  const { ref: heroRef, revealProps: heroReveal } = useScrollReveal<HTMLDivElement>()

  return (
    <>
      <Header />
      <main>
        <div id="scroll-sentinel" aria-hidden="true" style={{ height: 1 }} />

        <section className="pad-t-standard pad-b-tight">
          <Container>
            <div ref={heroRef} className={heroReveal.className}>
              <TwoTrack
                aside={
                  <IllustrationSlot name="gallery-hero-mark">
                    <ViewfinderMark />
                  </IllustrationSlot>
                }
              >
                <h1
                  className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-charcoal md:text-5xl reveal-item"
                  style={revealStep(0)}
                >
                  Our Gallery
                </h1>
                <p
                  className="mt-6 max-w-[52ch] text-base leading-relaxed text-charcoal-muted md:text-lg reveal-item"
                  style={revealStep(1)}
                >
                  Moments from S1P&rsquo;s journey — school visits, scholarship handovers,
                  and the community behind them.
                </p>
              </TwoTrack>
            </div>
          </Container>
        </section>

        <SectionDivider className="mb-8 md:mb-10" />

        <section className="pad-b-standard">
          <Container>
            <GalleryGrid />
          </Container>
        </section>

        <ClosingBand
          heading="Be part of the next photo."
          action={<Button href="/#donate">Donate One Pizza</Button>}
        >
          Every moment here started with someone choosing one pizza&rsquo;s worth of
          support.
        </ClosingBand>
      </main>
      <Footer />
    </>
  )
}
