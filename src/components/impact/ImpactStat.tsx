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
}

const ACCENT_BAR = { red: 'bg-red', green: 'bg-green-deep' } as const
const NUMERAL = {
  md: 'text-4xl md:text-5xl',
  lg: 'text-5xl md:text-6xl lg:text-7xl',
} as const

export function ImpactStat({
  value,
  prefix = '',
  suffix = '',
  label,
  accent = 'red',
  size = 'md',
}: ImpactStatProps) {
  const { ref, value: displayValue } = useCountUp(value)

  return (
    <div ref={ref} className="text-center md:text-left">
      {/* Marker slot: a short rule today; Phase 4C may replace it with a small
          proportion mark. Keeps the stat's top edge aligned either way. */}
      <div
        data-illustration-slot="impact-stat-marker"
        aria-hidden="true"
        className="mb-4 flex h-3 items-center justify-center md:justify-start"
      >
        <span className={`block h-0.5 w-8 rounded-full ${ACCENT_BAR[accent]}`} />
      </div>
      <p
        className={`font-display font-bold tracking-tight text-charcoal ${NUMERAL[size]}`}
      >
        {prefix}
        {displayValue.toLocaleString('en-IN')}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-charcoal-muted md:text-base">{label}</p>
    </div>
  )
}
