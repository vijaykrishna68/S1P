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

/** red = giving side, green = outcomes: tomato and basil discs. */
const ACCENT_MARK = { red: 'text-brand-pill', green: 'text-success' } as const
const NUMERAL = {
  md: 'figure-md',
  lg: 'figure-xl',
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
      {/* The slice-disc mark: the pizza with one slice missing (the brand's
          signature). It pops in as the count begins. */}
      <div
        data-illustration-slot="impact-stat-marker"
        aria-hidden="true"
        className="mb-4 flex h-8 items-center justify-center md:justify-start"
      >
        <span
          className={`block origin-left transition-transform duration-(--motion-duration-standard) ease-spring ${
            ACCENT_MARK[accent]
          } ${started ? 'scale-x-100' : 'scale-x-0'}`}
        >
          <svg viewBox="0 0 32 32" width="32" height="32" fill="currentColor">
            <path d="M16 16V2a14 14 0 1 1-12.12 7z" />
          </svg>
        </span>
      </div>
      <p
        className={`tabular text-ink ${NUMERAL[size]}`}
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
      <p className="body mt-2 text-ink-2">{label}</p>
    </div>
  )
}
