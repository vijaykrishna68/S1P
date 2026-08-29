import type { CSSProperties } from 'react'
import { Button } from '../ui/Button'
import { TextLink } from '../ui/TextLink'
import { Container } from '../ui/Container'
import { GatheringPoint } from './GatheringPoint'
import './hero.css'

const enterDelay = (ms: number): CSSProperties =>
  ({ '--enter-delay': `${ms}ms` }) as CSSProperties

export function Hero() {
  return (
    <section className="relative">
      <Container className="grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-32">
        <div className="max-w-xl">
          <h1
            className="hero-enter font-display text-4xl font-bold leading-[1.1] tracking-tight
              text-charcoal md:text-5xl lg:text-6xl"
            style={enterDelay(0)}
          >
            Skip One Pizza. Feed a Future.
          </h1>

          <p
            className="hero-enter mt-6 max-w-[46ch] text-base leading-relaxed text-charcoal-muted
              md:text-lg"
            style={enterDelay(90)}
          >
            One small sacrifice every month can help fund someone&rsquo;s education, food,
            or essential needs.
          </p>

          <div
            className="hero-enter mt-9 flex flex-wrap items-center gap-x-8 gap-y-4"
            style={enterDelay(180)}
          >
            <Button href="#donate">Donate One Pizza</Button>
            <TextLink href="#mission">See How It Helps</TextLink>
          </div>
        </div>

        <div
          className="hero-enter mx-auto aspect-square w-full max-w-[420px]"
          style={enterDelay(260)}
        >
          <GatheringPoint />
        </div>
      </Container>
    </section>
  )
}
