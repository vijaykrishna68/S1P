export interface Testimonial {
  quote: string
  attribution: string
}

/**
 * The first entry is the one confirmed testimonial from Docs/02UI_UX.md §6.
 * The other two are placeholders authored to demonstrate the editorial
 * transition with more than one item — Docs/02UI_UX.md's "Open Content
 * Decisions" section explicitly lists real testimonial content as still
 * unconfirmed, so these are clearly not real donor quotes and should be
 * swapped before launch. See CLAUDE.md's placeholder-content decisions.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'It’s just one pizza for me, but it could be someone’s opportunity.',
    attribution: 'Monthly Donor',
  },
  {
    quote: 'I never noticed ₹500 a month. Someone else clearly will.',
    attribution: 'Ananya, Monthly Donor',
  },
  {
    quote: 'Skipping one order took thirty seconds. It felt bigger than that.',
    attribution: 'Karan, First-Time Donor',
  },
]
