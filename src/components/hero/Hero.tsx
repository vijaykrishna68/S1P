import { Button } from '../ui/Button'
import { TextLink } from '../ui/TextLink'
import { Container } from '../ui/Container'
import { Illustration } from '../ui/Illustration'

/**
 * Homepage cover: headline, one lead line, the single primary action and the
 * shared-table scene. 5/7 split from lg (copy left, art right, bleeding past the
 * content edge); below 900px the square scene sits above the copy so the
 * headline and the Donate button still share the first screen. Copy and button
 * are never delayed: only the scene rises in, once.
 */
export function Hero() {
  return (
    <section className="relative overflow-x-clip">
      <Container className="grid items-center gap-8 py-8 md:py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
        <div className="order-2 lg:order-1 lg:col-span-5">
          <h1 className="display-hero max-w-[12ch] text-balance">
            Skip One Pizza. Feed a Future.
          </h1>

          <p className="body-lg mt-6 max-w-[46ch] text-ink-2">
            One small sacrifice every month can help fund someone&rsquo;s education, food,
            or essential needs.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button href="#donate" size="lg" className="shadow-offset">
              Donate One Pizza
            </Button>
            <TextLink href="#mission">See How It Helps</TextLink>
          </div>
        </div>

        <div className="order-1 mx-auto w-full max-w-[420px] min-[900px]:max-w-none lg:order-2 lg:col-span-7 lg:-mr-8">
          <Illustration name="hero-shared-table" priority />
        </div>
      </Container>
    </section>
  )
}
