# CLAUDE.md — Sacrifice One Pizza

Persistent engineering and design context for this project. Read this before making
architectural, UX, or motion decisions. Keep it current — if a decision documented
here changes, update the relevant section in the same commit.

---

## 1. Project Overview

**Sacrifice One Pizza** is a single-page charity website. The premise: what you'd
spend on one pizza (₹300–₹3000) can instead fund someone's education, food, or
essential needs. It's a donation-first site — the whole page exists to get a visitor
from "interesting idea" to a completed UPI donation in under a minute, without
guilt-based messaging or poverty imagery.

Built as a portfolio piece: it needs to demonstrate strong React/TypeScript
architecture, thoughtful UX, real accessibility, and restrained, purposeful motion —
not just "the components are implemented."

Source-of-truth docs: [`Docs/PRD.md`](Docs/PRD.md) (product intent, now outdated on
donation-amount mechanics and tech stack) and [`Docs/02UI_UX.md`](Docs/02UI_UX.md)
(design/UX spec, current). Where either conflicts with a decision below, this file
and direct user instruction win — see the Decision Log.

## 2. Tech Stack

- **Vite** — build tool / dev server.
- **React 18 + TypeScript** — strict mode on. No `any` without a documented reason.
- **Tailwind CSS v4** — utility-first styling via `@tailwindcss/vite`.
- **ESLint + Prettier** — enforced formatting and lint rules.
- **`qrcode.react`** — the only UI dependency beyond icons/fonts; generates a
  real, correctly-encoded UPI QR code client-side.
- **`@phosphor-icons/react`** — icon set.
- No animation library, no state management library, no UI component library.
  The hero animation and all micro-interactions are CSS/SVG-driven. Added only if a
  genuine need appears (see Decision Log before adding anything new).
- **Deployment: Vercel**, auto-detected as a Vite static build. See §13.

## 3. Design Principles

### Visual direction

Warm, trustworthy, premium-without-luxurious, human rather than corporate,
editorial rather than "componentized." One signature idea (the hero animation)
carries the site's personality; everything else stays quiet and gets out of the way.

### Typography

Display: a distinctive geometric/humanist sans (not Inter-as-default) for headlines,
weight 600–700, tight tracking, large responsive scale, short line lengths.
Body: comfortable sans, weight 400–500, 1.6–1.8 line height, 16–18px base.
No serif anywhere — this is not an editorial-luxury brief; a serif would be an
unjustified reach per the design skill's serif-discipline rule.

### Colors

| Purpose                    | Hex                                         |
| -------------------------- | ------------------------------------------- |
| Primary accent / CTA       | `#E63946` (warm tomato red)                 |
| CTA hover/active           | `#C92C3A`                                   |
| Background base            | `#FFF8F2` (soft cream, solid — no gradient) |
| Headline text              | `#1D1D1F`                                   |
| Secondary accent (sparing) | `#FF7A00`                                   |
| Success                    | `#2ECC71`                                   |
| Soft surface               | `#FDEDE3`                                   |
| Secondary text             | `#6B6B6B`                                   |

One accent color (red) used consistently for all primary actions. Orange and green
are reserved for their specific meanings (secondary emphasis / success) and never
used interchangeably with red. Minimum 4.5:1 contrast for body text everywhere.

### Spacing

8px base unit. Section spacing 80–120px desktop, 60–80px mobile. Max content width
~1200px. Generous whitespace is a primary design tool — not a placeholder for
content we haven't written yet.

### Motion philosophy

"Motion should reward attention, not demand it." The hero animation is the _only_
continuous ambient motion on the page. Everything else animates in response to a
user action (hover, focus, scroll-into-view, form state) and animates once or on
demand — never loops indefinitely outside the hero. Animate `transform` and
`opacity` only; never `top`/`left`/`width`/`height`. No decorative eyebrows, pills,
dots, or badges added purely to "feel dynamic" — every visual element must serve a
UX or storytelling purpose.

### Hero animation philosophy — "The Gathering Point" + "Absorbed Facet"

Base concept: a solid center mark (one contribution) surrounded by a handful of
faint, asymmetrically placed outline marks (other potential donors). Roughly every
4 seconds, exactly one outline mark slowly travels toward the center and merges,
while the center gives a barely-perceptible scale pulse as if receiving it. Only one
element moves at a time; the rest of the composition stays still.

**Refinement ("Absorbed Facet", added after the first visual pass):** instead of
simply vanishing at the center, a merging dot leaves a short, understated arc on the
core's rim at the exact angle it arrived from. Over one ~20s cycle the rim gathers
up to five faint facets, holds briefly once all five have arrived, then the whole
rim fades out together (a "breath," not a reset) before the cycle repeats. This
directly completes the metaphor — individual contribution becomes part of the
collective — rather than adding an unrelated decorative flourish, which is why it
was chosen over two other explored directions:

- _Bloom Ring_ (an outward ripple from the core on each merge) — rejected for
  reading too close to a generic UI "click ripple," despite being restrained.
- _Inner Spark_ (a small rotating glyph building up inside the core) — rejected as
  harder to read causally; it doesn't tie a specific arriving dot to a specific
  visible change the way a rim facet at that dot's own angle does.

**Visual hierarchy is enforced almost entirely through opacity**, and is load-bearing
for keeping this from reading as a progress meter: core (fully opaque) > dot (0.45
resting opacity) > rim facet (0.32 resting opacity, thin stroke). Facets are short,
irregular arc fragments at irregular angles — never a filling ring, never five equal
"slots," never anything a viewer could count and think "3 of 5 done."

**Timing is intentionally reused, not duplicated:** the core's existing 4s pulse
already peaks at the exact instant each dot merges (both derive from the same 4s
cadence), so the "tactile" response to a contribution arriving needed no new
animation — just confirming the existing one stays in sync.

**Facets do NOT reuse the dots' negative-`animation-delay` stagger trick — this was
tried first and shipped a real bug.** A negative delay makes an animation act as
though it had already been running before the page loaded, which is harmless for
the dots (their resting pose looks identical at any phase of the cycle) but wrong
for facets, whose only _hidden_ window is the first 8% of the cycle: any nonzero
phase offset lands most facets in the already-revealed 92% majority, so on first
paint 4 of 5 facets were visible before their dot had ever moved — caught by the
user watching the actual rendered page, not by any timing math. The fix: every
facet runs the same un-shifted 20s clock (no delay at all) and gets its own
hardcoded keyframe (`facet-reveal-0` … `facet-reveal-4` in `gatheringPoint.css`)
timed to the real moment its dot merges — computed directly from
`gathering-travel`'s existing 20s cycle, 4s stagger, and 8% merge point, so dot
timing stays the single source of truth rather than a second system. Because none
of the five have an independent phase anymore, they also all reset to hidden in
the same instant, which matters for the next part:

The rim's group fade ("breath") runs on its own un-shifted 20s clock specifically
so all facets exit together regardless of when each individually appeared;
per-facet fade-outs were considered and rejected because phase-shifting the exit
the same way as the (original, buggy) entrance produces a staggered
vanishing-one-by-one effect instead of one shared "breath."

**Verification note:** the timing was first checked only by driving each
`Animation`'s `currentTime` directly via the Web Animations API — which confirmed
the mechanics but completely missed the initial-state bug above, because that
technique never observes the untouched, natural render. The bug was only found by
inspecting the actual rendered page. Both checks are now used together: natural
`getComputedStyle` at real load time to verify the authored/initial state (all 5
facets at `opacity: 0` before anything runs), and `currentTime` scrubbing only as a
supplementary check of in-between frames. The `currentTime` method is a
supplement, never a substitute, for checking what the browser actually renders on
load.

**Reduced motion** freezes to a hand-chosen static state (facets at indices 0, 2, 4
visible, 1 and 3 hidden) rather than an arbitrary frozen frame, so it reads as
"ongoing collective effort," not empty or finished.

Explicitly rejected throughout: gradients, blobs, particle systems, mesh/aurora
effects, 3D tilt, cursor-following elements, canvas. All motion is SVG transform +
opacity (+ the facets' arc geometry), driven by CSS keyframes — no JS animation
loop, no `requestAnimationFrame`.

### Accessibility expectations

Semantic HTML and correct heading order throughout. Every interactive element
keyboard-reachable with a visible focus ring. Minimum 44px interactive target size.
`prefers-reduced-motion: reduce` freezes the hero animation to its resting state
(not just slows it) and removes non-essential transitions elsewhere. Form errors are
inline, associated to their field via `aria-describedby`, and never color-only.

## 4. UX Rules — Donation Flow

Amounts are **user-entered**, never preset buttons. Valid UPI range: **₹300–₹3000**.
Above ₹3000: the amount field shows a message directing the donor to call a
placeholder phone number (rendered as a real `tel:` link, so tap-to-call already
works on mobile — only the number itself is a placeholder).

Built in Phase 2 as two small, separate state machines rather than one large one —
see `src/components/donation/donationReducer.ts` and
`confirmationFormReducer.ts`, and the Architecture section below for why they're
split.

**Outer flow** (`DonationStep`, one per screen the donor sees):

```
amount → payment → confirmation → success
```

1. **amount** — donor enters an amount, validated live (₹300–₹3000); above ₹3000
   shows the call-us message instead of letting them proceed.
2. **payment** — QR code (real, generated client-side, encoding a UPI deep link
   with the donor's amount pre-filled), UPI ID, copy-UPI button, min/max guidance,
   "I've Paid" CTA. Never claims the app verifies payment automatically.
3. **confirmation** — form: full name, address, amount paid (pre-filled from step
   1 but independently re-validated), payment screenshot upload. Has its own
   internal submission lifecycle (below).
4. **success** — quiet confirmation (no confetti), "Back to Home" (resets the
   whole flow) + "Share the Mission" actions.

**Confirmation form's own lifecycle** (`SubmissionStatus`, nested inside step 3):

```
idle → submitting → (success bubbles up to the outer flow)
                  ↳ error (back to idle, all field values and the uploaded
                    file preserved, user can retry)
```

Validation runs synchronously on submit attempt (see `validateConfirmationForm`),
so there's no separate visible "validating" state — see the Decision Log for why
that was cut from the originally-sketched idle/validating/submitting/success/error
list.

**Screenshot upload** has its own independent state machine (`UploadState`):
empty → uploading → uploaded, with invalid and error as side branches. Drag-over
and hover are separate, transient, presentation-only states that never touch this
machine. See the Decision Log for why "uploading" here means client-side
processing, not a network call.

## 5. Architecture

### Folder structure

```
src/
  components/
    layout/           Footer (page shell itself lives in App.tsx — see below)
    navigation/       Header/nav
    hero/             Hero section + signature animation
    mission/          "Why One Pizza Matters" + its static EchoMark visual
    impact/           Impact stats + useCountUp hook
    donation/         The donation flow (see below)
      steps/          One component per DonationStep screen
    testimonials/     Editorial crossfade + placeholder testimonial data
    faq/              Accordion + FAQ content
    ui/               Small reusable primitives (Button, Container, TextLink,
                       useScrollReveal) — added on real reuse, not speculatively
  styles/             Global CSS, Tailwind entry, design tokens, shared .reveal
                       and .step-enter entrance utilities
  App.tsx             Composes all sections in page order; no page-shell
                       component was introduced since App.tsx doing this
                       directly is already small and clear
  main.tsx
```

Grown incrementally per phase — this file is updated whenever a new top-level folder
is added. No `layout/` "PageShell" component exists because `App.tsx` rendering
`<Header /><main>...sections...</main><Footer />` directly is already the simplest
possible expression of that — wrapping it in another component would be an
abstraction with no second caller.

### Donation folder in detail

```
donation/
  config.ts                      Placeholder UPI ID / phone / min-max — one file
  types.ts                       DonationStep, UploadState, FormErrors, etc.
  donationReducer.ts             Outer step machine
  confirmationFormReducer.ts     Form fields + validation + submission lifecycle
  donationService.ts             MOCK submission boundary (see below)
  useScreenshotUpload.ts         Upload state machine, independent of the form
  ScreenshotUploader.tsx         Presentational, fully controlled
  CopyUpiButton.tsx              Copy → Copied ✓ → Copy, reused nowhere else yet
  FormField.tsx                  Label + inline-error wrapper shared by 3 fields
  DonationSection.tsx            Orchestrator: owns donationReducer, renders the
                                  current step
  steps/
    AmountStep.tsx
    PaymentStep.tsx
    ConfirmationStep.tsx         Owns confirmationFormReducer + useScreenshotUpload
    SuccessStep.tsx
```

### Component conventions

Components sized by actual UI responsibility, not by arbitrary granularity. A
section (e.g. Hero) is one component tree with sub-components only when a piece is
independently reusable or independently testable (e.g. the hero's animated SVG
mark). No single giant page component; no premature splitting of markup that's used
once.

### State management

Local `useState`/`useReducer` only. No global state library — nothing on this
single-page site needs it. The donation flow uses small explicit state machines
(discriminated unions + reducers), not piles of booleans — detailed below.

### Donation state architecture (why two reducers, not one)

`donationReducer` (which screen is showing) and `confirmationFormReducer` (the
form's own fields/errors/submission status) are deliberately separate, owned by
different components (`DonationSection` and `ConfirmationStep` respectively)
instead of one large reducer threaded through props:

- They change for different reasons, on different timescales. The outer step
  changes a handful of times per donation (4 possible values, advanced by
  discrete user actions). The form's fields change on every keystroke. Merging
  them would mean every keystroke re-evaluates step-transition logic that has
  nothing to do with typing.
- The confirmation form is the only place that needs field-level state at all —
  `AmountStep`, `PaymentStep`, and `SuccessStep` have no form fields. Giving the
  outer reducer that responsibility would make it own state most of its own
  action handlers never touch.
- Each is small enough to hold in your head on its own: 4 actions for the outer
  flow, 4 for the form. A merged reducer would be a single large switch mixing
  two unrelated concerns, harder to explain and harder to test in isolation.

The screenshot upload state (`useScreenshotUpload`) is a _third_, separate piece,
for the same reason again: it has its own lifecycle (empty → uploading → uploaded,
plus invalid/error branches) that doesn't map onto either the step flow or the
text-field values. `ConfirmationStep` composes all three (the form reducer, the
upload hook, and a callback to advance the outer reducer) rather than any one of
them knowing about the others' internals.

**Why no "validating" state:** the original sketch (idle → validating →
submitting → success → error) included a visible validating step, but validation
here (`validateConfirmationForm`) is a synchronous, instant field-checking
function — there's no async work to show a state for. Adding one would mean a
state that's true for 0ms in practice, rendered for no user-visible reason. If
validation ever needs to become async (e.g. a real-time address lookup), this is
the seam where that state would get added back.

### Form architecture

`confirmationFormReducer.ts` separates validation (`validateConfirmationForm`, a
pure function taking values + upload state, returning an errors object) from state
transitions (the reducer itself). This means validation can be reasoned about and
changed without touching how the form's state machine works, and the exact
messages ("Please enter your name.", etc.) live in one place matching the spec
text exactly.

Editing a field clears only _that_ field's error (`FIELD_CHANGED` clears
`errors[field]`, not all of `errors`), so correcting your name doesn't hide a
still-real address error. Errors don't reappear until the next submit attempt —
this project deliberately does not re-validate on every keystroke, since that
tends to read as the form scolding you mid-sentence rather than confirming a
finished field. Submission failure (`SUBMIT_FAILED`) never clears `values` — the
donor's typed data always survives an error.

### Upload handling

"Uploading" in `useScreenshotUpload` is honest about what it represents: there is
no backend yet, so nothing is transferred over a network when a file is selected.
The state models _local processing_ (generating a preview via
`URL.createObjectURL`), with a short synthetic minimum delay (500ms) purely so the
state is visible instead of an imperceptible flash — this is disclosed in a code
comment, not left to look like a fake "upload succeeded" claim. The real transfer
of the file happens once, bundled into the whole form's submission, when
`donationService.submitDonation` is called with the `File` object attached.

Object URLs are revoked (`URL.revokeObjectURL`) whenever a file is replaced,
removed, or the component unmounts while one is still held, tracked via a ref
(not state) specifically so the revocation can happen inside effect cleanup
without triggering a render.

### Backend boundary

`donationService.ts` exports one function, `submitDonation`, whose signature
(accepts a `DonationSubmission`, resolves on success, throws on failure) is the
entire contract every component depends on. Nothing above it knows or cares that
the current implementation is `await sleep(1100ms)`. Wiring up a real endpoint
later — including the actual screenshot upload — means changing the body of this
one function and nothing else. It's intentionally not over-built with retry logic,
request cancellation, or a generic API client, since none of that has a real
requirement yet; adding it now would be architecture for architecture's sake.

### Testimonial transition approach

The crossfade is hand-rolled with a small `phase` state machine
(`idle → exiting → entering → idle`) rather than an animation library, matching
the project's existing "no new dependency until there's a genuine need" stance
(see the hero's own decision not to add `motion/react`). Advancing calls
`goTo`, which fades the current pair out, swaps the index after the exit
transition's duration, then fades the new pair in.

The entering → idle handoff was originally done via a double
`requestAnimationFrame`, which is the standard technique for "wait one paint tick
so the browser commits a style before transitioning it." That turned out to be
fragile: rAF only fires on an actual paint tick, and real browsers throttle rAF
heavily (sometimes almost to a stop) in backgrounded tabs — a transition that
started right as a user switched tabs could get stuck invisible waiting for a
frame that never comes in time. It was replaced with a synchronous forced
reflow (reading `element.offsetHeight`) instead, which commits the intermediate
style immediately regardless of whether the page is currently painting, so the
follow-up class change reliably animates. This was caught by directly testing the
built page's behavior, not by inspecting the code — see the note in the hero
philosophy above about the same lesson from the "Absorbed Facet" bug.

Autoplay pauses on hover/focus (`isPaused`) and is skipped entirely under
`prefers-reduced-motion: reduce`, in which case `goTo` also skips the phase
choreography and jumps the index directly — no invisible mid-transition frame for
reduced-motion users to sit in.

### Styling

Tailwind utility classes for layout/spacing/color. Design tokens (colors, font
families) defined once as CSS custom properties / Tailwind theme extensions, not
repeated as raw hex values in components. The hero's keyframe animations live in a
small dedicated CSS file (`hero.css` or CSS module) because expressing a multi-stage
transform/opacity sequence in Tailwind utility classes alone would hurt readability
more than it helps — this is an intentional, documented exception, not utility-class
avoidance in general.

### Utility functions

Added only when a piece of logic is used in more than one place (e.g. currency
formatting for ₹ amounts once the donation flow exists).

### API / service boundaries

`src/components/donation/donationService.ts` is the only one so far — see its
own section above. No generic `services/` folder was introduced for a single
function; if a second real API call appears in Phase 3+, that's the point to
introduce one.

## 6. Decision Log

- **Tailwind v4 over v3** — simpler setup via `@tailwindcss/vite`, no separate
  PostCSS config needed, and it's the current version going forward.
- **No animation library for the hero** — the "Gathering Point" concept only needs
  a handful of elements animating transform/opacity on staggered CSS keyframes.
  Reaching for `motion/react` here would be paying a bundle-size cost for something
  native CSS already does well. (Re-evaluate for Phase 2/3 micro-interactions if a
  genuine orchestration need shows up — e.g. coordinated enter/exit state changes in
  the donation flow.)
- **No gradient hero, solid cream background** — explicit user requirement, also
  avoids the single most common "AI-generated landing page" tell.
- **Donation amounts are user-entered, not preset buttons** — overrides the PRD
  (which specified ₹300/₹500/₹700/₹1000 preset buttons) per direct, later user
  instruction. UPI range is ₹300–₹3000 (PRD said ₹300–₹1000; superseded).
  Above-₹3000 donors are directed to call a phone number instead.
  See `Docs/02UI_UX.md` §5.1, which already reflects this.
- **Static HTML/CSS/JS (per PRD) rejected in favor of React + TypeScript +
  Tailwind** — direct user instruction; this is a portfolio piece meant to
  demonstrate frontend engineering, not a minimal static MVP.
- **Testimonials will use an editorial crossfade, not a card carousel** — direct
  user instruction, matches `Docs/02UI_UX.md` §6.2. Built in Phase 2.
- **Hero concept "The Gathering Point" approved as a direction, not a locked
  spec** — user explicitly asked for it to be built, visually evaluated in the
  real composition, and refined if it reads as too literal, generic, decorative,
  or weak. Any deviation from the original concept description will be logged here
  once Phase 1 implementation is evaluated.
- **"Absorbed Facet" chosen over "Bloom Ring" and "Inner Spark"** for the hero's
  arrival effect — user's stated reason: it's the only one of the three that
  completes the existing metaphor (individual → collective) instead of adding a
  decorative effect alongside it, and it does so with one mechanism that also
  answers the separate "should the core evolve over time" question, rather than
  needing two unrelated systems. Full rationale in §3's hero animation philosophy.
- **Facets use 5 hardcoded per-index keyframes instead of the dots' shared
  keyframe + negative-delay stagger** — the delay trick shipped a real bug (4 of 5
  facets visible on first paint, before their dot ever moved), found by the user
  watching the rendered page, not by timing math. Root cause and fix are detailed
  in §3. General lesson worth keeping: a delay-based phase shift is only safe for
  an element whose resting/idle appearance is uniform across the whole cycle; it's
  unsafe for anything with a short, distinct "hidden" window like the facets have.
- **`transform-box: fill-box` on every animated SVG shape** — without it, `scale()`
  and the translate-to-center transform operate around the SVG viewport's origin
  (0,0), not each circle's own center, so dots would arc through the wrong path and
  the core would appear to grow from its top-left corner instead of pulsing in
  place. Easy to miss; documented so it isn't "fixed" back out later.
- **Scroll-aware header uses a 1px sentinel, not a 0-height one** — a zero-height
  element gives `IntersectionObserver` a degenerate bounding box and the ratio
  calculation becomes unreliable. The sentinel sits immediately below the header in
  document flow so "sentinel not intersecting" reliably means "user has scrolled
  past the top."
- **`vite.config.ts` reads `server.port` from `process.env.PORT`** — needed so the
  dev server binds to whatever port the local preview tooling assigns rather than
  always trying 5173 and silently falling back, which broke the preview proxy
  during Phase 1 development.
- **Mission's supporting visual is a small static SVG echo of the hero's own
  motif (`EchoMark`), not photography** — the design skill's asset strategy
  requires real images or generated ones, explicitly bans fake "charity"
  photography built from CSS/div shapes, and the user's Phase 2 brief repeated
  that instruction directly. No real photography asset exists yet, and inventing
  a generic stock-looking image would be worse than not having one. Reusing the
  hero's visual language also literally satisfies "should feel like a
  continuation of the hero" without a new asset dependency.
- **`qrcode.react` added as a dependency** — the payment QR needs to be a real,
  correctly-encoded UPI deep link (`upi://pay?pa=...&am=...`), not an image
  placeholder; this is a small, purpose-built library doing something genuinely
  needed, not decoration. Encodes the donor's already-entered amount, so the UPI
  app can pre-fill it.
- **Testimonials include 2 authored placeholder quotes beyond the one confirmed
  one in `Docs/02UI_UX.md`** — that document's own "Open Content Decisions"
  section lists real testimonial content as still unconfirmed, unlike the FAQ and
  impact figures (treated as fixed spec content and not extended). Without a
  second and third quote there would be nothing for the crossfade transition to
  demonstrate. Named with realistic first names and specific roles, not "Jane
  Doe"-style placeholders — flagged clearly in `testimonialsData.ts` as
  placeholder content pending real donor quotes.
- **Testimonial attribution uses `<p>`, not `<footer>`** — `<footer>` nested
  inside `<blockquote>` still maps to the page's `contentinfo` landmark role per
  the HTML/ARIA spec (blockquote isn't one of the sectioning elements that
  suppress it), which would have put two "footer" landmarks on the page. Found
  by inspecting the actual accessibility tree, not by code review.
- **`useScrollReveal` (opacity/translateY-on-first-view) extracted as a shared
  hook instead of copying the hero's entrance CSS per section** — Mission,
  Impact's heading, Testimonials' heading, FAQ's heading, and the donation
  success state all needed the same "fade and lift in once, respect reduced
  motion" treatment. Building it once as a hook + one shared `.reveal` CSS class
  avoided five near-identical small CSS files. The donation section's _outer_
  container deliberately does NOT use it, since its `step-enter` transition
  already serves as its own entrance — stacking both would be two mechanisms
  doing the same job.
- **`useCountUp` restructured around a lazy `useState` initializer instead of
  calling `setValue` synchronously inside the effect body** — the stricter
  `react-hooks/set-state-in-effect` lint rule (from the React Compiler-aligned
  version of eslint-plugin-react-hooks) flags that pattern. Reading
  `prefers-reduced-motion` once via a lazy initializer and branching on the
  resulting state, rather than checking it fresh inside the effect, satisfies
  the rule without changing behavior.
- **`@typescript-eslint/no-unused-vars` configured with `argsIgnorePattern:
'^_'`** — added so `donationService.submitDonation`'s parameter (which exists
  to define the mock's type contract, not to be read yet) doesn't need a
  disable comment. Applies project-wide as a convention, not a one-off.
- **Donation flow steps move keyboard/screen-reader focus to the new step's
  heading on mount (`useAutoFocus`)** — found during the Phase 3 accessibility
  audit: advancing a step (e.g. clicking "Donate One Pizza") removes the
  clicked button from the DOM, and browsers silently reset focus to `<body>`
  when the focused element disappears. A keyboard or screen reader user got no
  indication anything had happened. Each step's `<h2>` now has `tabIndex={-1}`
  (focusable programmatically, not in the normal tab order) and is focused via
  a one-line effect on mount. Verified end-to-end: focus lands on the correct
  heading after every transition, including into the success state.
- **Confirmation-form validation failure focuses the first invalid field**
  (`FIELD_FOCUS_ORDER` in `ConfirmationStep.tsx`) — same audit, same root
  cause class: `aria-describedby` associates an error with its field, but
  doesn't announce anything until that field is _focused_. Without moving
  focus there, a screen reader user who submits an incomplete form hears
  nothing change. Priority order (name → address → amount → screenshot)
  matches the form's visual order.
- **Mobile menu returns focus to its toggle button when closed via Escape**
  — same class of bug again: the mobile nav's links are conditionally
  rendered, so closing the menu while focus rests on one of them stranded
  focus at `<body>`. Fixed by focusing the toggle button (`menuToggleRef`) in
  the Escape handler specifically. Deliberately _not_ applied to the nav
  links' own `onClick` (which still just closes the menu) — those clicks are
  real navigation to a page section, and forcing focus back to the toggle
  button would fight the browser's own fragment-navigation focus behavior for
  no benefit.
- **Testimonial dot indicators no longer animate `width`** — found via the
  Phase 3 performance pass: `transition-[width,background-color]` was the one
  place in the codebase still animating a layout-triggering property, against
  the project's own transform/opacity-only motion rule (§3). Fixed by giving
  every dot a fixed-width visual `<span>` and animating `transform: scaleX()`
  from a `origin-left` instead — same growing-pill look, compositor-only.
  This also surfaced a second, unrelated bug in the same element: the dots
  were only 6-24px, far under the 44px touch-target minimum. Fixed together
  by separating the (small) visual pill from the (44px) clickable button.
- **Testimonial navigation uses `role="group"` + `aria-current`, not
  `role="tab"`/`role="tablist"`** — the original Phase 2 implementation used
  the ARIA tabs pattern, which implies arrow-key roving focus between tabs
  per the WAI-ARIA Authoring Practices. That keyboard behavior was never
  built. Claiming the widget role without its required interaction is worse
  than not claiming it — a screen reader user would be told they're in a
  tablist and then find arrow keys do nothing. Switched to a lighter, honest
  pattern: plain buttons, grouped for context, marked current via
  `aria-current`.
- **Error text recolored from `--color-red` to `--color-red-deep`** — the
  Phase 3 contrast audit computed `#E63946` on the page's cream background at
  ≈3.96:1, under the 4.5:1 WCAG AA minimum for normal-size text (it clears
  the 3:1 minimum for large text and for non-text UI elements like icons and
  borders, which is why those usages were left alone). `#C92C3A`
  (`--color-red-deep`, already in the palette as the button hover/active
  shade) computes to ≈5.1:1 and was reused for this rather than introducing a
  new color. Applies to `FormField`'s error text, the amount-step validation
  messages, the screenshot uploader's invalid/error text, and the
  confirmation form's submission-failure alert.
- **Outfit 500 added as a third self-hosted weight** — the Phase 3 asset
  audit found four places (`Header` nav links, the PaymentStep UPI-ID
  display, testimonial quotes) requesting `font-display` at `font-medium`
  (500), but only Outfit 600/700 were ever imported, so browsers were
  silently substituting the nearest loaded weight. Rather than flattening
  those four spots to 600 (losing a real, intentional mid-weight tier between
  body text and UI-semibold labels), the missing weight was added — a small,
  justified cost for correctness instead of an accidental one-size type
  scale.
- **The favicon and README were still the unedited Vite scaffold defaults**
  — found during the Phase 4 production-readiness audit, not before. The
  favicon was a generic purple gradient mark completely unrelated to the
  brand (exactly the kind of leftover-template tell this project spent three
  phases avoiding elsewhere); the README still read "React + TypeScript +
  Vite" with generic template instructions. Both were replaced (favicon: a
  small cream-and-red mark reusing the hero's own core-circle motif; README:
  a full engineering case study). Neither had been touched since the Phase 1
  scaffold step, and nothing in Phases 1–3 had reason to open either file —
  a reminder that a fresh, dedicated production-readiness pass finds things a
  feature-by-feature review structurally cannot.
- **UPI ID and phone number moved to env-overridable config**
  (`VITE_UPI_ID`, `VITE_PHONE_NUMBER` in `.env.example`, read in
  `donation/config.ts` with the existing placeholder values as fallback) —
  these are public configuration, not secrets (a UPI ID and a contact number
  are meant to be publicly visible to donors), so this isn't a security
  measure. It means the real values can be set once in Vercel's project
  settings and take effect on the next deploy, with no code change and no PR.
  The QR code is generated client-side from `upiId`, so updating it updates
  the QR automatically — there's no separate static image to remember to
  swap.
- **The Open Graph share image was generated by rendering hand-written SVG
  onto an in-browser `<canvas>` and exporting `toDataURL('image/png')`**,
  rather than a design tool — no image-generation tool was available in this
  environment. The SVG source is kept at `scripts/og-image-source.svg` for
  future edits. Deliberately restrained to match the rest of the site: solid
  cream background, the hero's own core-circle-plus-faint-outline-dots motif,
  bold typography, no gradient.
- **Deployed via `vercel deploy --temporary`, then a named project was
  created explicitly (`vercel project add sacrifice-one-pizza`) after the
  auto-derived project name was rejected** (Vercel's project-name validation
  rejected whatever name it tried to derive from the working-directory path;
  explicitly naming the project sidestepped the issue rather than debugging
  the auto-derivation logic further — not worth the time for a one-time
  setup step).
- **Git history reconstructed as logical feature-area commits, not a literal
  replay of development** — this project wasn't committed incrementally
  during Phases 1–3, so the commit history was built after the fact, grouped
  by concern (scaffold → design system/hero → core sections/donation →
  testimonials/FAQ → production config → docs) rather than by literal
  chronological diffs. This is an honest labeling distinction worth keeping:
  the commits are real and the grouping is meaningful, but they don't
  represent a turn-by-turn history of every bug fixed along the way (those
  are documented in this file's Decision Log entries instead).

## 7. Performance Rules

- Hero animation: `transform` + `opacity` only, CSS keyframes (no `requestAnimationFrame`,
  no scroll listeners, no JS animation loop). Small, fixed number of animated SVG
  nodes (single digits), not a generated/looped particle set.
- No `backdrop-filter`/heavy blur, no continuous box-shadow animation.
- Images (once added in later phases) must be sized/optimized and not block LCP.
- Target: smooth on mid-range mobile. If the hero ever visibly affects scroll or
  input responsiveness, simplify the animation before adding optimization
  complexity (e.g. `will-change`) on top of it.
- `requestAnimationFrame` **is** used in Phase 2, deliberately, in exactly one
  place: `useCountUp`'s single ~1.1s finite count animation, cleaned up on
  completion and on unmount. This doesn't conflict with the hero's "no rAF" rule
  — that rule targets continuous/ambient loops, not a short one-shot animation
  with a clear end and proper cleanup. The testimonial transition originally
  used rAF too (a double-rAF style-flush trick) and that one was a mistake — see
  the Decision Log — replaced with a synchronous forced reflow specifically
  because it needed to work reliably without depending on the browser's paint
  scheduler.
- All scroll-position-driven behavior (header surface, section entrances, count-
  up triggers) uses `IntersectionObserver`, never a `scroll` event listener.
- The Impact section's four counters and the donation success state's entrance
  are the only other JS-driven, non-continuous animations; everything else in
  Phase 2 is a CSS transition (crossfade, accordion height, form field focus,
  button/link hover) triggered by discrete user actions.

## 8. Accessibility Rules

- Semantic landmarks (`header`, `main`, `nav`, `footer`), one `h1` per page, no
  skipped heading levels. Verified via the actual accessibility tree, not just
  by eye — this is how the duplicate-`contentinfo`-landmark bug (testimonial
  `<footer>`) was caught.
- All interactive elements reachable by keyboard with a visible focus ring
  (`:focus-visible`, never suppressed).
- Minimum 44×44px touch targets for buttons/links used as controls, including
  every donation-flow button, the screenshot uploader's replace/remove controls,
  the FAQ accordion triggers, and the testimonial dots (a 44px button wraps
  each dot's small visual pill, rather than the pill itself being the target).
- `prefers-reduced-motion: reduce` freezes the hero to a static resting frame —
  not just a slower version of the same loop. Same treatment extended to the
  testimonial crossfade (jumps directly, no phase choreography) and the FAQ
  accordion (`motion-reduce:transition-none` on the height transition).
- Color is never the only signal (errors, success, active states all pair color
  with an icon, text, or border change).
- Form fields have visible `<label>`s (via the shared `FormField` wrapper),
  inline errors tied via `aria-describedby`, `aria-invalid` reflecting real
  validation state, and no placeholder-as-label. Validation messages match the
  spec text exactly.
- The screenshot uploader's file input stays in the DOM and in the tab order
  (`sr-only`, not `display: none`) so it's keyboard-operable — Tab reaches it,
  Enter/Space opens the native file picker — with the visible dropzone showing a
  focus ring via `has-[:focus-visible]:` when that hidden input is focused.
- The QR code has real, specific alt text (`role="img"` + `aria-label`) matching
  the spec's required wording; the UPI ID is also shown as plain, selectable
  text alongside it, so the QR is never the only way to get the payment details.
- Testimonial navigation uses plain `<button>`s with `aria-current`, not
  `role="tab"`/`"tablist"` — that ARIA pattern implies arrow-key roving focus
  between tabs, which isn't implemented, so claiming it would tell assistive
  tech users a keyboard interaction exists that doesn't. See the Decision Log.
- **State-transition focus management** (added in Phase 3's accessibility
  audit): every donation-flow step moves focus to its own heading on mount
  (`useAutoFocus`), a failed confirmation-form submit moves focus to the first
  invalid field, and closing the mobile menu via Escape returns focus to its
  toggle button. All three fix the same underlying failure mode — a focused
  element disappearing from the DOM and silently dropping focus to `<body>`,
  which leaves keyboard and screen reader users with no signal that anything
  changed. Verified end-to-end via `document.activeElement` after each
  transition, not just by inspecting the JSX.
- Contrast checked by computing WCAG relative luminance directly, not
  eyeballed: `--color-red` (#E63946) on the cream background is ≈3.96:1,
  under the 4.5:1 minimum for normal text, so it was never used for readable
  error copy (`--color-red-deep`, ≈5.1:1, is used there instead) — but it's
  kept for icons and borders, which only need 3:1 and where it still reads as
  the correct brand color.

## 9. Development Commands

```bash
npm install       # install dependencies
npm run dev       # start Vite dev server
npm run build     # type-check + production build
npm run lint      # ESLint
npm run format    # Prettier write
npm run preview   # preview the production build locally
```

Redeploy: `npx vercel deploy --prod --project sacrifice-one-pizza` (see §13).

## 10. Phase Status

- **Phase 1 — Foundation + design system + hero:** complete and approved by the
  user, including the "Absorbed Facet" hero refinement. Locked per explicit user
  instruction — no further visual effects added to the hero unless a later phase
  creates a genuine design conflict.
- **Phase 2 — Core website + donation experience:** complete and approved by
  the user. Mission, Impact, the full donation flow (amount → payment →
  confirmation → success), Testimonials, FAQ, and Footer.
- **Phase 3 — Interaction + accessibility + performance polish:** complete.
  Audited every existing interaction against "what does this communicate?"
  rather than adding new ones — no new decorative motion was introduced. Found
  and fixed real issues rather than just producing a report: three focus-
  management gaps (donation step transitions, failed-validation focus,
  mobile-menu-close focus), one WCAG contrast failure (error text color), one
  layout-triggering animation (testimonial dots' `width` transition), one
  mismatched ARIA widget pattern (testimonial `role="tab"` without its
  required keyboard behavior), and one missing font weight causing silent
  browser substitution. Full verification: `tsc -b`, `eslint`,
  `prettier --check`, and `vite build` all clean; responsive re-checked at
  375/768/1024/1440 with no overflow; reduced-motion coverage confirmed
  complete by walking the actual compiled stylesheet (including nested
  `@layer`/`@media` rules) rather than assuming; the full donation flow
  re-verified end-to-end after every fix, including that focus lands on the
  correct heading at each step. Pending the user's own visual pass, same
  caveat as Phases 1 and 2.
- **Phase 4 — Production + deployment + portfolio readiness: complete.**
  Fresh production-readiness pass against the current codebase (not a reuse
  of Phase 3's results) found and fixed two real leftover-scaffold bugs (the
  Vite-default favicon and README, neither ever touched since Phase 1),
  moved UPI ID/phone number to env-overridable public config, added full
  SEO/Open Graph/Twitter Card metadata and a hand-built on-brand share image,
  wrote the README and `Docs/CASE_STUDY.md`, reconstructed a logical git
  history, and deployed to Vercel. **The live deployment was tested directly
  after going live** — not assumed from the local build: fresh page load,
  full donation flow end-to-end (including Phase 3's focus-management
  fixes), metadata/favicon/OG-image verification, and mobile viewport, all
  against `https://sacrifice-one-pizza.vercel.app` itself. See §13 for full
  deployment details and §12 for known limitations.

## 11. Portfolio Case-Study Highlights

The strongest engineering/design decisions in this project, for when it's
written up as a case study. Each links back to the fuller reasoning elsewhere
in this file rather than repeating it.

1. **The signature hero animation ("The Gathering Point" + "Absorbed Facet")**
   is the project's centerpiece: five outline dots orbiting a solid core,
   merging one at a time and leaving a permanent trace on the core's rim. The
   whole thing is ~6-11 SVG shapes animated with CSS keyframes and custom
   properties — no animation library, no `requestAnimationFrame` loop. The
   real story here is the debugging: two real, subtle bugs were found by
   watching the _rendered page_, not by reading the code or trusting a
   `currentTime`-scrubbing check of the animation model (which caught the
   timing math but missed both bugs). See §3's hero animation philosophy for
   the full account — it's a genuinely good story about why "the mechanism is
   correct" and "the page looks right" are different claims.
2. **Donation state architecture** — two small reducers instead of one big
   one, split along the axis of "how often does this change and who needs to
   know," not along arbitrary file boundaries. `donationReducer` owns which
   screen is showing (a handful of transitions per donation); the separate
   `confirmationFormReducer` owns form fields that change on every keystroke.
   A third independent piece (`useScreenshotUpload`) handles the upload
   lifecycle. See §5's donation-state-architecture note for why this is 3
   small, explainable machines rather than 1 large one or 6 booleans.
3. **Lightweight interaction architecture** — no `motion/react`, no animation
   library anywhere in the project, and exactly one deliberate, documented
   exception to "no continuous JS animation" (`useCountUp`'s single finite
   rAF-driven count, cleaned up on completion). Every other interaction is a
   CSS transition triggered by a discrete user action or a state change. The
   testimonial crossfade's entrance bug (rAF-based, replaced with a forced
   reflow — §5's testimonial-transition note) is a good concrete example of
   _why_ that discipline matters: it's not just "fewer dependencies," it's
   that hand-rolled CSS transitions have their own real failure modes worth
   understanding rather than delegating to a library and hoping.
4. **Accessibility work that found real bugs, not just checkboxes** — the
   Phase 3 audit didn't just confirm labels and landmarks exist; it found and
   fixed three separate focus-management gaps (donation step transitions,
   failed-form-submission, mobile-menu-close) that share one root cause —
   focus silently dropping to `<body>` when its element leaves the DOM — plus
   a computed (not eyeballed) WCAG contrast failure, and a mismatched ARIA
   widget pattern (testimonial `role="tab"` without the keyboard behavior it
   implies). See §8 and the Decision Log.
5. **Performance decisions made by rule, then broken by exception,
   deliberately** — the project's one hard rule (animate `transform`/`opacity`
   only, never layout properties) was violated exactly once by accident
   (testimonial dots animating `width`) and caught by auditing against that
   rule specifically, not by profiling. Two rAF exceptions to the "no
   continuous JS loop" rule are each justified in writing (`useCountUp`: a
   finite, cleaned-up, one-shot animation; the FAQ's `grid-template-rows`
   height transition: a deliberate, scoped use of a layout-triggering
   property because it's the only known-good CSS technique for animating to
   an unknown "auto" height). See §7.

## 12. Known Limitations

Honest, current, non-exhaustive:

- **No real backend.** `donationService.submitDonation` is a mock that
  always succeeds after a simulated delay. No donation submitted through
  this site is actually recorded anywhere. See §4 and the README's Future
  Improvements for what a real backend behind it would need to accept
  (name, address, amount paid, payment screenshot) and return.
- **No payment verification of any kind.** The UI is careful never to imply
  otherwise, but it's worth stating plainly here too: nothing about this
  site verifies a UPI transaction happened. The uploaded screenshot is the
  donor's claim, not a verified fact.
- **Placeholder content still in place**: the UPI ID, phone number (both in
  `donation/config.ts`, overridable via `VITE_UPI_ID`/`VITE_PHONE_NUMBER`),
  2 of 3 testimonials, social media links (`Footer.tsx`), and the impact
  figures are all placeholders from the product spec, not real data. See the
  README's Content Checklist.
- **No portfolio screenshots captured.** Automated screenshot capture wasn't
  reliably available in the development environment this project was built
  in (see the note on non-compositing browser sessions throughout this
  file's Decision Log) — screenshots of the live deployment should be taken
  manually before this goes into a portfolio.
- **Social links go nowhere** (`href="#"` in `Footer.tsx`) — clearly a
  placeholder, not a broken-link bug, but worth listing here so it isn't
  mistaken for one.
- **Single supported locale/currency.** No internationalization; ₹ and
  Indian UPI conventions are hardcoded assumptions throughout the donation
  flow, not configurable.

## 13. Deployment

- **Live URL:** https://sacrifice-one-pizza.vercel.app
- **Platform:** Vercel, auto-detected as a Vite static build
  (`vite build` → `dist/`, no server-side code).
- **Vercel project:** `sacrifice-one-pizza`, under the account linked to
  this deployment (created via `vercel project add`; see the Decision Log
  for why the auto-derived project name failed).
- **Repository:** https://github.com/vijaykrishna68/S1P (`main` branch).
- **Redeploy:**
  ```bash
  npm run build   # optional — vercel deploy builds it too
  npx vercel deploy --prod --project sacrifice-one-pizza
  ```
- **Environment variables** (optional, public config — see §6's decision
  log entry): set `VITE_UPI_ID` and `VITE_PHONE_NUMBER` in the Vercel
  project's settings to override the placeholder values without a code
  change. Unset, the app falls back to the obvious placeholders in
  `donation/config.ts`.
- **Verified directly against the live URL** (not inferred from the local
  build): fresh page load with a clean console and all-200 network
  requests, canonical/OG/favicon metadata, the full donation flow end-to-end
  including Phase 3's focus-management fixes, and a mobile viewport
  (375px) reload with no horizontal overflow.
