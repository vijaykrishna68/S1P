# Phase 2 — About Page: Content + Implementation Specification

Status: **Draft — pending your approval before any implementation.** No code,
routes, components, or packages have been created or modified. This document
is the complete blueprint Phase 2 implementation should follow, so that
content/IA decisions don't get made ad hoc while coding.

Builds on the approved [Phase 1 IA Proposal](PHASE1_IA_PROPOSAL.md) and its
seven approved decisions (historical numbers, no "Cat/non-Cat," Vite
multi-entry over React Router, Home/About/Gallery/Donate nav, Gallery
deferred to Phase 3, Chennai/Tamil Nadu instead of full address, and dropping
the Mandela-attributed quote in favor of the origin story).

---

## A. About page objective

Answer, in order, the seven questions a first-time visitor actually has —
what is this, why does it exist, what does it do, has it lasted, has it
worked, is it legitimate, and what do I do now — using only the PDF as
source material, without becoming a converted annual report. The page should
read as the next chapter of the same site a visitor just left, not a
different document pasted in.

---

## B. Final recommended section order

```
1. About Hero
2. What S1P Is
3. The Story That Started It   (origin story — "8 slices of pizza")
4. Why Education                (short bridge/thesis)
5. Our Journey                  (growth, 2016–2025)
6. Impact                       (headline metrics)
7. About the Trust              (registration/legitimacy)
8. Support / Donate CTA
```

This keeps the structure you proposed, with two adjustments worth flagging:

- **"Why Education" is deliberately kept short (a bridge, not a full section)**
  — it exists to connect the story's realization to the mission focus in 2–3
  sentences, not to re-explain the mission at length (that's already covered
  by "What S1P Is" before it and "Impact" after it). Giving it full
  section-weight would create redundancy with both neighbors.
- **"What S1P Is" intentionally carries only a light registration mention**
  (so an early skimmer gets a legitimacy cue fast), while the full
  registration/contact block is reserved for "About the Trust" later — this
  avoids saying the same trust-signal twice.

Each answers one of your seven questions directly: 1→Hero+WhatS1PIs,
2→Story, 3→WhatS1PIs/WhyEducation, 4→Journey, 5→Impact, 6→AboutTheTrust,
7→CTA.

---

## C. Detailed section specification

### 1. About Hero

- **Purpose:** Orient a visitor arriving from Home; signal "this is the story
  page," not a repeat of the homepage's donation ask.
- **Content direction:** A narrative hook headline (not a restatement of the
  homepage hero), one plain-language subhead stating what S1P is, a small
  secondary-weight registration cue.
- **Source:** org identity, mission.
- **Visual treatment:** Smaller-scale variant of the existing hero visual
  language (not a new graphic system) — modest vertical height, since this is
  page two of the experience, not the front door.
- **Prominence:** Prominent, but visually restrained relative to Home's hero.
- **Home vs. About-only:** About-only.

### 2. What S1P Is

- **Purpose:** Plain, concrete orientation before the emotional story —
  what kind of organization is this, in one paragraph.
- **Content direction:** Non-profit status, education focus, "UKG to MBBS"
  range, and the one-time-vs-ongoing support model, described generally (not
  citing the PDF's internal form terminology).
- **Source:** general org description; "UKG to MBBS"; the PDF's "Fund mode:
  One time / Adoption" concept, described generically as a program mechanic,
  not attributed to any individual.
- **Visual treatment:** Plain text block, optionally a short 2–3 item
  visual rhythm break (non-profit / education-focused / community-funded) —
  not a stat tile (Impact owns stats).
- **Prominence:** Secondary.
- **Home vs. About-only:** About-only — Home's existing Mission section
  already covers a shorter version of "why," duplicating it would be
  redundant.

### 3. The Story That Started It

- **Purpose:** The emotional core of the page — explains the name and the
  founding motivation.
- **Content direction:** Condensed, web-native retelling preserving the real
  sequence: an everyday conversation about a festival bonus → the money
  redirected from a pizza order → the itemized real use of it → the
  realization → S1P's founding. See draft copy in §D.
- **Source:** the "8 slices of pizza" story (rewritten, not reproduced).
- **Visual treatment:** Split editorial layout (text + a static visual), see
  §G for the full reasoning — reuses the hero's own "core + facet/arc"
  visual vocabulary rather than inventing new visual language.
- **Prominence:** Most prominent content section on the page.
- **Home vs. About-only:** About-only (too long-form for the homepage;
  Home's Mission section stays short as-is).

### 4. Why Education

- **Purpose:** Bridge — connects the story's realization directly to "this
  is why education, specifically."
- **Content direction:** 2–3 sentences, pull-quote weight.
- **Source:** mission focus, "UKG to MBBS."
- **Visual treatment:** Reuse Home Mission's existing pull-quote treatment
  exactly — no new visual pattern.
- **Prominence:** Short but visually distinct (this is the page's thesis
  statement).
- **Home vs. About-only:** About-only for now.

### 5. Our Journey

- **Purpose:** Demonstrates sustained, real operation since 2016 — proof
  this isn't a one-off.
- **Content direction:** One combined visualization + narrative, presented
  honestly including the data's real fluctuation (see §F) — no invented
  explanations for dips.
- **Source:** yearly disbursement 2015–2025, cumulative 2025 total, active
  member counts 2020–2025 (all as approved).
- **Visual treatment:** One lightweight hand-rolled SVG chart (see §F) +
  milestone narrative text.
- **Prominence:** Prominent but not the page's single biggest section.
- **Home vs. About-only:** About-only (Phase 1 already decided history stays
  off Home).

### 6. Impact

- **Purpose:** Concrete proof of scale, in numbers a first-time visitor can
  parse in one glance.
- **Content direction:** See §E for exact metric selection and rounding
  rationale.
- **Source:** ₹29.87L cumulative disbursement, 55+ students (UKG→MBBS).
- **Visual treatment:** Reuse the existing homepage `ImpactStat`/`useCountUp`
  pattern exactly, with About-specific numbers — genuine component reuse, not
  a new pattern.
- **Prominence:** Prominent.
- **Home vs. About-only:** Overlaps with Home's Impact section by design —
  Home stays a lighter teaser (per Phase 1), About carries the fuller version.

### 7. About the Trust

- **Purpose:** Answers "who runs this, is it legitimate" — the formal
  identity block.
- **Content direction:** Full legal name, non-profit status, Registration
  No. 316/2016, "Chennai, Tamil Nadu" (not full street address, per approved
  decision 6), official email. No 80G, no other registration/tax claims
  (default recommendation: omit 80G entirely — see §H and §P).
- **Source:** registration info, location, email.
- **Visual treatment:** Simple label/value list — a small genuinely-new
  layout pattern (see §N), not a stat tile, not a card grid.
- **Prominence:** Secondary — necessary, not the emotional highlight.
- **Home vs. About-only:** About-only.

### 8. Support / Donate CTA

- **Purpose:** Convert the visit into a donation.
- **Content direction:** Short, direct, single ask.
- **Source:** n/a.
- **Visual treatment:** Exact existing `Button` CTA component and label
  ("Donate One Pizza") — no new CTA design.
- **Prominence:** Prominent, singular, final.
- **Home vs. About-only:** Shared component/pattern, page-specific copy.

---

## D. Website-ready draft copy

**About Hero**

> **It started with a pizza order that never happened.**
> Sacrifice 1 Pizza (S1P) is a Chennai-based trust that turns everyday
> choices — like skipping a pizza — into real educational support for
> students who need it.
> _Registered Trust · No. 316/2016_

**What S1P Is**

> Sacrifice 1 Pizza Welfare Trust is a registered non-profit that funds
> education for underprivileged students — from UKG through MBBS. Some
> students receive one-time help with a specific need; others are supported
> for years at a time, for as long as it takes to finish what they started.
> Every rupee comes from people who decided that what they'd spend on one
> pizza could do something better.

**The Story That Started It**

> It began with an ordinary conversation. A family was deciding whether to
> give their household help a small festival bonus — enough, roughly, for a
> pizza night at home.
>
> They chose the bonus instead. And when their help returned from her time
> off, she accounted for every rupee of it: a new dress for her
> granddaughter, sweets, an offering at the temple, bus fare, a doll,
> bangles, a gift for her son-in-law, and school supplies.
>
> Eight small things. The same amount of money that would have bought eight
> slices of pizza had instead covered eight real needs in someone else's
> life.
>
> That realization — that one pizza's worth of spending could mean this much
> to someone else — is what started Sacrifice 1 Pizza. The team set out to
> do the same thing deliberately: redirect small, everyday spending toward
> the one thing that changes a family's future fastest — education.

**Why Education** _(pull-quote weight)_

> Every one of those eight small things solved a problem for a single day.
> Education solves one for a lifetime. That's why S1P exists — to fund
> school fees, books, and support for students who'd otherwise have to
> choose between them and everything else.

**Our Journey** _(intro line, accompanies the chart in §F)_

> S1P has been funding student education since it was registered in 2016.
> Below is what that's added up to, cumulatively, year by year — real
> disbursements, not projections.

**Impact** _(intro line)_

> None of this is hypothetical. Here's what it's added up to so far:

**About the Trust**

> Sacrifice 1 Pizza Welfare Trust is a registered non-profit organisation
> for the welfare of society (Registration No. 316/2016), based in Chennai,
> Tamil Nadu.
>
> For questions or to get in touch directly: s1pwtrust@gmail.com

**Support / Donate CTA**

> **Be part of the next chapter.**
> The same choice is still there — one pizza, or one student's next school
> fee.
> `[ Donate One Pizza ]`

None of the above uses "making a difference," "creating a better tomorrow,"
or "empowering communities."

---

## E. Impact metrics strategy

**Hero-level (2):**

- **₹29L+ cumulative disbursement** — rounded, not "₹29.87L." Reasoning:
  a headline number should read as a confident, durable claim, not an
  accounting export. "₹29.87L" is exactly precise _today_, but the moment
  the next donation lands, that exact figure is stale — "₹29L+" stays true
  across many future donations and only needs a copy update once the real
  total properly crosses into the 30s. The exact figure isn't lost, though —
  it appears as a specific data point in the Journey section (§F), where
  precision reads as "audited and real" rather than "marketing headline."
- **55+ students supported (UKG → MBBS)** — human-scale, immediately
  understandable without any context needed.

**Secondary (Journey narrative, not the headline stat row):**

- **58 active members (2025)** — a genuine trust/community signal, but less
  immediately meaningful to a first-time visitor than the two numbers above.
  Placed in the Journey section's narrative, not the Impact stat tiles.

**Supporting copy only (not a stat tile):**

- The exact ₹29.87L cumulative figure and the year-by-year numbers — used
  only inside the Journey chart/caption, never restated as a second headline.

**No false precision:** no growth rate, percentage, or trend claim appears
unless it's a direct, honest arithmetic result of the approved numbers
themselves (see §F and the flagged optional stat in §P) — nothing is
extrapolated or implied beyond what the source supports.

---

## F. Journey/history presentation strategy

**A genuine finding worth flagging:** summing your approved yearly
disbursement figures (2015→2025) produces a running total that **reconciles
exactly** to your approved 2025 cumulative figure:

| Year | Yearly (₹L) | Running cumulative (₹L)                                     |
| ---- | ----------- | ----------------------------------------------------------- |
| 2015 | 0.45        | 0.45                                                        |
| 2016 | 2.12        | 2.57                                                        |
| 2017 | 1.69        | 4.26                                                        |
| 2018 | 3.21        | 7.47                                                        |
| 2019 | 2.58        | 10.05                                                       |
| 2020 | 1.94        | 11.99                                                       |
| 2021 | 3.95        | 15.94                                                       |
| 2022 | 3.74        | 19.68                                                       |
| 2023 | 3.42        | 23.10                                                       |
| 2024 | 3.38        | 26.48                                                       |
| 2025 | 3.39        | **29.87** ✓ matches your approved cumulative figure exactly |

Since this running total is pure arithmetic on numbers you explicitly
approved, and it self-verifies against your approved 2025 total, **a full
2015–2025 cumulative-growth visualization is safe to build without further
number confirmation.**

**Recommendation — one visualization, not two:**

- **Primary:** a single hand-rolled SVG cumulative-disbursement line/area
  chart using the verified series above (no charting library — same
  hand-built-SVG approach already used for the hero).
- **Active member counts (2020–2025: 50, 42, 59, 52, 58, 58)** stay as
  **narrative color inside the Journey text**, not a second chart — the data
  is non-monotonic (2021 actually dropped before recovering) and smaller in
  scope; a second chart for six fluctuating data points would violate your
  own "don't make both into large charts" instruction with nothing gained.
  Recommended framing: acknowledge the number plainly ("today, 58 active
  members carry the Trust forward") without inventing a reason for the
  2021 dip or the fluctuation — the source doesn't explain it, so neither
  does the copy.
- **Accessible alternative required:** the chart needs a text equivalent
  (caption or `sr-only` summary) stating the trend in words — see §L.

---

## G. Origin story presentation strategy

Evaluated all four options against "do not over-engineer":

- **Plain narrative only** — undersells the page's strongest asset; would
  feel like a step down in production value right after Home's rich hero.
- **Fully interactive 8-slice sequence** (click-through, per-slice reveal
  logic) — real added engineering complexity (new state, new interaction
  pattern, its own accessibility surface) for a story that's read once. Risks
  becoming a gimmick rather than serving the story — against the project's
  own "motion should reward attention, not demand it" rule.
- **Simple timeline** — wrong shape for the content; this isn't a sequence of
  dated milestones, it's a single narrative arc (conversation → realization
  → founding).
- **Split editorial layout with a static visual motif** _(recommended)_ —
  narrative copy alongside a **static** (not click-driven) 8-segment arc/dot
  motif that visually echoes the hero's own "core + facet" visual language —
  the same conceptual idea (small individual elements becoming part of one
  whole), reapplied here as "one pizza's worth becomes 8 real things."
  Reveals once via the existing `useScrollReveal` hook (no new animation
  system, no staggered per-segment reveal to get wrong). Ties the story back
  to the site's own signature visual idea without inventing a second one.

**Recommendation: split editorial + static motif.** The 8 item labels
(dress, sweets, offering, fare, doll, bangles, gift, supplies) should live in
the **readable prose**, not only in the graphic — this both keeps the motif
simple to build and lets it be marked purely decorative for accessibility
(see §L), rather than needing its own accessible labeling scheme.

---

## H. Trust information strategy

Only what the PDF explicitly supports:

- Sacrifice 1 Pizza Welfare Trust
- Non-profit organization for the welfare of society
- Registration No. 316/2016
- Chennai, Tamil Nadu (city/state only, per approved decision 6)
- Official email: s1pwtrust@gmail.com

**Explicitly not claimed:** 80G certification, any other registration, any
tax-exemption or deduction status. The source lists 80G under "AIM IN
2025" — an intention, not a status — so it cannot be presented as achieved.
**Default recommendation: omit any mention of 80G at all**, rather than
including a hedged "working toward certification" line — simplest, and
removes any risk of the phrasing being read as an implied tax-deductibility
claim. Flagged as an explicit approval item in §P since Phase 1 left it open.

---

## I. Decision on the 2025 financial snapshot

**Recommendation: exclude it from the About page entirely.**

Reasoning:

- It's operational ledger detail (opening balance, ITR filing fees) —
  appropriate for an audited transparency artifact, not a donor-facing
  narrative page whose job is building an emotional/rational case to give.
- It answers none of the page's seven target questions.
- Including it — especially with a footnoted "*Includes ITR filing fee and
  charges" — is exactly the "feels like a converted annual report" failure
  mode you asked this page to avoid.
- **Where it would belong instead:** a future, separate "Transparency" or
  downloadable annual-report page/artifact — this is already on
  `Docs/PRD.md`'s own future-roadmap list ("monthly transparency reports").
  Not part of Phase 2's scope; worth keeping in mind for a later phase, not
  acting on now.

---

## J. Image/placeholder requirements

**Recommendation: ship the About page with zero placeholder photography.**

Reviewed every section for a genuine imagery opportunity:

| Section         | Would a photo help?                                               | Now                                                                      | Later                                                                  |
| --------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| About Hero      | Possibly, eventually                                              | Text + existing motif language, no photo                                 | A real, candid (non-staged) photo of an event or handover moment       |
| The Story       | No — the story's own visual _is_ the 8-segment motif, not a photo | Static SVG motif                                                         | (none needed — this is a designed graphic, not a photo slot)           |
| Our Journey     | No                                                                | Chart + narrative                                                        | (none needed)                                                          |
| Impact          | Possibly, eventually                                              | Stat tiles only (matches Home's Impact section, which also has no photo) | A real photo of a scholarship handover, school visit, etc.             |
| About the Trust | Possibly, eventually                                              | Text only                                                                | A registration-document scan or a simple team photo, if ever available |

This avoids the placeholder-image debt Gallery will inherently carry (Phase 3) — About's visual needs are fully met by the existing design system
(motifs, color, typography), so there's nothing "temporary" to later swap
out. Every "Later" cell above is a pure addition, not a replacement.

---

## K. Responsive behavior

- **About Hero:** stacks to single column on mobile; motif scales down;
  same responsive pattern already proven on Home's hero.
- **What S1P Is:** single column at all widths — no special treatment.
- **The Story (split editorial):** two columns (text | motif) on
  tablet/desktop; **stacked, text-first** on mobile — the motif follows the
  text rather than preceding it, so mobile readers reach the actual story
  before any decorative graphic, not after scrolling past one.
- **Our Journey:** chart sits alongside or below the narrative on
  desktop/tablet; on mobile, the chart goes full-width and shows **fewer
  labeled data points** (e.g., 2015 / 2020 / 2025 only) rather than cramming
  all 11 years' labels into a 375px view — the full 11-point series still
  drives the chart's shape, only the _labels_ thin out.
- **Impact:** same responsive stat-grid pattern as Home's Impact section —
  already proven, no new behavior needed.
- **About the Trust:** simple stacked label/value list — trivially
  responsive.
- **CTA:** existing `Button` component, already responsive.

---

## L. Accessibility considerations

- **Heading hierarchy:** page `h1` = About Hero headline; every subsequent
  major section (including "Why Education," even though visually a
  pull-quote) gets its own `h2` for landmark navigation — no skipped levels.
- **Focus management:** this is a full page load (per the approved
  multi-entry architecture), so standard browser behavior already lands
  focus sensibly at the top of the document — no `useAutoFocus`-style hook
  is needed here, unlike the SPA donation flow's in-page step transitions.
- **Journey chart:** needs a text equivalent — a visible caption or `sr-only`
  summary stating the trend in words ("cumulative disbursement grew from
  ₹0.45L in 2015 to ₹29.87L in 2025"), not just a visual-only chart.
- **Origin-story motif:** since the 8 item labels live in the readable prose
  (per §G), the graphic itself can be marked `aria-hidden="true"` as pure
  decoration — simpler and safer than building a fully screen-reader-navigable
  small SVG.
- **Reduced motion:** all entrances reuse the existing `useScrollReveal`
  hook, which already respects `prefers-reduced-motion` — no new motion
  system, so no new reduced-motion work required.
- **Contrast:** reuse only existing, already-verified tokens (e.g.
  `--color-red-deep` for any emphasized/link text, never raw `--color-red`
  for body-sized text) — no new colors are introduced, so no new contrast
  audit should be needed, but worth a quick verification pass during build.
- **Keyboard:** the only interactive control on the page is the final CTA
  button (existing, already accessible `Button` component) — no accordion,
  tabs, or carousel is introduced in this design, so no new keyboard-
  interaction surface to audit.

---

## M. Reusable existing components

- `Header`, `Footer` — page shell
- `Container` — width/padding wrapper
- `Button` — the final CTA
- `TextLink` — any inline "learn more"-style link (including the Mission →
  About link already approved in Phase 1)
- `useScrollReveal` — entrance animation for every section
- `ImpactStat` + `useCountUp` — reused as-is for the Impact section, with
  About-specific numbers/copy — genuine component reuse, not a rebuild
- The existing `.reveal` CSS utility class
- Existing design tokens (colors, fonts, spacing) — no new tokens
- Mission's `EchoMark` **technique** (hand-rolled SVG motif reusing the
  hero's visual vocabulary) — reused conceptually for the origin-story
  visual, not necessarily the literal same component

---

## N. New components actually necessary

- **`about.html` + `src/about/main.tsx`** — new Vite entry point, following
  the exact pattern already proven for `admin.html` (Phase 1's approved
  architecture).
- **`AboutPage.tsx`** — page-level component (analogous to `AdminApp.tsx`).
- **`OriginStory` component** — the split-editorial layout + static
  8-segment SVG motif. Genuinely new visual content; nothing existing does
  this.
- **`JourneyTimeline` (or `DisbursementChart`) component** — the hand-rolled
  SVG cumulative chart + narrative callouts. Genuinely new.
- **`TrustInfo` (or `AboutTrust`) component** — the label/value list layout.
  Small and simple, but doesn't exist yet.
- **`aboutData.ts`** — new content file following the project's existing
  per-section `*Data.ts` convention, holding: origin story copy, impact
  numbers, journey arrays (yearly/cumulative/member data), trust info fields.

None of this requires a new **dependency** — every new visual is hand-built
SVG/CSS in the same style as the existing hero, consistent with the
project's "no charting library, no animation library" stance. Sections small
enough to have no independent reuse case (e.g. "What S1P Is," "Why
Education") should stay inline in `AboutPage.tsx` rather than becoming their
own files, per the project's existing "no premature splitting of markup used
once" convention.

---

## O. Content that must NOT appear

- Individual student names/classes (ArunSai, Ajay, Chitra, Harini, Ram
  Kumar, Bishnu D, Sanjana, Himasree, Sahana)
- Individual new-member names (Ganesh Mudada, Balajie V, Krishnakumar,
  Srinivas N, Venkatesh, Rajiv P, Nediyon C)
- The internal "Fund Request form" or any Aadhar-adjacent field
- The 2025 granular financial ledger (opening balance, ITR filing fees) —
  excluded per §I
- 80G certification, or any tax-exemption/deduction claim
- The full registered street address (Chennai/Tamil Nadu only, per approved
  decision 6)
- "Cat / non-Cat supporters" terminology
- The Mandela-attributed "education is the most powerful weapon" quote (per
  approved decision 7)
- Any milestone, date, or number not present in — or directly, verifiably
  derivable via simple arithmetic from — the approved source data
- Generic NGO clichés ("making a difference," "creating a better tomorrow,"
  "empowering communities")

---

## P. Open decisions requiring approval before implementation

1. **Derived cumulative chart (§F)** — confirm you're comfortable displaying
   the full 2015–2025 running-total series, even though only the 2025 total
   was explicitly named "approved" — it's pure arithmetic on your approved
   yearly figures and self-verifies against that total, but I'm flagging it
   since I derived it rather than you stating it directly.
2. **Optional "≈7.5x since 2015" comparison** (2025's ₹3.39L yearly figure
   vs. 2015's ₹0.45L) — include as supporting copy in Journey, or leave out
   to keep the section simpler?
3. **58 active members** — show as a named number in the Journey narrative
   (my recommendation), or omit the specific figure and describe the
   community only qualitatively?
4. **80G** — confirm the default recommendation (omit entirely, no hedged
   "working toward" language either) rather than any mention at all.
5. **The "adoption" support-model line** in "What S1P Is" ("some students
   receive one-time help... others are supported for years at a time") is
   inferred from the PDF's internal form terminology ("Fund mode: One
   time/Adoption") rather than stated as prose elsewhere — confirm this
   general, non-identifying description is fine to use.
6. **Origin story visual direction** — confirm the split-editorial +
   static 8-segment motif approach (§G) before it's built; this is the
   single most "designed" new piece of UI on the page.
7. **2025 financial ledger exclusion** — confirm leaving it out of this page
   entirely, and whether a future "Transparency" page is worth noting as a
   later idea (not scheduled in the current phase list).

---

## Q. Implementation checklist (next step, once approved)

1. Add `about.html` Vite entry + `src/about/main.tsx` + `AboutPage.tsx`.
2. ~~Add a Vercel rewrite: `/about` → `about.html`.~~ **Decided against
   post-implementation** — the canonical public URLs are the direct `.html`
   paths (`/about.html`, `/gallery.html`, `/admin.html`), matching
   `admin.html`'s own existing precedent; `vercel.json` is untouched.
3. Update `Header.tsx`/`Footer.tsx` nav links to root-relative paths; add the
   "About" nav item (per Phase 1's approved nav: Home · About · Gallery ·
   Donate).
4. Create `src/about/aboutData.ts` with origin story copy, impact numbers,
   journey arrays, and trust info fields.
5. Build `OriginStory`, `JourneyTimeline`, `TrustInfo` as new components;
   reuse `ImpactStat`/`useCountUp` for Impact; keep "What S1P Is" and "Why
   Education" inline in `AboutPage.tsx`; reuse `Button` for the CTA.
6. Wire `useScrollReveal` entrances consistent with existing sections.
7. Add the Phase-1-approved homepage touches: Mission → About `TextLink`,
   Impact stat swap to real figures.
8. Accessibility pass: heading order, chart text-alternative, `aria-hidden`
   on the decorative origin-story motif, contrast spot-check.
9. Responsive check at 375 / 768 / 1024 / 1440.
10. Update `CLAUDE.md`/`Docs/` with the real decisions made during the build,
    per this project's existing documentation convention.
