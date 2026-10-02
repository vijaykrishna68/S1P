interface Segment {
  angle: number
}

const CENTER = { cx: 100, cy: 100, r: 14 }
const SEGMENT_RADIUS = 46
const SEGMENT_HALF_SPAN = 0.22 // radians — short marks, not a filled ring
const SEGMENT_COUNT = 8

function polarToPoint(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

/** Short arc centered on the segment's own angle — one of eight, evenly
 * spaced, standing in for the eight slices. */
function describeSegmentArc(angle: number) {
  const start = polarToPoint(
    CENTER.cx,
    CENTER.cy,
    SEGMENT_RADIUS,
    angle - SEGMENT_HALF_SPAN,
  )
  const end = polarToPoint(
    CENTER.cx,
    CENTER.cy,
    SEGMENT_RADIUS,
    angle + SEGMENT_HALF_SPAN,
  )
  return `M ${start.x} ${start.y} A ${SEGMENT_RADIUS} ${SEGMENT_RADIUS} 0 0 1 ${end.x} ${end.y}`
}

const SEGMENTS: Segment[] = Array.from({ length: SEGMENT_COUNT }, (_, i) => ({
  angle: (i / SEGMENT_COUNT) * Math.PI * 2 - Math.PI / 2,
}))

/**
 * A fully static echo of the hero's "core + rim facet" visual language (see
 * GatheringPoint.tsx) — eight evenly-spaced arcs around a solid core,
 * standing in for the eight slices in the origin story. Deliberately
 * non-interactive and non-animated: the story is read once, not played
 * with — see Docs/PHASE2_ABOUT_SPEC.md §G for why an interactive version
 * was rejected. Purely decorative: the eight items it represents are
 * already spelled out in the adjacent prose, so this is hidden from
 * assistive tech rather than needing its own accessible labels.
 */
export function EightSlicesMark() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-40 w-40 md:h-48 md:w-48"
      aria-hidden="true"
      focusable="false"
    >
      {SEGMENTS.map((segment, i) => (
        <path
          key={i}
          d={describeSegmentArc(segment.angle)}
          fill="none"
          stroke="var(--color-charcoal)"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.32}
        />
      ))}
      <circle cx={CENTER.cx} cy={CENTER.cy} r={CENTER.r} fill="var(--color-red)" />
    </svg>
  )
}
