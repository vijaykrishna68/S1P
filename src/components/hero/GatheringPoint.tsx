import type { CSSProperties } from 'react'
import './gatheringPoint.css'

interface Dot {
  cx: number
  cy: number
  r: number
  dx: number
  dy: number
}

const CENTER = { cx: 200, cy: 200, r: 26 }
const FACET_RADIUS = 30
const FACET_HALF_SPAN = 0.26 // radians, ~15° each side of the dot's angle

// Asymmetric scatter, not an even ring — distances from center vary only
// slightly (~120-135 units) but angles are irregular, which is what reads
// as organic rather than orbital. See CLAUDE.md's hero animation philosophy.
const DOTS: Dot[] = [
  { cx: 118, cy: 96, r: 9, dx: CENTER.cx - 118, dy: CENTER.cy - 96 },
  { cx: 298, cy: 118, r: 7, dx: CENTER.cx - 298, dy: CENTER.cy - 118 },
  { cx: 82, cy: 248, r: 8, dx: CENTER.cx - 82, dy: CENTER.cy - 248 },
  { cx: 302, cy: 268, r: 10, dx: CENTER.cx - 302, dy: CENTER.cy - 268 },
  { cx: 188, cy: 332, r: 7, dx: CENTER.cx - 188, dy: CENTER.cy - 332 },
]

// Roughly half the facets stay visible as the intentionally-designed
// reduced-motion resting state — "an ongoing effort," not empty or finished.
const REDUCED_MOTION_VISIBLE = new Set([0, 2, 4])

function polarToPoint(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

/** Short arc path centered on the angle a dot approaches from — the mark it
 * leaves on the rim when it merges. See CLAUDE.md's "Absorbed Facet" note. */
function describeFacetArc(angle: number) {
  const start = polarToPoint(CENTER.cx, CENTER.cy, FACET_RADIUS, angle - FACET_HALF_SPAN)
  const end = polarToPoint(CENTER.cx, CENTER.cy, FACET_RADIUS, angle + FACET_HALF_SPAN)
  return `M ${start.x} ${start.y} A ${FACET_RADIUS} ${FACET_RADIUS} 0 0 1 ${end.x} ${end.y}`
}

const FACETS = DOTS.map((dot) => {
  const angle = Math.atan2(dot.cy - CENTER.cy, dot.cx - CENTER.cx)
  return { d: describeFacetArc(angle) }
})

interface DotStyle extends CSSProperties {
  '--i': number
  '--dx': string
  '--dy': string
  '--rest-opacity': number
}

interface FacetStyle extends CSSProperties {
  '--facet-opacity': number
}

/**
 * The hero's signature ambient animation. Purely atmospheric — the hero copy
 * already carries the message in text — so it's hidden from assistive tech.
 *
 * Visual hierarchy is deliberate: the solid core is the primary mark, the
 * traveling dot is secondary, and the rim facets it leaves behind are a
 * subtle, low-opacity tertiary detail — never brighter or busier than the
 * dots themselves. See CLAUDE.md's hero animation philosophy for the full
 * rationale ("Absorbed Facet").
 */
export function GatheringPoint() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      {DOTS.map((dot, i) => {
        const style: DotStyle = {
          '--i': i,
          '--dx': `${dot.dx}px`,
          '--dy': `${dot.dy}px`,
          '--rest-opacity': 0.45,
        }
        return (
          <circle
            key={i}
            className="gathering-dot"
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill="none"
            stroke="var(--color-charcoal)"
            strokeWidth={1.5}
            style={style}
          />
        )
      })}

      <g className="gathering-facet-rim">
        {/* data-facet-index selects one of 5 hardcoded facet-reveal-N
            keyframes in gatheringPoint.css, each hand-timed to when dot i
            actually merges — see that file's comment for why a shared
            keyframe with a per-facet delay (like the dots use) doesn't work
            here. */}
        {FACETS.map((facet, i) => {
          const style: FacetStyle = { '--facet-opacity': 0.32 }
          return (
            <path
              key={i}
              className="gathering-facet"
              data-facet-index={i}
              data-reduced-visible={REDUCED_MOTION_VISIBLE.has(i)}
              d={facet.d}
              fill="none"
              stroke="var(--color-charcoal)"
              strokeWidth={1.75}
              strokeLinecap="round"
              style={style}
            />
          )
        })}
      </g>

      <circle
        className="gathering-core"
        cx={CENTER.cx}
        cy={CENTER.cy}
        r={CENTER.r}
        fill="var(--color-red)"
      />
    </svg>
  )
}
