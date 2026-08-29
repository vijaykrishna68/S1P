import { useEffect, useRef, useState } from 'react'
import { Container } from '../ui/Container'
import { useScrollReveal } from '../ui/useScrollReveal'
import { TESTIMONIALS } from './testimonialsData'

const AUTOPLAY_MS = 7000
const TRANSITION_MS = 300

type Phase = 'idle' | 'exiting' | 'entering'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Editorial crossfade, not a card carousel: outgoing quote fades and lifts
 * slightly, incoming quote fades in from a matching offset, layout never
 * reflows. Two testimonials shown together on desktop (one on mobile),
 * advancing in sync. See CLAUDE.md's testimonial-transition note.
 */
export function Testimonials() {
  const { ref: headingRef, revealProps } = useScrollReveal<HTMLHeadingElement>()
  const contentRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [isPaused, setIsPaused] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  const count = TESTIMONIALS.length

  const goTo = (nextIndex: number) => {
    const target = ((nextIndex % count) + count) % count
    if (target === index) return

    if (prefersReducedMotion()) {
      setIndex(target)
      return
    }
    if (phase !== 'idle') return

    setPhase('exiting')
    window.setTimeout(() => {
      setIndex(target)
      setPhase('entering')
    }, TRANSITION_MS)
  }

  // Completes the entering → idle handoff via a forced synchronous reflow
  // instead of requestAnimationFrame. rAF only runs on an actual paint tick,
  // which real browsers throttle heavily (sometimes to a near-stop) on
  // backgrounded tabs — a transition that started right as the user tabs
  // away could get stuck invisible waiting for a frame that doesn't come.
  // Reading offsetHeight forces the browser to commit the "entering" styles
  // immediately, with no dependency on painting, so the follow-up class
  // change reliably animates instead of jumping straight to its end state.
  useEffect(() => {
    if (phase !== 'entering') return
    const node = contentRef.current
    if (!node) return
    void node.offsetHeight
    setPhase('idle')
  }, [phase])

  useEffect(() => {
    if (isPaused || prefersReducedMotion()) return
    const id = window.setInterval(() => goTo(index + 1), AUTOPLAY_MS)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isPaused])

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  const visible = [TESTIMONIALS[index], TESTIMONIALS[(index + 1) % count]]

  const contentClasses =
    phase === 'exiting'
      ? 'opacity-0 -translate-y-2'
      : phase === 'entering'
        ? 'opacity-0 translate-y-2'
        : 'opacity-100 translate-y-0'

  const transitionClasses =
    phase === 'entering' ? '' : 'transition-[opacity,transform] duration-300 ease-out'

  return (
    <section
      id="testimonials"
      className="py-20 md:py-28 lg:py-32"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <Container>
        <h2
          ref={headingRef}
          className={`font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl ${revealProps.className}`}
        >
          Voices From Our Community
        </h2>

        <div
          ref={contentRef}
          className={`mt-12 grid gap-x-16 gap-y-10 md:mt-16 md:grid-cols-2 ${transitionClasses} ${contentClasses}`}
          aria-live="polite"
        >
          {visible.map((testimonial, i) => (
            <blockquote
              key={`${index}-${i}`}
              className={i === 1 ? 'hidden md:block' : ''}
            >
              <p className="font-display text-xl font-medium leading-snug tracking-tight text-charcoal md:text-2xl">
                “{testimonial.quote}”
              </p>
              {/* Not <footer>: nested inside <blockquote> (not one of the
                  sectioning elements that suppress it), it would still map
                  to the page's contentinfo landmark role, creating a second
                  "footer" alongside the real one. */}
              <p className="mt-4 text-sm text-charcoal-muted">
                {testimonial.attribution}
              </p>
            </blockquote>
          ))}
        </div>

        {count > 1 && (
          <div
            className="mt-10 flex items-center gap-2"
            role="group"
            aria-label="Testimonials"
          >
            {/* Plain buttons with aria-current, not role="tab"/"tablist" —
                that ARIA pattern implies arrow-key roving focus between tabs,
                which isn't implemented here. Claiming the widget role without
                its keyboard behavior would be worse than not claiming it. */}
            {TESTIMONIALS.map((testimonial, i) => (
              <button
                key={testimonial.attribution}
                type="button"
                aria-current={i === index ? 'true' : undefined}
                aria-label={`Show testimonial ${i + 1} of ${count}`}
                onClick={() => goTo(i)}
                className="group flex min-h-11 min-w-11 items-center justify-center"
              >
                {/* The visible pill stays small; the button around it meets the
                    44px touch-target minimum. Animates via `transform: scaleX`
                    (not `width`) so this never triggers layout, matching the
                    project-wide transform/opacity-only motion rule. */}
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-6 origin-left rounded-full transition-[transform,background-color] duration-200 ${
                    i === index
                      ? 'scale-x-100 bg-red'
                      : 'scale-x-[0.25] bg-charcoal/20 group-hover:bg-charcoal/35'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
