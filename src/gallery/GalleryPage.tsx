import { Header } from '../components/navigation/Header'
import { Footer } from '../components/layout/Footer'
import { Container } from '../components/ui/Container'
import { Button } from '../components/ui/Button'
import { ClosingBand } from '../components/ui/ClosingBand'
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

        <section className="pt-16 pb-8 md:pt-24 md:pb-12">
          <Container>
            <div ref={heroRef} className={`max-w-3xl ${heroReveal.className}`}>
              <h1 className="display-page reveal-item" style={revealStep(0)}>
                Our Gallery
              </h1>
              <p
                className="body-lg mt-6 max-w-[52ch] text-ink-2 reveal-item"
                style={revealStep(1)}
              >
                Moments from S1P&rsquo;s journey — scholarship handovers and the community
                behind them.
              </p>
            </div>
          </Container>
        </section>

        <section className="pb-16 md:pb-24">
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
