import { Container } from './Container'

/**
 * Static hairline with a small red dot at the text axis. Sits at a
 * cream-on-cream section boundary so the boundary is marked by something
 * other than 200+px of empty space (Docs/PHASE4A_VISUAL_SYSTEM_AUDIT.md §7.3).
 * Purely presentational: hidden from assistive tech, no motion.
 */
export function SectionDivider({ className = '' }: { className?: string }) {
  return (
    <Container className={className}>
      <div aria-hidden="true" className="relative h-px bg-charcoal/10">
        <span className="absolute left-0 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-red" />
      </div>
    </Container>
  )
}
