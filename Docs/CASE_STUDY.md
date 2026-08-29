# Case Study: Sacrifice One Pizza

## Overview

Sacrifice One Pizza is a single-page charity website built as a portfolio
piece to demonstrate production-quality frontend engineering: a hand-rolled
signature animation, a real multi-step donation UX, and accessibility work
verified by testing rather than assumed. The premise: redirect what you'd
spend on one pizza (₹300–₹3000/month) toward someone's education, food, or
essential needs, paid via UPI.

## The Problem

A UPI-based donation flow with no payment-gateway integration has an honest
version and a dishonest version. The dishonest version implies the site
verifies the payment it just showed a QR code for. The honest version shows
the donor exactly how to pay, lets them pay in their own UPI app, and
collects proof of payment as a screenshot — reviewed by a human, not the
website. The design and engineering problem was building that honest version
without it feeling like a downgrade: still fast, still trustworthy, still a
coherent single flow rather than five disconnected screens.

## My Role

Frontend engineering, interaction/motion design, and the accessibility and
performance work described below, working from a product spec and design
brief. Not claiming product management, brand design, or backend engineering
— there is no backend on this project (see
[Future Work](#what-i-would-improve)).

## Design Direction

The brief called for warm, editorial, premium-without-luxurious — human
rather than corporate. Concretely: no gradients (the single most common
"AI-generated landing page" tell), no card grids, no decorative
eyebrows/pills/badges. Visual hierarchy comes from typography, spacing, and
exactly one signature animation, not decoration layered on top of an
otherwise-generic template. Every section after the hero deliberately uses a
_different_ layout family (single-column editorial for the mission section,
a plain stat row for impact, a form for donation, an editorial crossfade for
testimonials, an accordion for FAQ) so the page doesn't read as the same
component repeated down the scroll.

## The Hero

The hero's animation, "The Gathering Point," is the site's one piece of
continuous ambient motion — everything else on the page only animates in
response to a user action. The concept: a solid core mark (one contribution)
sits with five faint outline marks scattered asymmetrically around it. Every
~4 seconds, exactly one outline mark travels to the core and merges.

The version that shipped is a refinement of that base concept, "Absorbed
Facet," reached after evaluating the first version in the browser and judging
it too simple:

```
dot rests
   ↓
dot travels toward the center
   ↓
dot arrives and merges
   ↓
a short arc appears on the core's rim, at the exact angle the dot arrived from
   ↓
the rim gradually gathers up to five of these facets across one cycle
   ↓
once all five have arrived, a brief shared hold
   ↓
the whole rim fades out together (a "breath," not a reset)
   ↓
the cycle repeats
```

Two alternative "cherry on top" directions were considered and rejected
before this one:

- **Bloom Ring** — an outward ripple from the core on each merge. Rejected
  for reading too close to a generic UI "click ripple."
- **Inner Spark** — a small rotating glyph building up inside the core.
  Rejected as harder to read causally; it doesn't tie a specific arriving dot
  to a specific visible change the way a rim facet at that dot's own angle
  does.

**Why SVG/CSS, not canvas or a particle system:** the entire animation is
6–11 small SVG shapes (five dots, one core, up to five facets), animated with
CSS keyframes and custom properties. No `requestAnimationFrame` loop, no
canvas, nothing generated at runtime. Visual hierarchy is enforced almost
entirely through opacity (core fully opaque > dots at 0.45 > facets at 0.32)
specifically so it never reads as a progress meter — nothing about it is
countable ("3 of 5 done").

**How the cycle resets:** the facets' fade-out runs on a separate,
un-shifted clock from the dots' own travel animation, so all five fade
together regardless of when each individually arrived — a shared "breath"
rather than a staggered disappearance.

**Reduced motion:** freezes to a hand-chosen static state (three of the five
facets visible) rather than an arbitrary frozen frame, so it reads as
"ongoing collective effort" instead of empty or finished. Nothing animates
under `prefers-reduced-motion: reduce`.

**Two real bugs were found here, both by watching the rendered page:**

1. The facets initially reused the dots' negative-`animation-delay` stagger
   trick. That's safe for the dots (their resting pose looks identical at any
   phase of the cycle) but wrong for facets, whose only _hidden_ window is
   the first 8% of the cycle — the delay trick put 4 of 5 facets in their
   already-revealed state on the very first frame, before their dot had ever
   moved. Driving the animation's `currentTime` via the Web Animations API
   had already "verified" the timing and completely missed this, because
   that technique never observes the untouched, natural render. The fix
   dropped the delay trick entirely: every facet now runs the same
   un-shifted clock, with its own hardcoded keyframe timed to its dot's real
   merge moment.
2. See [Challenges](#challenges) for the testimonial transition's related bug.

## Donation UX

```
Donate One Pizza
      ↓
Amount (₹300–₹3000, entered by the donor, live-validated)
      ↓
QR / UPI ID  →  pay in any UPI app
      ↓
"I've Paid"
      ↓
Confirmation (name, address, amount paid, payment screenshot)
      ↓
Submit
      ↓
Success
```

There are no preset donation amount buttons — the donor types their own
amount, and that exact amount is encoded into the client-generated UPI QR
code's deep link, so what they see and what they scan match. The flow is
four distinct screens rather than one long form because each screen has a
genuinely different job (decide an amount, execute a payment externally,
prove that payment happened) and compressing them loses the ability to
re-validate the amount independently at confirmation time (what someone
_intends_ to pay and what they _actually_ paid can differ). At no point does
the UI imply the payment was automatically verified — the uploaded screenshot
is explicitly framed as the donor's proof of payment.

## Engineering Architecture

React + TypeScript (strict mode), Tailwind CSS v4, no animation library, no
state management library, no UI component library. The donation flow —
the most complex part of the app — is deliberately **three small state
machines, not one large one**:

- `donationReducer` owns which of the 4 screens is showing. It changes a
  handful of times per donation, advanced by discrete actions.
- `confirmationFormReducer` owns the confirmation form's own fields,
  validation errors, and submission status. It changes on every keystroke.
- `useScreenshotUpload` owns the upload lifecycle independently of both,
  since it doesn't map onto either the step flow or the text-field values.

Merging these into one reducer would mean every keystroke in the form
re-evaluates step-transition logic that has nothing to do with typing, and
would give the outer flow responsibility (field-level state) that 3 of its 4
screens never touch. Each is small enough to hold in your head on its own —
4 actions for the outer flow, 4 for the form.

The eventual backend is isolated behind one function,
`donationService.submitDonation(submission): Promise<void>`, whose signature
is the entire contract every component depends on. The current implementation
is an explicitly-commented mock (a simulated delay); nothing above it knows
or cares.

## Accessibility

Treated as implementation, not a final pass — and several real bugs were
found by testing the actual rendered DOM and focus state, not by reading the
JSX:

- **Focus loss between donation steps.** Advancing the flow removes the
  clicked button from the DOM; browsers silently reset focus to `<body>`,
  leaving keyboard and screen reader users with no indication anything
  changed. Fixed by focusing each new step's heading on mount.
- **No focus on failed validation.** `aria-describedby` associates an error
  with its field but doesn't announce it until that field is _focused_.
  Fixed by focusing the first invalid field after a failed submit attempt.
- **Mobile menu focus restoration.** Closing the menu via Escape had the
  same root cause as the above — focus now explicitly returns to the menu's
  toggle button.
- **Incorrect testimonial ARIA pattern.** The dots used
  `role="tab"`/`"tablist"`, which per the ARIA Authoring Practices implies
  arrow-key roving focus between tabs — a keyboard behavior that was never
  built. Telling assistive technology a widget exists that doesn't is worse
  than not claiming the role, so this was switched to plain buttons with
  `aria-current`.
- **A real contrast failure**, caught by computing WCAG relative luminance
  rather than eyeballing: the brand red on the page's cream background is
  ≈3.96:1, under the 4.5:1 minimum for normal text, and was quietly failing
  on every inline validation message. Fixed with a darker shade already in
  the palette for text specifically, while keeping the original red for
  icons/borders (which only need 3:1).
- **Touch-target size.** The testimonial dot indicators were 6–24px,
  under the 44×44px minimum. Fixed by separating the small visual pill from
  a properly-sized button around it.

`prefers-reduced-motion` is honored everywhere something animates, verified
by walking the actual compiled stylesheet (including nested `@layer`/`@media`
rules a shallow check would miss), not just the source files.

## Performance

The hero stays deliberately lightweight: `transform`/`opacity` only, CSS
keyframes, no `requestAnimationFrame` loop, no canvas, 6–11 small SVG shapes
total. The one intentional exception to "no continuous JS animation" anywhere
in the app is a single finite `requestAnimationFrame` count-up on the impact
numbers, cleaned up on completion. No `window.addEventListener('scroll')`
anywhere — every scroll-driven behavior uses `IntersectionObserver`. Only the
font weights with an actual, audited use in the codebase are self-hosted
(Outfit 500/600/700, Plus Jakarta Sans 400/500/600) — a Phase 3 audit found
and fixed a case where a `font-medium` (500) class was requested for a
typeface that had never had that weight imported, silently substituting the
wrong weight.

## Challenges

- **The hero's rim-facet timing bug** — see [The Hero](#the-hero) above.
- **The testimonial transition could get permanently stuck invisible.** Its
  entrance originally used a double-`requestAnimationFrame` trick to force a
  style flush before transitioning — a standard technique, but dependent on
  an actual paint tick, which real browsers throttle heavily on backgrounded
  tabs. A transition that started right as a user switched tabs could get
  stuck waiting for a frame that never came in time. Replaced with a
  synchronous forced reflow (`element.offsetHeight`), which commits the
  intermediate style immediately regardless of whether the page is currently
  painting.
- **Focus management** — three separately-discovered bugs (donation steps,
  failed validation, mobile menu) turned out to share one root cause: an
  element disappearing from the DOM while focused silently drops focus to
  `<body>`. Recognizing the pattern meant fixing it consistently instead of
  three unrelated one-offs.
- **The contrast issue and the ARIA-tab mismatch** were both things that
  looked correct on quick inspection and were only caught by actually
  computing the math (contrast ratio) or checking the spec's required
  keyboard behavior (ARIA tabs) rather than trusting that the visible result
  looked fine.
- **The one layout-triggering animation in the codebase** (testimonial dots
  animating `width`) was found by auditing the project's own stated rule
  ("transform/opacity only") against the actual code, not by profiling —
  fixed with a `transform: scaleX()` approach that also happened to fix a
  touch-target bug in the same element.

## What I Would Improve

Honest list — none of this exists today:

- A real backend behind the donation confirmation submission, accepting name,
  address, amount paid, and a payment screenshot, and returning a submission
  ID or success/failure status.
- Secure, access-controlled storage for uploaded payment screenshots (not
  public object storage).
- An actual donation verification / admin review workflow. Nothing the
  current site does constitutes verifying a payment happened.
- An admin dashboard for reviewing and processing submissions.
- Real analytics and real, verified impact numbers (the current figures are
  the placeholder values from the product spec).
- Recurring/subscription donations.
- Donor notifications (email/SMS confirmation once a submission is
  reviewed).

---

## Resume-Ready Summary

**Project:** Sacrifice One Pizza — a single-page charity donation site
**Stack:** React, TypeScript, Tailwind CSS

**Strongest engineering points** (factual, not quantitative claims):

- Designed and implemented a lightweight, dependency-free SVG/CSS signature
  animation system, including debugging a subtle CSS animation-timing bug
  found only through direct testing of the rendered page.
- Architected a multi-step donation flow using three purpose-scoped state
  machines (step flow, form state, upload state) instead of one large
  reducer or scattered boolean flags.
- Found and fixed real accessibility defects — including three related
  focus-management bugs, a computed WCAG contrast failure, and a mismatched
  ARIA widget pattern — through direct DOM/focus testing rather than a
  static checklist pass.
- Built a fully responsive, editorial UI with zero animation-library
  dependencies and a documented, deliberate exception policy for the two
  places `requestAnimationFrame`/layout-triggering CSS are used.
