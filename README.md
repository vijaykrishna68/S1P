# Sacrifice One Pizza

A single-page charity website built to demonstrate production-quality frontend
engineering: a hand-rolled signature SVG/CSS animation, a real multi-step
donation flow with an explicit state architecture, and accessibility work that
was verified by testing, not assumed.

The premise: what you'd spend on one pizza (₹300–₹3000) can instead fund
someone's education, food, or essential needs.

**Live site:** https://sacrifice-one-pizza.vercel.app

---

## Problem

Most "donate here" flows are either a single overloaded form, or a payment
button that hands the donor off to a third-party checkout with no confirmation
step. For a UPI-based charity site with no payment gateway integration, the
honest version of this problem is: show the donor exactly how to pay (QR + UPI
ID), let them pay in their own UPI app, and then collect proof of that payment
— without ever implying the site can verify a bank transfer it has no access
to.

## Product

Sacrifice One Pizza is a donation-first landing page: hero → why it matters →
impact numbers → the donation flow itself → social proof → FAQ. The entire
page is built around getting a visitor from "interesting idea" to a completed
UPI donation in under a minute, without guilt-based messaging or poverty
imagery.

## Key Features

- A custom signature hero animation ("The Gathering Point") — small
  contributions visually joining a collective whole, built entirely in SVG +
  CSS keyframes.
- A 4-step donation flow (amount → payment → confirmation → success) with
  live amount validation, a client-generated UPI QR code, a full screenshot
  uploader state machine, and inline form validation.
- An editorial testimonial crossfade (not a carousel).
- A keyboard- and screen-reader-tested experience, including focus management
  across every donation-flow state change.
- Full `prefers-reduced-motion` support across every animated surface.

## UX Flow

```
Donate One Pizza
      ↓
Enter amount (₹300–₹3000, live-validated)
      ↓
Scan QR / copy UPI ID  →  pay in any UPI app
      ↓
"I've Paid"
      ↓
Confirmation form (name, address, amount paid, payment screenshot)
      ↓
Submit
      ↓
Success
```

The site never claims to verify the UPI transaction automatically — the
uploaded screenshot is explicitly the donor's proof of payment, persisted for
a human to review once an admin review workflow exists (see
[Future Improvements](#future-improvements)).

## Technical Architecture

```
src/
  components/
    layout/        Footer (the page shell itself is App.tsx)
    navigation/     Header, scroll-aware surface, mobile menu
    hero/           Hero section + the signature animation
    mission/        "Why One Pizza Matters"
    impact/         Impact stats + count-up hook
    donation/       The donation flow (see below)
      steps/        One component per step of the flow
    testimonials/   Editorial crossfade
    faq/            Accordion
    ui/             Small reusable primitives (Button, Container, TextLink,
                     useScrollReveal, useAutoFocus)
  styles/           Tailwind entry, design tokens, shared entrance utilities
  App.tsx           Composes every section in page order
```

**Donation state** is two small, separate reducers rather than one large one:

- `donationReducer` — which of the 4 screens is showing (`amount` → `payment`
  → `confirmation` → `success`). Changes a handful of times per donation.
- `confirmationFormReducer` — the confirmation form's own fields, validation
  errors, and submission status (`idle` → `submitting` → `error`). Changes on
  every keystroke.
- `useScreenshotUpload` — a third, independent state machine for the
  upload lifecycle (`empty` → `uploading` → `uploaded`, with `invalid`/`error`
  branches), since it doesn't map onto either of the above.

They're split because they change for different reasons at different rates —
merging them would mean every keystroke in the form re-evaluates step-
transition logic that has nothing to do with typing. See `CLAUDE.md` for the
full reasoning.

**Backend boundary:** `src/components/donation/donationService.ts` exports one
function, `submitDonation(submission): Promise<void>`. That signature is the
entire contract every component depends on. As of the backend phase, it's a
real implementation — Vercel Serverless Functions, Neon Postgres, and Vercel
Blob for screenshot storage — but nothing above this function changed to get
there, which is the actual payoff of designing the boundary before the real
backend existed. See [Technical Architecture](#technical-architecture) below
and `CLAUDE.md` for the full backend design (schema, idempotency, rate
limiting, upload validation).

## Design Decisions

- **No animation library, anywhere.** Every interaction — including the hero
  — is CSS keyframes/transitions or a handful of `IntersectionObserver`-driven
  hooks. The one deliberate exception is `useCountUp`'s single finite
  `requestAnimationFrame` count, cleaned up on completion.
- **No preset donation amounts.** The donor types their own amount; the QR
  code is generated client-side with that exact amount pre-filled into the
  UPI deep link.
- **No card grids, no decorative eyebrows/badges/pills.** Visual hierarchy
  comes from typography, spacing, and one signature animation — not
  decoration layered on top.
- **Testimonials and FAQ use the exact content confirmed in the product
  spec**, with testimonial placeholders clearly flagged as such (see the
  [Content Checklist](#content-checklist-before-real-launch) below).

## Performance

Production build (see [Deployment](#deployment) for how to reproduce):

| Asset | Raw     | Gzip    |
| ----- | ------- | ------- |
| JS    | ~374 KB | ~112 KB |
| CSS   | ~52 KB  | ~15 KB  |

JS grew from ~272 KB/~83 KB gzip after the backend phase added
`@vercel/blob/client` for direct-to-Blob screenshot uploads — a real,
measured cost of a real feature, not unexplained bloat. Note the admin
dashboard (`admin.html`) adds only ~11 KB of its own JS on top of that same
shared bundle — confirmed by comparing actual build output sizes, not
assumed from the multi-page config alone.

**Lighthouse** (against the production build via `vite preview`, not the dev
server):

| Category       | Desktop | Mobile |
| -------------- | ------- | ------ |
| Performance    | 100     | 95     |
| Accessibility  | 100     | —      |
| Best Practices | 100     | —      |
| SEO            | 100     | —      |

Accessibility and SEO started at 96/92 — both real, specific findings, not
assumed defaults: a missing `robots.txt` (Lighthouse was parsing `index.html`
as robots directives) and the primary CTA button's white text on the brand
red measuring 4.17:1, under the 4.5:1 WCAG AA minimum. Both fixed and
re-measured; see `CLAUDE.md`'s Phase 9 note and Decision Log for the exact
before/after and why the button fix uses an existing brand color rather than
an invented one. Mobile's 95 (2.4s FCP/LCP under Lighthouse's simulated
throttling) wasn't chased further — no specific fixable cause was found, and
the instruction for this phase was evidence-driven optimization, not
optimization for its own sake.

- Hero animation: `transform`/`opacity` only, CSS keyframes, no
  `requestAnimationFrame`, no canvas, no particle system — 6–11 small SVG
  shapes total.
- Only 3 font weights are self-hosted per typeface (Outfit 500/600/700, Plus
  Jakarta Sans 400/500/600) — each matched to an actual, audited use in the
  codebase, not imported speculatively.
- No `window.addEventListener('scroll')` anywhere — every scroll-driven
  behavior (header surface, section reveals, count-up triggers) uses
  `IntersectionObserver`.
- The one place a layout-triggering CSS property was ever used
  (`grid-template-rows` for the FAQ's height transition) is a deliberate,
  scoped exception — it's the only known-good CSS technique for animating to
  an unknown "auto" height, and it's contained to one small subtree.

## Accessibility

This wasn't a final checklist pass — several real bugs were found by testing
the actual rendered page and DOM state, not by reading the code:

- **Focus was silently lost at every donation-flow step transition.**
  Clicking "Donate One Pizza," "I've Paid," or submitting the confirmation
  form removed the clicked button from the DOM; browsers reset focus to
  `<body>` with no signal to keyboard or screen reader users that anything
  had happened. Fixed with a `useAutoFocus` hook — each step's heading is
  focused on mount.
- **Failed form validation didn't move focus anywhere.** `aria-describedby`
  associates an error with its field, but doesn't announce anything until
  that field is _focused_. Fixed by focusing the first invalid field after a
  failed submit.
- **Closing the mobile menu via Escape** had the same bug — focus now
  explicitly returns to the menu's toggle button.
- **Testimonial navigation used `role="tab"`/`"tablist"`**, which implies
  arrow-key roving focus between tabs per the ARIA Authoring Practices — a
  keyboard behavior that was never built. Switched to plain buttons with
  `aria-current`, an honest match for what's actually implemented.
- **A real WCAG contrast failure**, found by computing relative luminance
  directly rather than eyeballing it: the brand red (`#E63946`) on the page's
  cream background is ≈3.96:1 — under the 4.5:1 AA minimum for normal text.
  It was quietly failing on every inline validation error message. A darker
  shade already in the palette (`#C92C3A`, ≈5.1:1) is now used for error text
  specifically; the original red stays for icons and borders, which only need
  3:1.
- **Testimonial dot indicators were 6–24px** — under the 44×44px touch-target
  minimum. Fixed by separating the small visual pill from a 44px button
  around it.

`prefers-reduced-motion: reduce` is honored across every animated surface —
the hero freezes to a hand-chosen static state, testimonial autoplay and
transitions stop/simplify, the count-up jumps straight to its target, and
section reveals become immediate. Verified by walking the actual compiled
stylesheet (including nested `@layer`/`@media` rules), not just the source.

## Tech Stack

**Frontend**

- **Vite** — build tool / dev server
- **React 18 + TypeScript** (strict mode)
- **Tailwind CSS v4**
- **`qrcode.react`** — the only UI dependency beyond icons/fonts, generating a
  real, correctly-encoded UPI QR code client-side
- **`@phosphor-icons/react`** — icon set
- **ESLint + Prettier**

No animation library, no state management library, no UI component library.

**Backend**

- **Vercel Serverless Functions** (`/api`) — same repo and deploy as the
  frontend, no separate hosting or CORS to configure
- **Neon Postgres** via **Drizzle ORM** + **Drizzle Kit** (SQL-file migrations)
- **Vercel Blob** — screenshot storage, uploaded directly from the browser
- **Zod** — server-side request validation (the client's own validation is
  UX only; the server never trusts it)
- **`bcryptjs`** — admin password hashing; DB-backed opaque sessions for auth
  (not JWT — see `CLAUDE.md`'s Decision Log)

See `CLAUDE.md`'s Decision Log for why each of these specifically, over the
alternatives considered.

## Challenges & Solutions

- **The hero's rim-facet animation had a real timing bug**, found only by
  watching the rendered page, not by inspecting the code or by scrubbing the
  Web Animations API's `currentTime` (which confirmed the _mechanics_ but
  completely missed it): a negative `animation-delay` stagger — safe for the
  orbiting dots, whose resting pose looks identical at any phase — put most of
  the rim facets in their "already revealed" state on the very first frame,
  before their dot had ever moved. Fixed by giving each facet its own
  hardcoded keyframe timed to its dot's real merge moment, all sharing one
  un-shifted clock instead of a phase-shifted one.
- **The testimonial crossfade's entrance could get permanently stuck
  invisible.** The original implementation used a double-`requestAnimationFrame`
  trick to force a style flush before transitioning — standard, but dependent
  on an actual paint tick, which real browsers throttle heavily in
  backgrounded tabs. Replaced with a synchronous forced reflow
  (`element.offsetHeight`), which commits the intermediate style immediately
  regardless of whether the page is currently painting.
- **Three separate, same-shaped focus-management bugs** (donation steps,
  failed validation, mobile menu) all traced back to one root cause: a
  focused element disappearing from the DOM drops focus to `<body>` with no
  signal to assistive technology. Documented as a single pattern rather than
  three unrelated fixes — see Accessibility above.

## Admin Dashboard

An authenticated admin can sign in at `/admin.html`, see summary tiles
(total submissions, total amount, pending count), filter/paginate the
donation list, and open a submission to mark it reviewed or rejected. This
is a donation _submission and verification_ system, not a payment processor:
nothing here verifies a UPI transaction actually happened — "verification"
means a human admin reviewing the uploaded screenshot, which this dashboard
exists to support.

## Future Improvements

Honest, current list:

- **Authenticated-private screenshot storage.** Screenshots are stored at a
  random, unguessable Blob URL, but not yet gated behind admin auth the way
  the dashboard's own view of them conceptually should be — see `CLAUDE.md`
  §12.
- CI (no automated pipeline yet — see `CLAUDE.md`'s Phase Status for what's
  written vs. verified against real infrastructure).
- Real analytics.
- Recurring/subscription donations.
- Donor notifications (email/SMS confirmation).
- CAPTCHA/bot-challenge on public forms, if real spam is ever observed (a
  Postgres-backed rate limiter is the only abuse mitigation today).

## Running Locally

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check + production build
npm run preview   # preview the production build locally
npm run lint      # ESLint
npm run format    # Prettier write
```

Copy `.env.example` to `.env.local` to override the placeholder UPI ID and
phone number (both are public configuration, not secrets — see
`src/components/donation/config.ts`).

## Deployment

Deployed on Vercel as a static build (`npm run build` → `dist/`), auto-detected
as a Vite project. To redeploy:

```bash
npx vercel deploy --prod --project sacrifice-one-pizza
```

`VITE_UPI_ID` and `VITE_PHONE_NUMBER` can be set as Vercel project environment
variables to override the placeholder values without a code change — see
`.env.example`.

## Content Checklist Before Real Launch

This is a portfolio/demo build. Before this site is used for real donations,
the following must be replaced — all centralized in
`src/components/donation/config.ts` (via `.env.local`) and
`src/components/testimonials/testimonialsData.ts`:

- [ ] Real UPI ID (`VITE_UPI_ID`)
- [ ] Real contact phone number (`VITE_PHONE_NUMBER`)
- [ ] Real testimonials — 2 of the 3 shown are placeholders authored to
      demonstrate the crossfade transition, clearly flagged in
      `testimonialsData.ts`
- [ ] Real social media URLs (currently placeholders in `Footer.tsx`)
- [ ] A real Neon `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` in Vercel's
      project environment variables — the backend code is real as of this
      phase, but needs real infrastructure credentials to run
- [ ] A real admin account (`npm run db:seed-admin`, see `.env.example`) —
      there's no sign-up flow by design; someone has to create the one
      admin account once, on the real database
- [ ] Verified impact numbers (currently the placeholder figures from the
      product spec, not real totals)
- [ ] Legal/registration status copy in the FAQ, once confirmed

## Screenshots / Demo

_Pending — see the live deployment link above._
