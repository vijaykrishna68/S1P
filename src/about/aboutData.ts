/**
 * About page content — origin story copy and the approved historical/trust
 * figures from s1p glance.pdf. See Docs/PHASE1_IA_PROPOSAL.md and
 * Docs/PHASE2_ABOUT_SPEC.md for the source material and the reasoning behind
 * what is/isn't included. Nothing here is invented — every figure is either
 * stated directly in the source material or, for the cumulative series,
 * confirmed to reconcile exactly with the approved 2025 total (see
 * PHASE2_ABOUT_SPEC.md §F).
 */

export const ORIGIN_STORY_PARAGRAPHS = [
  'It began with an ordinary conversation. A family was deciding whether to give their household help a small festival bonus — enough, roughly, for a pizza night at home.',
  'They chose the bonus instead. And when their help returned from her time off, she accounted for every rupee of it: a new dress for her granddaughter, sweets, an offering at the temple, bus fare, a doll, bangles, a gift for her son-in-law, and school supplies.',
  'Eight small things. The same amount of money that would have bought eight slices of pizza had instead covered eight real needs in someone else’s life.',
  'That realization — that one pizza’s worth of spending could mean this much to someone else — is what started Sacrifice 1 Pizza. The team set out to do the same thing deliberately: redirect small, everyday spending toward the one thing that changes a family’s future fastest — education.',
]

export interface YearValue {
  year: number
  lakhs: number
}

// Yearly disbursement, ₹ lakhs — approved source figures.
export const YEARLY_DISBURSEMENT: YearValue[] = [
  { year: 2015, lakhs: 0.45 },
  { year: 2016, lakhs: 2.12 },
  { year: 2017, lakhs: 1.69 },
  { year: 2018, lakhs: 3.21 },
  { year: 2019, lakhs: 2.58 },
  { year: 2020, lakhs: 1.94 },
  { year: 2021, lakhs: 3.95 },
  { year: 2022, lakhs: 3.74 },
  { year: 2023, lakhs: 3.42 },
  { year: 2024, lakhs: 3.38 },
  { year: 2025, lakhs: 3.39 },
]

// Cumulative disbursement, ₹ lakhs — approved source figures; drives the
// Journey chart. See Docs/PHASE2_ABOUT_SPEC.md §F.
export const CUMULATIVE_DISBURSEMENT: YearValue[] = [
  { year: 2015, lakhs: 0.45 },
  { year: 2016, lakhs: 2.57 },
  { year: 2017, lakhs: 4.26 },
  { year: 2018, lakhs: 7.47 },
  { year: 2019, lakhs: 10.05 },
  { year: 2020, lakhs: 11.98 },
  { year: 2021, lakhs: 15.94 },
  { year: 2022, lakhs: 19.67 },
  { year: 2023, lakhs: 23.1 },
  { year: 2024, lakhs: 26.48 },
  { year: 2025, lakhs: 29.87 },
]

export interface MemberCount {
  year: number
  count: number
}

// Active member count — approved source figures. Presented as narrative
// color, not a second chart (see PHASE2_ABOUT_SPEC.md §F for why).
export const ACTIVE_MEMBERS: MemberCount[] = [
  { year: 2020, count: 50 },
  { year: 2021, count: 42 },
  { year: 2022, count: 59 },
  { year: 2023, count: 52 },
  { year: 2024, count: 58 },
  { year: 2025, count: 58 },
]

// Only what the source material explicitly supports — no 80G, no other
// registrations, no full street address. See PHASE2_ABOUT_SPEC.md §H.
export const TRUST_INFO = [
  { label: 'Legal name', value: 'Sacrifice 1 Pizza Welfare Trust' },
  { label: 'Status', value: 'Non-profit organization for the welfare of society' },
  { label: 'Registration No.', value: '316/2016' },
  { label: 'Location', value: 'Chennai, Tamil Nadu' },
  { label: 'Email', value: 's1pwtrust@gmail.com' },
] as const
