/**
 * Line weight and opacity for the code-drawn Tier A mark (EchoMark). The other
 * Phase 4C illustrations are supplied raster artwork and carry their own line.
 * Weights are rendered pixels, held at every size by
 * `vector-effect: non-scaling-stroke`.
 */

export const INK = 'var(--color-charcoal)'
export const RED = 'var(--color-red)'

/** Tier A marks: rendered px, between the hero (~1.6) and EightSlices (~1.9). */
export const STROKE_A = 1.75

/** The hero's own opacity for outline dots. */
export const OPACITY_DOT = 0.45

/** Props for a Tier A outline shape at the given opacity. */
export function lineA(opacity: number) {
  return {
    fill: 'none',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    vectorEffect: 'non-scaling-stroke',
    stroke: INK,
    strokeWidth: STROKE_A,
    opacity,
  } as const
}
