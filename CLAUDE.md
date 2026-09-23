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
- **Backend: Vercel Serverless Functions** (`/api`), same repo/deploy/origin as the
  frontend — see §5's Backend section and §13. As of Phase 5, only the donation
  submission path is live; admin auth/dashboard land in later phases (§10).
- **Database: Neon Postgres**, direct (not the Vercel-managed integration).
- **`drizzle-orm` + `drizzle-kit`** — schema and SQL-file migrations for the four
  tables in `db/schema.ts`. See the Decision Log for why Drizzle over Prisma/raw `pg`.
- **`pg` (node-postgres)** — the actual driver, via `drizzle-orm/node-postgres`, not
  Neon's HTTP/edge driver. See the Decision Log.
- **`zod`** — server-side request validation in `api/_lib/validation.ts`. The
  client's own validation (`validateConfirmationForm`) is UX only; the server never
  trusts it.
- **`bcryptjs`** — pure-JS bcrypt (not the native-binding `bcrypt` package),
  chosen specifically to avoid cross-compiling a native module between this
  Windows dev machine and Vercel's Linux runtime.
- **Vercel Blob** — screenshot storage, uploaded directly from the browser via
  `@vercel/blob/client`'s `upload()`/`handleUpload()` client-upload pattern (bypasses
  the serverless function body-size limit). See the Decision Log for the access-level
  caveat.
- **Deployment: Vercel**, auto-detected as a Vite static build for the frontend, plus
  the `/api` serverless functions. See §13.

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
| Primary accent (non-text)  | `#E63946` (warm tomato red)                 |
| CTA resting fill           | `#C92C3A` (`--color-red-deep`)              |
| CTA hover/active           | `#9F232E` (`--color-red-darkest`)           |
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

### Repo-level structure (as of Phase 1's backend)

```
api/                  Vercel Serverless Functions — see the Backend section below
db/                   Drizzle schema, DB client, generated SQL migrations
shared/               Plain constants imported by BOTH src/ and api/ (see below)
src/                  The frontend — see Folder structure below
```

`db/` and `shared/` are outside `src/` deliberately: `src/`'s own tsconfig
(`tsconfig.app.json`) targets the browser (DOM lib, `import.meta.env`), while `api/`
and `db/` run in Vercel's Node.js runtime and are checked under a separate
`tsconfig.api.json` (Node lib, no DOM). `shared/` has neither runtime's
environment-specific globals, which is exactly why the two donation limits
(`shared/donationLimits.ts`, `shared/screenshotLimits.ts`) live there instead of
inside `src/components/donation/config.ts` — that file reads `import.meta.env`,
a Vite-only global that would throw if imported from a Node function.

### Backend

```
api/
  donations/
    index.ts          POST — creates a donation (public, rate-limited)
  uploads/
    screenshot.ts      POST — issues a constrained Vercel Blob client-upload token
  admin/
    login.ts           POST — bcrypt-verify + create a DB-backed session
    logout.ts          POST — delete the session row + clear the cookie
    me.ts              GET — current admin identity via requireAdmin, or 401
  _lib/                Business logic, imported by route handlers AND by
                        integration tests directly — never inlined into a handler.
                        Vercel's convention: an underscore-prefixed folder under
                        `api/` is never treated as a route.
    validation.ts       Zod schemas — the server-side re-validation of every rule
                        the frontend already enforces client-side for UX.
    donations.ts        createDonation() — idempotency check, rate limit, screenshot
                        magic-byte verification, insert. See its own doc comment
                        for the exact, deliberate order of these steps.
    password.ts          hashPassword/verifyPassword — pure bcrypt, deliberately
                        with no db/client.ts import (see Decision Log).
    auth.ts               Session lifecycle: createSession, getAdminIdentity,
                        requireAdmin, invalidateSession, cookie helpers.
    rateLimit.ts         Postgres-backed fixed-window counter, shared by the
                        donation and login endpoints via a purpose-prefixed
                        key (`donation:<ip>` / `login:<ip>`) — see Decision Log.
    magicBytes.ts         Real image-signature sniffing, not just declared MIME type.
    http.ts               sendError/sendJson/getClientIp/methodNotAllowed — shared
                        request/response helpers used by more than one route.
```

`api/donations/[id].ts` (`GET` detail / `PATCH` status, both admin-only via
`requireAdmin`) and `api/donations/index.ts`'s `GET` branch (paginated,
status-filterable list + summary) back the admin dashboard — see the
Frontend section below.

### Admin frontend

A second Vite entry, separate from the public donor-facing SPA:

```
admin.html                    New HTML entry, mounts into #admin-root
src/admin/
  main.tsx                    Entry point
  AdminApp.tsx                 Owns auth-check state + which of 2 views is showing
  api.ts                       fetch wrappers for /api/admin/* and /api/donations
  LoginPage.tsx
  DashboardPage.tsx             Summary tiles + status filter + paginated table
  SubmissionDetail.tsx           Full record + screenshot + status-change buttons
```

Reuses `src/components/ui/Button.tsx` and `src/components/donation/FormField.tsx`
rather than duplicating them — both were already generic enough to not be
donation-flow-specific. `vite.config.ts`'s `build.rollupOptions.input` builds
`admin.html` as its own bundle, verified (by comparing actual output byte
counts, not assumed) to add nothing to the public page's own download.

### Frontend folder structure

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
entire contract every component depends on. As of Phase 1, its implementation is
real — it uploads the screenshot to Vercel Blob, then POSTs the donation metadata to
`POST /api/donations` — but nothing above it changed at all: not `ConfirmationStep`,
not either reducer. That's the payoff of having designed the boundary before a real
backend existed. `DonationSubmission` gained one field, `idempotencyKey`, generated
once per submission attempt in `ConfirmationStep` (not per HTTP request) so a retry
of the same attempt is safely absorbed server-side rather than creating a duplicate
row — see `api/_lib/donations.ts`'s doc comment. Still intentionally not over-built
with retry logic, request cancellation, or a generic API client, since none of that
has a real requirement yet.

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
- **Drizzle ORM + Drizzle Kit, not Prisma** — the schema is four small tables;
  Prisma's binary query engine adds real cold-start/bundle-size cost inside a
  Vercel serverless function for no corresponding benefit at this scale, and
  Drizzle's SQL-file migrations stay readable in review. Raw `pg` with hand-written
  SQL was also considered and rejected only because it throws away type-safe
  queries and migration tooling for no real savings at 4 tables.
- **`pg` (node-postgres) as the driver, not `@neondatabase/serverless`** — the HTTP
  driver is Neon-specific and holds no persistent connection to wrap in a
  transaction, which would have ruled out transaction-based test isolation later.
  Plain `pg` against Neon's pooled connection string is the same code path locally,
  in CI (a plain Postgres service container), and in production — one driver, not
  two divergent ones to keep in sync.
- **Neon connection pool cached at module + `global` scope**
  (`db/client.ts`) — avoids opening a fresh Postgres connection on every request; a
  warm Vercel serverless instance reuses the pool across invocations.
- **`amountPaid` stored as a whole-rupee integer, never a float or paise** — the
  donation UI has never collected sub-rupee amounts (₹300–₹3000, no decimal input
  anywhere), so paise would be a unit-conversion concern invented for a precision
  requirement that doesn't exist here.
- **Idempotency key checked before the rate limiter and before re-verifying the
  screenshot, not after** (`api/_lib/donations.ts`) — a retry of an
  already-accepted submission (network blip, double-click) is free: it costs no
  rate-limit quota and re-fetches nothing. Only a genuinely new submission pays for
  the rate-limit check and the image verification.
- **Rate limiting is a Postgres fixed-window counter, not Redis/Upstash** — this is
  a low-traffic donation form, and Postgres is already a hard dependency; the
  fixed-window's known imprecision (a burst spanning two windows could allow
  briefly under 2x the limit) is an accepted, documented tradeoff against the
  complexity of a sliding window or token bucket this traffic level doesn't need.
  Implemented as a single atomic `INSERT ... ON CONFLICT DO UPDATE ... RETURNING`
  upsert specifically so there's no separate check-then-write race to reason about.
- **Screenshot uploads go directly from the browser to Vercel Blob**
  (`@vercel/blob/client`'s `upload()`/`handleUpload()` pattern), not through this
  app's own API route body — Vercel serverless functions cap request bodies well
  under the 8MB this app allows for a screenshot; client-direct upload sidesteps
  that limit entirely rather than raising it or hand-rolling multipart streaming.
- **Screenshot blobs use `access: 'public'` with a random path, not `'private'`** —
  investigated and rejected specifically because it doesn't hold up, not by
  default: reading the installed `@vercel/blob@2.8.0` SDK's own
  `generateClientTokenFromReadWriteToken` source shows the signed client-upload
  token's payload never includes `access` at all, so this server cannot bind or
  verify which access level the browser's `upload()` call actually requests for
  this flow. Claiming `'private'` here would have been an unverified security
  property. Documented as a known limitation (§12), not silently worked around.
- **Screenshot pathnames are client-generated random UUIDs, never the donor's
  original filename** — `donationService.ts` derives only a file extension from
  the upload's MIME type; the filename itself never reaches Blob storage, so a
  donor can't influence the storage path (which would otherwise be a path-planning
  and information-leak surface, e.g. a filename revealing the donor's device/app).
- **Real image-signature ("magic bytes") verification on the server**
  (`api/_lib/magicBytes.ts`), not just trusting the declared `Content-Type` — a
  request crafted outside the browser can set that header to anything; the actual
  leading bytes of the uploaded file are checked against known PNG/JPEG/WEBP
  signatures before a donation row is ever created.
- **`donationLimits.ts` and `screenshotLimits.ts` split into `shared/`, outside both
  `src/` and `api/`** — both the ₹300–3000 range and the 8MB/PNG-JPEG-WEBP
  screenshot constraints are now enforced independently on the client (UX) and the
  server (the check that actually matters), and needed one source of truth. They
  couldn't live inside `src/components/donation/config.ts` because that file reads
  `import.meta.env`, which doesn't exist in the Node runtime `api/` code runs in.
- **A third TS project, `tsconfig.api.json`, added alongside the existing
  `tsconfig.app.json`/`tsconfig.node.json` pair** — `api/`, `db/`, and `shared/`
  need Node lib/types with no DOM, which is a different compilation target than
  either existing project; referenced from the root `tsconfig.json` the same way
  the other two already are, so `tsc -b` (already `npm run build`'s first step)
  type-checks the backend for free.
- **Vitest's default test environment is `node`, not `jsdom`** — most of this
  project's tests are pure logic (reducers, validators) or backend code with no
  DOM at all; only two files actually render a component or touch `URL`/`File`
  browser APIs, and opt into `jsdom` per-file via a `// @vitest-environment
jsdom` comment instead of paying jsdom's setup cost on every test file,
  including backend ones that will never need it.
- **React Testing Library's cleanup is wired explicitly in `vitest.setup.ts`
  (`afterEach(() => cleanup())`), not left to RTL's automatic detection** — RTL
  only auto-registers cleanup when it detects a _global_ `afterEach`, which
  requires Vitest's `test.globals: true`. This project deliberately keeps
  `globals` off (explicit imports everywhere else), so without this, a
  component rendered in one test stayed mounted into the next test's DOM,
  causing a real "found multiple elements" failure the moment a second test in
  the same file queried the same role — caught immediately by actually running
  the suite, not by inspecting the setup file.
- **Backend integration tests live in a separate `vitest.integration.config.ts`,
  not a second `include` pattern merged into the main config** — the first
  attempt used Vitest's `mergeConfig`, which concatenates array options like
  `exclude` rather than replacing them; overriding `exclude: []` on top of the
  base config's `exclude` (which excludes `*.integration.test.ts`) left the
  files still excluded, so the "integration" run found zero tests. Fixed by
  writing a fully standalone config instead of merging — worth remembering:
  `mergeConfig` is not a safe way to _clear_ an array-valued option.
- **Test isolation between integration tests is a `TRUNCATE` in `beforeEach`
  (`db/testUtils.ts`), not per-test transaction rollback** — the chosen `pg`
  driver could technically support wrapping each test in a transaction, but
  doing so would mean every business-logic function accepting an injectable db
  client instead of importing the shared singleton from `db/client.ts` — a real
  signature change to every function for a benefit (marginally faster test
  cleanup) that doesn't matter at this table count. `TRUNCATE` between tests is
  simpler and needed no changes to the code being tested.
- **Password hashing (`api/_lib/password.ts`) split into its own module,
  separate from session management (`api/_lib/auth.ts`)** — `auth.ts` imports
  `db/client.ts`, which throws at module load if `DATABASE_URL` isn't set;
  bundling the pure `hashPassword`/`verifyPassword` functions into that same
  file would have meant even a test that only exercises bcrypt hashing
  couldn't import the module without a live database configured. Found while
  writing `password.test.ts` as what was supposed to be a zero-dependency
  unit test.
- **Login is timing-safe against email enumeration** — comparing against a
  precomputed dummy bcrypt hash when the submitted email doesn't match any
  admin account, so an unknown-email response and a wrong-password response
  take about the same time. Without it, bcrypt only running when a user is
  actually found makes the two cases distinguishable by response time alone.
- **`rate_limits.ip_address` renamed to `rate_limits.key`** — Phase 7 needed a
  second, independent rate limit (login attempts) sharing the same table and
  mechanism as the donation endpoint's; keying both by bare IP would have let
  a donor's submissions and an admin's login attempts from the same network
  incorrectly share one counter. Renamed rather than adding a second table,
  since the table's whole design (fixed window, atomic upsert) is identical
  for both use cases — only the key and threshold differ. Safe to rename in
  place rather than write a migration for it, since no real deployment had
  used the original column yet.
- **CSP's `style-src` includes `'unsafe-inline'` because inline styles are
  genuinely used** (`App.tsx`'s scroll sentinel, `FAQ.tsx`'s height
  transition) — checked by grepping the codebase before writing the policy,
  not assumed. `connect-src`/`img-src` allow both
  `*.public.blob.vercel-storage.com` and `*.private.blob.vercel-storage.com`
  since the Blob access-level question (§ Decision Log, Phase 5) isn't fully
  settled — narrowing to just `public` now would need revisiting the moment
  that changes.
- **Admin dashboard is a second Vite entry (`admin.html` + `src/admin/`), not
  a route inside the existing SPA or a new router dependency** — with exactly
  two internal views (dashboard, submission detail) and zero deep-linking
  requirement, `AdminApp`'s own `useState` is the entire "routing" mechanism
  needed. The separate entry point is what actually keeps admin code out of
  the public bundle; a router wouldn't have helped with that on its own.
- **`GET`/`PATCH` on donations reuse the existing `api/donations/index.ts` and
  a new `api/donations/[id].ts`, both gated by the same `requireAdmin` guard
  built in Phase 7** — no new auth mechanism, no new middleware pattern,
  just calling the one guard that already existed.
- **The dashboard's summary tiles (`getDonationSummary`) always query across
  every donation regardless of the current status filter** — they're meant to
  answer "how many donations exist in total," not "how many match the
  current view," so `listDonations`' `where` clause deliberately isn't
  reused there even though the two functions query the same table.
- **The "reset to loading" setState call was moved out of the data-fetching
  effects in `DashboardPage`/`SubmissionDetail` and into the click handlers
  that actually trigger a refetch** — the same `react-hooks/set-state-in-effect`
  rule already worked around for `useCountUp` (see that Decision Log entry)
  flagged calling `setState` synchronously inside the effect body. Unlike
  `useCountUp`'s one-time initial-read fix, this effect re-runs on every
  `page`/`statusFilter` change, so a lazy initializer alone doesn't cover it;
  the actual fix is that only a user-triggered event (a button click) should
  synchronously reset to "loading," while the effect itself only ever calls
  `setState` inside its async `.then()`/`.catch()` — which was never what the
  rule objected to. Also improved perceived responsiveness: loading state now
  appears the instant the button is clicked, not after the effect gets around
  to running.
- **Verified the admin bundle doesn't inflate the public bundle by comparing
  actual byte counts, not by trusting the multi-page config's intent** —
  `main.js` + the shared chunk together total 374.01 kB, matching Phase 5's
  pre-split single-bundle size of 374.23 kB almost exactly. The small
  admin-specific chunk (~11 kB) is only ever downloaded by someone who
  actually visits `/admin.html`.
- **Solid buttons' resting fill changed from `--color-red` to `--color-red-deep`,
  with a new `--color-red-darkest` (#9f232e) added for hover/active** — a
  Lighthouse audit found white button text on `--color-red` measures 4.17:1,
  under the 4.5:1 WCAG AA minimum for normal-size text (confirmed by
  computing relative luminance, matching this project's established practice
  from the earlier error-text contrast fix, not eyeballed). `--color-red`
  itself is unchanged and still used for icons, borders, and other non-text
  elements, which only need 3:1. This was surfaced to the user as a real
  design-system decision (it changes the primary CTA's default color
  site-wide) rather than changed unilaterally; `--color-red-deep` was chosen
  over an arbitrary new shade specifically because it was already a
  cataloged brand color one step darker. The same bug, freshly introduced in
  Phase 8's own dashboard filter buttons, was caught by grepping for every
  `bg-red` usage rather than assuming Phase 8's code was already clean.
- **`vitest.integration.config.ts` sets `fileParallelism: false`** — the
  first real CI run (Phase 10) found 3 of 20 integration tests failing with
  row counts that were multiples of what each test itself inserted (3→6,
  1→3) and a rate-limit test that never reached its threshold. Root cause:
  Vitest runs test _files_ concurrently by default (each in its own worker),
  but all three integration files share one physical Postgres with no
  per-file isolation — `db/testUtils.ts`'s `TRUNCATE`-per-test strategy is
  only actually safe if files run one at a time. `fileParallelism: false`
  (Vitest's documented mechanism for this — the same flag its own `inspect`/
  `inspectBrk` debug options require) forces that. Fixed by config, not by
  loosening any assertion; tests within a single file were never the
  problem, since Vitest already serializes those by default.
- **`useScreenshotUpload`'s replace-file bug (see Phase 6 in §10) fixed by
  revoking the previous preview URL synchronously, before transitioning to
  'uploading'** — not by fixing the check inside the delayed `setTimeout`'s
  `setState` updater, since that updater's `prev` can never be the 'uploaded'
  state being replaced (the synchronous `setState` right before the timeout
  already moved state to 'uploading' by the time the timeout fires). Revoking
  the old preview immediately also makes more sense conceptually: it's stale
  the instant a new file is chosen, not 500ms later when the new one finishes.

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
- **Phase 5 — Backend foundation: complete.** Continues the phase numbering above
  rather than restarting at "Phase 1" for the productionization work, to avoid two
  unrelated things in this file both being called "Phase 1." Replaced
  `donationService`'s mock with a real Vercel Serverless Functions + Neon Postgres +
  Vercel Blob backend, with the exact same exported signature — no caller changed.
  Built: the four-table schema (`donations`, `admin_users`, `admin_sessions`,
  `rate_limits` — the latter two exist now so Phase 7's auth has schema ready, but
  aren't wired to any route yet, deliberately, since unused route code would be
  exactly the kind of speculative addition this file argues against elsewhere),
  `POST /api/donations` (server-side Zod re-validation, idempotency-key check before
  rate limiting so retries are free, a Postgres fixed-window rate limiter, real
  image magic-byte verification, orphaned-blob cleanup on every rejection path), and
  `POST /api/uploads/screenshot` (Vercel Blob client-upload token, keeping the 8MB
  screenshot off this function's own request body). `tsc -b`, `eslint`, and
  `prettier --check` all clean across a new `tsconfig.api.json` project reference
  covering `api/`, `db/`, and `shared/`. No test framework exists yet (Phase 6) and
  end-to-end verification against a live Neon database/Blob store is still pending
  real credentials — see §12.
- **Phase 6 — Testing: frontend verified, backend integration tests written but
  not yet run against a real database.** Added Vitest + React Testing Library.
  27 frontend tests, all passing: every branch of `validateConfirmationForm`,
  every transition of both `donationReducer` and `confirmationFormReducer`,
  `useScreenshotUpload`'s full lifecycle including preview-URL cleanup, and a
  regression test for the Phase 3 failed-validation-focus fix (submits an
  incomplete form, asserts focus lands on the first invalid field — would fail
  again if that fix were ever reverted). **Found and fixed one real,
  pre-existing bug in the process**: replacing an already-selected screenshot
  never revoked the old preview's object URL, because the synchronous
  `setState({status:'uploading'})` call cleared the 'uploaded' state before the
  delayed callback's own `prev.status === 'uploaded'` check could ever see it —
  caught by a test asserting the revoke call, exactly the kind of bug this
  project's own Decision Log says testing finds and code review doesn't. Wrote
  5 backend integration tests (`api/_lib/donations.integration.test.ts`) against
  `createDonation` — creation, real-image-signature rejection, idempotency
  no-op, the DB-level unique constraint, and rate-limit enforcement — kept in a
  separate `vitest.integration.config.ts` so `npm test` never tries to reach a
  database that isn't configured. **Status: implemented, not yet verified
  against real Postgres** — no local Docker, no Neon credentials as of this
  phase; confirmed only to load correctly and fail for exactly the expected
  reason (missing `DATABASE_URL`). Per direct user instruction, this project
  does not describe these as "passing" anywhere (including the eventual final
  production report) until a GitHub Actions Postgres service container has
  actually run migrations and all five tests successfully — see Phase 10.
  **Update: verified.** CI ran these for real (see Phase 10's own entry) —
  they pass against a real Postgres, not just "fails for the expected
  reason" as before.
- **Phase 7 — Authentication + Security: implemented; integration tests now
  verified by CI (see Phase 10) — session creation, expiry, and invalidation
  all pass against a real Postgres.** Added `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me`,
  and the session/password machinery behind them (`api/_lib/auth.ts`,
  `api/_lib/password.ts`). Single admin account, bcrypt password hashing,
  DB-backed opaque sessions (only a SHA-256 hash of the token is ever stored),
  `httpOnly`/`SameSite=Strict`/(`Secure` in production) cookie, real
  server-side logout via row deletion. Login is timing-safe against email
  enumeration (a dummy bcrypt comparison runs even when the email doesn't
  exist, so response time doesn't leak whether an account exists) and
  separately rate-limited from the donation endpoint (`login:<ip>` vs.
  `donation:<ip>` keys in the same `rate_limits` table — see the Decision Log
  for why the table's column had to be generalized from `ip_address` to `key`
  to support this). Added `db/seedAdmin.ts` (`npm run db:seed-admin`) since
  there's deliberately no admin sign-up flow. Added `vercel.json` with a CSP
  tailored to this app's actual resources (verified inline styles are really
  used — `App.tsx`'s scroll sentinel, `FAQ.tsx`'s height transition — before
  allowing `style-src 'unsafe-inline'`, rather than copying a generic
  permissive policy), plus `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, and `Cache-Control: no-store` on `/api/*`. CSP behavior
  itself is only meaningfully verifiable against a live deployment (headers
  aren't applied by `vite dev`/`vite preview`) — pending Phase 11.
- **Phase 8 — Admin Dashboard: built, verified in-browser, and its
  integration tests now confirmed passing by CI (see Phase 10).** Added the
  admin-only
  `GET`/`PATCH` branches on `api/donations/index.ts` and the new
  `api/donations/[id].ts`, both behind `requireAdmin`, plus the business logic
  behind them (`listDonations`, `getDonationById`, `updateDonationStatus`,
  `getDonationSummary` in `api/_lib/donations.ts`) with 8 new integration
  tests (pagination, status filtering, not-found handling, summary
  aggregation) — same "implemented, not yet run against real Postgres"
  status as Phases 6–7. Built the actual dashboard UI: `admin.html` as a
  second Vite entry point (`src/admin/`), reusing the existing design tokens
  and the donation flow's own `FormField`/`Button` components rather than
  inventing new ones. `AdminApp` owns login-check + a two-view
  dashboard/detail state with no router (see its own doc comment). Verified
  directly in the browser, not just by reading the code: the admin login page
  renders correctly with working focus/error states, and — the one thing this
  phase could actually break — **the public donor page's own bundle was
  confirmed unaffected**, by comparing `main` + the shared chunk's combined
  size (374.01 kB) against the pre-split single-bundle size (374.23 kB) from
  Phase 5, not assumed from the multi-page config alone. CI's integration
  tests confirm the query/auth logic works against a real Postgres; the
  separate question of the _deployed_ app working against the real Neon
  project and Vercel Blob store (not CI's ephemeral service-container
  Postgres) is still pending those credentials — see §12.
- **Phase 9 — Performance: baseline measured against the production build,
  two real (non-performance) issues found and fixed, no invented perf work.**
  Ran Lighthouse against `vite preview`'s actual production build (not `vite
dev`), desktop and mobile. **Before:** desktop Performance 100 /
  Accessibility 96 / Best Practices 100 / SEO 92; mobile Performance 95 (2.4s
  FCP/LCP under simulated throttling, 0ms TBT, 0.016 CLS). The two point
  losses were real, specific findings, not noise: (1) no `robots.txt` existed
  at all, so Lighthouse tried to parse `index.html`'s markup as robots
  directives (53 "syntax not understood" errors) — fixed with a real
  `public/robots.txt`; (2) the primary CTA button's white text on
  `--color-red` measured 4.17:1, under the 4.5:1 WCAG AA minimum for
  normal-size text, in three places (header, hero, donation form) — the same
  pattern was also freshly introduced in Phase 8's dashboard filter buttons,
  caught by grepping for `bg-red` usage rather than assuming Phase 8's own
  code was clean. Fixed by making `--color-red-deep` (already a cataloged
  brand color) the buttons' resting fill and adding one new, computed shade
  (`--color-red-darkest`, `#9f232e`) for hover/active — not by inventing an
  arbitrary color, and confirmed by user decision rather than a unilateral
  brand-color change. **After, re-measured, not assumed:** Accessibility 100,
  SEO 100. Explicitly did NOT chase the mobile performance score's remaining
  points (95, driven by simulated network/CPU throttling on an already
  self-hosted, subset-font, no-scroll-listener page) — no evidence pointed to
  a real fixable cause, and the instruction for this phase was to act on
  evidence, not invent optimization work.
- **Phase 10 — CI: pipeline added, first real run found a genuine test-isolation
  bug, root-caused and fixed (not papered over).** GitHub Actions workflow with
  a Postgres service container (typecheck → lint → format check → migrations →
  unit tests → integration tests → build). Opening the PR triggered the first
  real execution of every integration test written since Phase 6: **17/20
  passed, 3 failed** — investigated by root cause, not by adjusting
  assertions. All three traced to one bug: `vitest.integration.config.ts` had
  no `fileParallelism` setting, so Vitest ran the three integration test
  files concurrently in separate workers, all against the _same_ physical
  Postgres with no isolation between files. `listDonations`' pagination test
  expected 3 rows and got 6; its status-filter test expected 1 and got 3 —
  both consistent with another file's concurrently-running test inserting
  rows into the same table mid-test. The rate-limit test expected
  `rate_limited` after 10 submissions and got `created` — consistent with a
  concurrent file's `beforeEach` `TRUNCATE` (on `rate_limits` and/or
  `donations`) landing mid-loop and resetting the counter before it reached
  the threshold. Fixed with one config line, `fileParallelism: false` —
  forces all integration test files to run sequentially in one process, which
  is what makes `db/testUtils.ts`'s TRUNCATE-per-test isolation strategy
  actually safe; tests _within_ one file were never the problem, since
  Vitest already runs those in order by default.

  **Confirmed, not assumed:** pushed the fix, CI re-ran on
  [PR #1](https://github.com/vijaykrishna68/S1P/pull/1), and every step
  passed — typecheck, lint, format check, migrations, unit tests,
  **integration tests**, and build, checked individually via the run's own
  per-step results, not just the overall green check
  (`gh run` id `35870213210`). This is the first genuinely verified pass of
  every integration test written since Phase 6 — see those phases' own
  entries, now updated to match.

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

- **The admin dashboard's query/auth logic is CI-verified against a real
  Postgres, but the deployed app has never been exercised end-to-end against
  the real Neon project and Vercel Blob store.** CI's Postgres is an
  ephemeral per-run service container, not the actual production database —
  it proves the SQL and auth logic are correct, not that the live deployment
  works with real credentials. The dashboard UI itself has also only been
  browser-tested against a backend that wasn't running (`vite dev` doesn't
  execute `/api/*`). No CAPTCHA or bot-challenge exists on either the
  donation or login endpoint; the Postgres rate limiter is the only abuse
  mitigation so far (10/hour for donations, 20/hour for login attempts).
- **Screenshot blobs are public-but-unguessable, not authenticated-private.** The
  installed `@vercel/blob` version's client-upload token doesn't bind an access
  level (verified by reading the SDK source, not assumed) — see the Decision Log.
  A payment screenshot's URL is a random, unlisted path never linked from the
  public site, but isn't gated behind admin auth the way the eventual dashboard's
  _view_ of it will be.
- **No payment verification of any kind.** The UI is careful never to imply
  otherwise, but it's worth stating plainly here too: nothing about this
  site verifies a UPI transaction happened. The uploaded screenshot is the
  donor's claim, not a verified fact. This is a donation submission and
  verification system — "verification" meaning human admin review, once that
  exists — never a payment-processing or payment-gateway system, and neither this
  file nor the README should describe it as one.
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
