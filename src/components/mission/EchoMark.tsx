/**
 * A small, fully static echo of the hero's "Gathering Point" visual
 * vocabulary (solid core + outline marks) used to tie this section back to
 * the hero without competing with it for motion. The hero remains the only
 * ambient animation on the page — this mark never moves. See CLAUDE.md's
 * hero animation philosophy and its note on why sections after the hero
 * don't get their own decorative visuals.
 */
export function EchoMark() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-16 w-16 md:h-20 md:w-20"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx={38}
        cy={30}
        r={4}
        fill="none"
        stroke="var(--color-charcoal)"
        strokeWidth={1.25}
        opacity={0.3}
      />
      <circle
        cx={86}
        cy={46}
        r={3}
        fill="none"
        stroke="var(--color-charcoal)"
        strokeWidth={1.25}
        opacity={0.3}
      />
      <circle
        cx={54}
        cy={92}
        r={3.5}
        fill="none"
        stroke="var(--color-charcoal)"
        strokeWidth={1.25}
        opacity={0.3}
      />
      <circle cx={62} cy={60} r={10} fill="var(--color-red)" opacity={0.9} />
    </svg>
  )
}
