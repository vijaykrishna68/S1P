export interface Testimonial {
  quote: string
  attribution: string
}

/**
 * Real testimonials supplied by the client (Phase 4D, D2), replacing the
 * authored placeholders. Quote text is verbatim; do not edit it for style.
 * The anonymous donor asked not to be named, so they are attributed only as
 * "A long-time donor" — keep their name out of the codebase. Attributions are
 * names only: no titles or roles are added, even where a quote mentions one
 * (Dr Saravanan's quote calls him Founder Trustee and patron; whether that may
 * also be shown as his attribution is unconfirmed). Order is an editorial
 * choice, short voices first.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Happy to be a part of helping students in need continue their education.',
    attribution: 'A long-time donor',
  },
  {
    quote: 'Creative thinking and silent service.',
    attribution: 'Sairam',
  },
  {
    quote:
      'Being a Founder Trustee and patron of this Trust, I consider this one of the most important forms of service to those in need of education and support. This Trust has opened doors for many beneficiaries over the years. I am proud to be one of the founding members and to have seen the Trust grow in strength and substance over time.',
    attribution: 'Dr G Saravanan',
  },
  {
    quote:
      'I feel truly elated and honoured to have been associated with S1P Trust for the past 10 years. It has been a deeply satisfying experience to be part of an organisation committed to supporting deserving students and helping them continue their education and achieve their goals. Being able to contribute, in whatever small way, to such a meaningful cause gives me immense happiness and a sense of fulfilment. I sincerely appreciate the efforts and dedication of everyone associated with S1P Trust. I wish the Trust continued success in its mission and hope it reaches and supports many more deserving students in the years to come. I am proud and grateful to be a part of the S1P family.',
    attribution: 'Valluru Srinivasu',
  },
]
