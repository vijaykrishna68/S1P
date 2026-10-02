import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Pause, Play } from '@phosphor-icons/react'
import { Container } from '../ui/Container'
import { useScrollReveal } from '../ui/useScrollReveal'
import { usePrefersReducedMotion } from '../ui/usePrefersReducedMotion'
import { TESTIMONIALS } from './testimonialsData'

const AUTOPLAY_MS = 7000
// Must match --duration-medium (300ms) in styles/index.css: the exit
// transition has to finish before the quotes are swapped.
const TRANSITION_MS = 300

type Phase = 'idle' | 'exiting' | 'entering'

/**
 * Editorial crossfade, not a card carousel: outgoing quotes fade and lift
 * slightly, incoming quotes fade in from a matching offset, layout never
 * reflows. Two testimonials shown together on desktop (one on mobile). See
 * CLAUDE.md's testimonial-transition note.
 *
 * Autoplay is deliberately conservative (WCAG 2.2.2): it only runs while the
 * section is on screen, pauses on hover/focus, stops for good as soon as the
 * visitor navigates by hand, and can be paused and resumed with a visible
 * control. It never runs under prefers-reduced-motion. While autoplay is
 * enabled the content is not an aria-live region (a quote changing every 7s
 * would be announced constantly); it becomes a polite one once the visitor is
 * driving.
 */
export function Testimonials() {
  const { ref: headingRef, revealProps } = useScrollReveal<HTMLHeadingElement>()
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const swapTimeoutRef = useRef<number | undefined>(undefined)
  const reducedMotion = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [isPlaying, setIsPlaying] = useState(true) // the visitor's intent
  // True once the visitor has pressed Play: from then on, resting the pointer or
  // focus on the section no longer pauses autoplay (the explicit control wins).
  // Cleared by Pause or by choosing a quote by hand.
  const [forcePlay, setForcePlay] = useState(false)
  const [isHovered, setIsHovered] = useState(false) // transient hover/focus pause
  const [isInView, setIsInView] = useState(false)

  const count = TESTIMONIALS.length
  const autoplayEnabled = isPlaying && !reducedMotion
  const autoplayRunning = autoplayEnabled && isInView && (forcePlay || !isHovered)

  const goTo = (nextIndex: number) => {
    const target = ((nextIndex % count) + count) % count
    if (target === index) return

    if (reducedMotion) {
      setIndex(target)
      return
    }
    if (phase !== 'idle') return

    setPhase('exiting')
    window.clearTimeout(swapTimeoutRef.current)
    swapTimeoutRef.current = window.setTimeout(() => {
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

  // Only tick while the section is on screen.
  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // The interval always advances from the latest index/phase without being
  // torn down and rebuilt on every change.
  const advance = useEffectEvent(() => goTo(index + 1))
  useEffect(() => {
    if (!autoplayRunning) return
    const id = window.setInterval(() => advance(), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [autoplayRunning])

  // Clears a pending quote swap on unmount (the handle is now actually stored).
  useEffect(() => () => window.clearTimeout(swapTimeoutRef.current), [])

  const visible = [TESTIMONIALS[index], TESTIMONIALS[(index + 1) % count]]

  const contentClasses =
    phase === 'exiting'
      ? 'opacity-0 motion-safe:-translate-y-2'
      : phase === 'entering'
        ? 'opacity-0 motion-safe:translate-y-2'
        : 'opacity-100 translate-y-0'

  const transitionClasses =
    phase === 'entering'
      ? ''
      : `transition-[opacity,translate] duration-(--duration-medium) ${
          phase === 'exiting' ? 'ease-exit' : 'ease-out-expo'
        }`

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="bg-yellow-tint pad-breathing"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={(event) => {
        // Focus moving between controls inside the section isn't leaving it.
        if (!event.currentTarget.contains(event.relatedTarget)) setIsHovered(false)
      }}
    >
      <Container>
        <h2
          ref={headingRef}
          className={`font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl reveal-item ${revealProps.className}`}
        >
          Voices From Our Community
        </h2>

        <div
          ref={contentRef}
          className="mt-12 grid gap-x-16 gap-y-10 md:mt-16 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:items-end"
          aria-live={autoplayEnabled ? 'off' : 'polite'}
        >
          {visible.map((testimonial, i) => (
            <blockquote
              key={`${index}-${i}`}
              className={`${i === 1 ? 'hidden md:block' : ''} ${contentClasses} ${transitionClasses}`}
              // The second quote follows the first by one 60ms step, except on
              // the way out, where both leave together before the swap.
              style={{ transitionDelay: i === 1 && phase !== 'exiting' ? '60ms' : '0ms' }}
            >
              {i === 0 && (
                // Quote-anchor slot: a short rule today; Phase 4C may replace
                // it with a mark built from the hero's core + outline motif.
                <div
                  data-illustration-slot="quote-anchor"
                  aria-hidden="true"
                  className="mb-6 flex h-3 items-center"
                >
                  <span className="block h-0.5 w-10 rounded-full bg-red" />
                </div>
              )}
              <p
                className={`font-display font-medium leading-snug tracking-tight text-charcoal ${
                  i === 0 ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-xl md:text-2xl'
                }`}
              >
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
          <div className="mt-10 flex items-center gap-2">
            <div
              className="flex items-center gap-2"
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
                  onClick={() => {
                    // Choosing a quote by hand ends autoplay; the pause/play
                    // control can start it again.
                    setIsPlaying(false)
                    setForcePlay(false)
                    goTo(i)
                  }}
                  className="group flex min-h-11 min-w-11 items-center justify-center"
                >
                  {/* The visible pill stays small; the button around it meets the
                      44px touch-target minimum. Animates via `transform: scaleX`
                      (not `width`) so this never triggers layout, matching the
                      project-wide transform/opacity-only motion rule. */}
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-6 origin-left rounded-full transition-[scale,background-color] duration-(--duration-base) ease-state ${
                      i === index
                        ? 'scale-x-100 bg-red'
                        : 'scale-x-[0.25] bg-charcoal/20 group-hover:bg-charcoal/35'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Nothing autoplays under reduced motion, so there is nothing to pause. */}
            {!reducedMotion && (
              <button
                type="button"
                onClick={() => {
                  // Pressing Play resumes autoplay even while the pointer or focus
                  // is on the section; pressing Pause stops it.
                  setIsPlaying(!isPlaying)
                  setForcePlay(!isPlaying)
                }}
                aria-label={
                  isPlaying ? 'Pause testimonial autoplay' : 'Start testimonial autoplay'
                }
                className="pressable ml-2 flex size-11 items-center justify-center rounded-full
                  text-charcoal-muted hover:bg-charcoal/5 hover:text-charcoal"
              >
                {isPlaying ? (
                  <Pause size={16} weight="fill" aria-hidden="true" />
                ) : (
                  <Play size={16} weight="fill" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        )}
      </Container>
    </section>
  )
}
