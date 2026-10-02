import { Header } from '../components/navigation/Header'
import { Footer } from '../components/layout/Footer'
import { Container } from '../components/ui/Container'
import { Button } from '../components/ui/Button'
import { useScrollReveal } from '../components/ui/useScrollReveal'
import { GalleryGrid } from './GalleryGrid'

/**
 * Public /gallery entry. Mirrors AboutPage's own shape (Header, a short
 * hero-scale intro, one focused content section, a closing donate CTA,
 * Footer) rather than inventing a separate template for this page.
 */
export function GalleryPage() {
  const { ref: heroRef, revealProps: heroReveal } = useScrollReveal<HTMLDivElement>()
  const { ref: ctaRef, revealProps: ctaReveal } = useScrollReveal<HTMLDivElement>()

  return (
    <>
      <Header />
      <main>
        <div id="scroll-sentinel" aria-hidden="true" style={{ height: 1 }} />

        <section className="py-20 md:py-28 lg:py-32">
          <Container>
            <div ref={heroRef} className={`max-w-2xl ${heroReveal.className}`}>
              <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-charcoal md:text-5xl">
                Our Gallery
              </h1>
              <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-charcoal-muted md:text-lg">
                Moments from S1P&rsquo;s journey — school visits, scholarship handovers,
                and the community behind them.
              </p>
            </div>
          </Container>
        </section>

        <section className="pb-20 md:pb-28 lg:pb-32">
          <Container>
            <GalleryGrid />
          </Container>
        </section>

        <section className="bg-cream-soft py-20 md:py-28 lg:py-32">
          <Container>
            <div ref={ctaRef} className={`max-w-xl ${ctaReveal.className}`}>
              <h2 className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl">
                Be part of the next photo.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-charcoal-muted md:text-lg">
                Every moment here started with someone choosing one pizza&rsquo;s worth of
                support.
              </p>
              <div className="mt-8">
                <Button href="/#donate">Donate One Pizza</Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  )
}
