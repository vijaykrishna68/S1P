import { useCountUp } from './useCountUp'

interface ImpactStatProps {
  value: number
  prefix?: string
  suffix?: string
  label: string
}

export function ImpactStat({ value, prefix = '', suffix = '', label }: ImpactStatProps) {
  const { ref, value: displayValue } = useCountUp(value)

  return (
    <div ref={ref} className="text-center md:text-left">
      <p className="font-display text-4xl font-bold tracking-tight text-charcoal md:text-5xl">
        {prefix}
        {displayValue.toLocaleString('en-IN')}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-charcoal-muted md:text-base">{label}</p>
    </div>
  )
}
