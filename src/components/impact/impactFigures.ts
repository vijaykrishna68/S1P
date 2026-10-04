/**
 * The site's headline impact figures — one source for Home and About, so the
 * two pages cannot disagree again (they did before Phase 4D: Home carried the
 * PRD's placeholder figures). Both are from the client's source material, see
 * Docs/PHASE2_ABOUT_SPEC.md §E. ₹29L+ is rounded, not ₹29.87L: the exact figure
 * appears as supporting precision in About's Journey section.
 *
 * The "since 2015" framing is the client's answer (Phase 4D, D7): the
 * cumulative total includes the 2015 disbursement.
 */
export const IMPACT_FIGURES = [
  {
    value: 29,
    prefix: '₹',
    suffix: 'L+',
    label: 'Disbursed cumulatively, since 2015',
    accent: 'red' as const,
  },
  {
    value: 55,
    suffix: '+',
    label: 'Students supported, UKG to MBBS',
    accent: 'green' as const,
  },
]
