import { Container } from '../components/ui/Container'
import { revealStep, useScrollReveal } from '../components/ui/useScrollReveal'
import { ACTIVE_MEMBERS, CUMULATIVE_DISBURSEMENT, YEARLY_DISBURSEMENT } from './aboutData'

const CHART_WIDTH = 640
const CHART_HEIGHT = 260
const MARGIN = { top: 16, right: 24, bottom: 40, left: 24 }
const PLOT_WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right
const PLOT_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom
const BASELINE_Y = CHART_HEIGHT - MARGIN.bottom
// Round headroom above the 2025 peak (₹29.87L), not the exact max — keeps
// the line from touching the chart's top edge.
const SCALE_MAX = 30
// Thinned to three labels at every breakpoint (not just mobile) — eleven
// year labels crowd a 375px viewport, and the line's own shape already
// carries the year-by-year detail. See Docs/PHASE2_ABOUT_SPEC.md §K.
const LABEL_YEARS = new Set([2015, 2020, 2025])

function buildPoints(data: typeof CUMULATIVE_DISBURSEMENT) {
  const xStep = PLOT_WIDTH / (data.length - 1)
  return data.map((d, i) => ({
    x: MARGIN.left + i * xStep,
    y: BASELINE_Y - (d.lakhs / SCALE_MAX) * PLOT_HEIGHT,
    year: d.year,
    lakhs: d.lakhs,
  }))
}

function buildLinePath(points: { x: number; y: number }[]) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

function buildAreaPath(points: { x: number; y: number }[]) {
  const first = points[0]
  const last = points[points.length - 1]
  return `${buildLinePath(points)} L ${last.x} ${BASELINE_Y} L ${first.x} ${BASELINE_Y} Z`
}

/**
 * One hand-rolled SVG chart (cumulative disbursement, 2015–2025) plus
 * narrative, not two full charts — see Docs/PHASE2_ABOUT_SPEC.md §F for why
 * yearly disbursement and active-member counts stay as supporting text
 * instead of each becoming their own visualization. No charting library:
 * same hand-built-SVG approach already used for the hero.
 */
export function JourneyTimeline() {
  const { ref, revealProps } = useScrollReveal<HTMLDivElement>()

  const points = buildPoints(CUMULATIVE_DISBURSEMENT)
  const linePath = buildLinePath(points)
  const areaPath = buildAreaPath(points)

  const firstCumulative = CUMULATIVE_DISBURSEMENT[0]
  const lastCumulative = CUMULATIVE_DISBURSEMENT[CUMULATIVE_DISBURSEMENT.length - 1]
  const latestYearly = YEARLY_DISBURSEMENT[YEARLY_DISBURSEMENT.length - 1]
  const firstMemberCount = ACTIVE_MEMBERS[0]
  const lastMemberCount = ACTIVE_MEMBERS[ACTIVE_MEMBERS.length - 1]

  return (
    <section className="pad-standard">
      <Container>
        <div ref={ref} className={`max-w-2xl ${revealProps.className}`}>
          <h2
            className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl reveal-item"
            style={revealStep(0)}
          >
            Our Journey
          </h2>
          <p
            className="mt-4 text-base leading-relaxed text-charcoal-muted md:text-lg reveal-item"
            style={revealStep(1)}
          >
            S1P has been funding student education since it was registered in 2016. Below
            is what that&rsquo;s added up to, cumulatively, year by year — real
            disbursements, not projections.
          </p>
        </div>

        {/* Chart takes the wide track; the two supporting facts sit beside it at
            lg so the section uses the row instead of leaving its right third
            empty. Stacks chart → caption → members on smaller screens. */}
        <div className="mt-10 grid gap-8 md:mt-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-auto w-full"
            aria-hidden="true"
            focusable="false"
          >
            <path d={areaPath} fill="var(--color-red)" opacity={0.12} />
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-red-deep)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((p) => (
              <circle
                key={p.year}
                cx={p.x}
                cy={p.y}
                r={p.year === lastCumulative.year ? 4.5 : 3}
                fill="var(--color-red-deep)"
              />
            ))}
            {points
              .filter((p) => LABEL_YEARS.has(p.year))
              .map((p) => (
                <text
                  key={p.year}
                  x={p.x}
                  y={BASELINE_Y + 22}
                  textAnchor="middle"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fill: 'var(--color-charcoal-muted)',
                  }}
                >
                  {p.year}
                </text>
              ))}
          </svg>

          <div className="lg:border-l lg:border-charcoal/10 lg:pl-10">
            {/* Visible text equivalent for the chart above — not just an
              sr-only summary, since stating the trend in words is useful to
              every reader, not only assistive tech. */}
            <p className="text-sm italic text-charcoal-muted">
              Cumulative disbursement grew from ₹{firstCumulative.lakhs}L in{' '}
              {firstCumulative.year} to ₹{lastCumulative.lakhs}L in {lastCumulative.year}{' '}
              — including ₹{latestYearly.lakhs}L disbursed in {latestYearly.year} alone.
            </p>

            <p className="mt-6 text-base leading-relaxed text-charcoal-muted md:text-lg">
              Alongside that, the community carrying it forward has grown too —{' '}
              {lastMemberCount.count} active members in {lastMemberCount.year}, up from{' '}
              {firstMemberCount.count} in {firstMemberCount.year}.
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
