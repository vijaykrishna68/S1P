import { useCountUp } from './useCountUp'

interface ImpactStatProps {
  value: number
  prefix?: string
  suffix?: string
  label: string
  /** red = giving side (raised, donors); green = outcomes (meals, students). */
  accent?: 'red' | 'green'
  /** Larger numerals for pages where the figures are the headline. */
  size?: 'md' | 'lg'
  /** Position in its group; each stat starts counting 80ms after the previous. */
  index?: number
}

const ACCENT_BAR = { red: 'bg-red', green: 'bg-green-deep' } as const
const NUMERAL = {
  md: 'text-4xl md:text-5xl',
  lg: 'text-5xl md:text-6xl lg:text-7xl',
} as const
const STAGGER_MS = 80

export function ImpactStat({
  value,
  prefix = '',
  suffix = '',
  label,
  accent = 'red',
  size = 'md',
  index = 0,
}: ImpactStatProps) {
  const {
    ref,
    value: displayValue,
    started,
  } = useCountUp(value, { startDelayMs: index * STAGGER_MS })

  const format = (n: number) => `${prefix}${n.toLocaleString('en-IN')}${suffix}`
  const finalText = format(value)

  return (
    <div ref={ref} className="text-center md:text-left">
      {/* Marker slot: a short rule today (Phase 4C may replace it with a small
          proportion mark). It draws in as the count begins. */}
      <div
        data-illustration-slot="impact-stat-marker"
        aria-hidden="true"
        className="mb-4 flex h-3 items-center justify-center md:justify-start"
      >
        <span
          className={`block h-0.5 w-8 origin-left rounded-full transition-transform duration-(--duration-medium) ease-out-expo ${
            ACCENT_BAR[accent]
          } ${started ? 'scale-x-100' : 'scale-x-0'}`}
        />
      </div>
      <p
        className={`font-display font-bold tracking-tight text-charcoal ${NUMERAL[size]}`}
      >
        {/* Screen readers get the finished figure once; the animated digits
            below are hidden from them so "37" is never announced mid-count. */}
        <span className="sr-only">{finalText}</span>
        {/* The invisible copy of the final value sets the width of this slot,
            so the number can't shift the layout while it counts. The visible
            digits are laid over it, anchored to the start edge. */}
        <span aria-hidden="true" className="relative inline-block">
          <span className="invisible">{finalText}</span>
          <span className="absolute inset-y-0 left-0 whitespace-nowrap">
            {format(displayValue)}
          </span>
        </span>
      </p>
      <p className="mt-2 text-sm text-charcoal-muted md:text-base">{label}</p>
    </div>
  )
}
