# Phase 4C — Illustration Audit & Art Direction

**Status:** Audit and specification only. No artwork, SVG, component, CSS, layout, or copy was created or changed.
**Baseline:** `main` @ `9fcd8ff` (Phase 4A and 4B committed).
**Purpose:** answer, concretely, _what illustrations should exist, where, what each communicates, and what each looks like_, so another designer could draw them without guessing.

**Sources read:** `Docs/PHASE4A_VISUAL_SYSTEM_AUDIT.md` (§5 illustration language, §5.7 locked decisions I1 to I8, D1 to D13), `CLAUDE.md` (§3, §12, the 4B motion system), `Docs/PHASE4B_INTERACTION_AUDIT.md`, and the implementation: `GatheringPoint.tsx`, `EchoMark.tsx`, `EightSlicesMark.tsx`, `IllustrationSlot.tsx`, `TwoTrack.tsx`, `ClosingBand.tsx`, `Mission.tsx`, `OriginStory.tsx`, `AboutPage.tsx`, `TrustInfo.tsx`, `JourneyTimeline.tsx`, `GalleryPage.tsx`, `GalleryGrid.tsx`, `Testimonials.tsx`, `ImpactStat.tsx`, `aboutData.ts`, `testimonialsData.ts`. **Slot positions below were measured on the rendered pages** (dev server, 1440×900 emulation; the three pages loaded; Gallery measured with its empty state mounted), not estimated.

> **Scope guard.** The Phase 1 hero (`GatheringPoint`) and `EightSlicesMark` are locked and are not touched by anything here.

---

## 1. Current state

### 1.1 Existing marks

All three existing marks are inline React SVG using `var(--color-*)` tokens, `aria-hidden`, and `focusable="false"`. This is the production pattern to continue.

| Mark            | File                        | viewBox | Elements                                              | Line (viewBox units → rendered px)                                    | Opacity                    | Where shown                                                                                                                  |
| --------------- | --------------------------- | ------- | ----------------------------------------------------- | --------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Gathering Point | `hero/GatheringPoint.tsx`   | 400     | red core r26, 5 outline dots r7 to 10, 5 rim arcs r30 | dots 1.5 → ~1.6px; arcs 1.75 → ~1.8px (displayed ≤420px, scale ≤1.05) | dots .45, arcs .32, core 1 | Home hero (**locked**, animated)                                                                                             |
| EchoMark        | `mission/EchoMark.tsx`      | 120     | red core r10, 3 outline dots r3 to 4                  | 1.25 → **0.8 to 3.0px depending on size** (see 1.2)                   | dots .30, core **.90**     | Home Mission (160/224/288px); also the default content of every `IllustrationSlot` (96 to 112px) and the Gallery empty state |
| EightSlicesMark | `about/EightSlicesMark.tsx` | 200     | red core r14, 8 evenly spaced arcs r46                | arcs 2 → ~1.6 to 1.9px (displayed 160/192px)                          | arcs .32, core 1           | About Origin (**locked, unchanged**, I5)                                                                                     |

### 1.2 Findings that affect the artwork plan

| #    | Finding                                                                                                                                                                                                                                                                                          | Evidence                                                   | Consequence                                                                                                                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-1  | **EchoMark's line weight is not stable across sizes.** It is drawn at stroke 1.25 in a 120 viewBox and scaled by CSS. Rendered: 0.83px at its original 80px, 1.2px in the slot default (112px), **3.0px at the Mission size (288px)**. The hero's equivalent line is ~1.6px; EightSlices ~1.9px. | Geometry above; Mission mark measured at 288px (`985/836`) | At Mission size the mark's outlines are almost twice as heavy as the hero's, so the two marks on one page read as different families. A canonical Tier A line weight is needed, and marks must hold it at every size (`vector-effect: non-scaling-stroke`). |
| C-2  | **Core opacity differs.** EchoMark core is .9; hero and EightSlices cores are 1.                                                                                                                                                                                                                 | Source                                                     | Minor; normalise to 1.                                                                                                                                                                                                                                      |
| C-3  | **Every slot currently renders the same EchoMark** (About hero, Trust, both closing bands, Gallery hero; the Gallery empty state uses it too).                                                                                                                                                   | Source                                                     | Fine as 4A placeholders, but it means five of eight slots on three pages are visually identical today. 4C must differentiate them.                                                                                                                          |
| C-4  | **Slots are hidden below `md`** (`hidden md:flex`), except the Mission mark, which is not a slot and always shows.                                                                                                                                                                               | `IllustrationSlot.tsx`                                     | Tier B artwork is invisible to every phone visitor. This is a decision, not a bug (§12, O-5).                                                                                                                                                               |
| C-5  | **The 4A "panel" (rounded tinted plate) is a placeholder device.** With real artwork it adds a third surface behind the art's own offset blocks.                                                                                                                                                 | Source; measured slots are 384×288 panels                  | Recommend dropping the panel for final art (§4.4, C2). The Gallery empty state is the exception: it _is_ a panel.                                                                                                                                           |
| C-6  | **Trust seal and closing band are co-visible on About.** Measured at 1440: trust slot top 3481, closing slot bottom 4339, a span of 858px, inside one 900px viewport. Both sit in the right track, both currently 384×288 panels.                                                                | Measured                                                   | Identical panel treatment would read as a duplicate. They must differ in scale, weight and framing (§8.2).                                                                                                                                                  |
| C-7  | **Gallery has two marks in its first viewport.** Hero slot 186 to 426 and empty state 547 to 819 (both inside 0 to 900).                                                                                                                                                                         | Measured                                                   | They must not both be EchoMark (§8.3). Gallery empty state and closing band are also co-visible (547 to 819 and 1059 to 1347 fit in one viewport).                                                                                                          |
| C-8  | **Home Mission mark and the hero mark are close.** Hero mark 202 to 622, Mission mark 836 to 1124: 214px apart, partially co-visible while scrolling. Both are "core plus outline dots".                                                                                                         | Measured                                                   | Acceptable because Mission's placement is a locked decision (D7); keep Mission's mark visually quieter than the hero (static, stable line weight) and do not add a second variant (§8.1).                                                                   |
| C-9  | **Stat figures on Home are placeholders** (CLAUDE.md §12); About's two figures have no natural denominator.                                                                                                                                                                                      | `Impact.tsx` comment; `aboutData`                          | Proportion marks would encode false or arbitrary data. Do not build them (§7, S2).                                                                                                                                                                          |
| C-10 | **No brand logo or pizza mark exists.** `public/favicon.svg` is a cream square with a red circle.                                                                                                                                                                                                | `public/`                                                  | Any wedge or pizza drawing is the first literal pizza on the site. It must be specified once and reused (§10).                                                                                                                                              |

---

## 2. Locked decisions carried forward (not reopened)

Two tiers (I2). Hands and props only; no faces, figures, recurring cast, or beneficiary imagery (I1). Charcoal linework; **red plus at most one of green or yellow** per illustration (I3). Flat offset colour blocks behind line art, offset ~6 to 10%; no gradients. No grain or texture (I7). Hollow circles and short ticks as supporting motifs. Every new illustration contains at least one existing S1P motif. The removal test. Prefer an abstract mark when it says the thing. Fix layout before adding art. Max 3 to 4 spot illustrations per page, never two in one viewport (I8). Hero untouched (I6). `EightSlicesMark` unchanged (I5). About hero stays a quiet Tier A mark (I4). Gallery empty state is Tier A (D12). Optional eight-objects composition belongs in the Origin section, not Journey, and does not replace the mark (D13).

**Tensions, documented rather than resolved here:**

| #   | Tension                                                                                                                                                                     | Where | Handling                                                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------- |
| T-1 | The Tier B density rule ("~3 to 6 meaningful elements + 5 to 12 ticks/dots") conflicts with an eight-object composition, which has eight meaningful elements by definition. | §9    | Recorded as a condition of inclusion; not silently relaxed.                             |
| T-2 | 4A said the closing band is "a hand passing a pizza wedge" but gave no recipient (I1 forbids depicting beneficiaries).                                                      | §8.4  | Resolved in the brief: the wedge is set down on a notebook; no receiving hand.          |
| T-3 | 4A chose to hide slots below `md`, which hides the only Tier B piece on mobile.                                                                                             | C-4   | Surfaced as open question O-5.                                                          |
| T-4 | 4A's Tier A rule "line-only or one solid red core" vs this audit's trust-seal use of a green-deep arc.                                                                      | §8.2  | Allowed: Tier A may carry one accent (I3 binds all illustrations); recorded explicitly. |

---

## 3. S1P illustration grammar

### 3.1 Line

| Property         | Tier A (marks)                                                                                                                     | Tier B (spot illustrations)                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Colour           | `var(--color-charcoal)`                                                                                                            | `var(--color-charcoal)`                                                             |
| Opacity          | .32 for arcs and rim marks, .45 for outline dots (the hero's values)                                                               | 1                                                                                   |
| Rendered weight  | **1.75px** (between the hero's 1.6 and 1.8px, and EightSlices' 1.9px)                                                              | **2px**                                                                             |
| Consistency rule | One weight per piece; identical at every breakpoint (**`vector-effect="non-scaling-stroke"`** with the px value as `stroke-width`) | Same                                                                                |
| Caps / joins     | `round` / `round`                                                                                                                  | `round` / `round`                                                                   |
| Fills            | None except the red core and cream "knock-out" fills                                                                               | Cream/surface knock-out fills on figures and props so offset blocks peek out behind |
| Variable width   | Never                                                                                                                              | Never                                                                               |
| Dashes           | Not used (not in the site's vocabulary)                                                                                            | Not used                                                                            |

Proposed values are labelled as proposals; they are chosen to match what the locked hero and EightSlices already render, not invented.

### 3.2 Colour

| Colour     | Token                                       | Role in illustration                                  | Tier A                                                 | Tier B                              |
| ---------- | ------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------ | ----------------------------------- |
| Charcoal   | `--color-charcoal`                          | All linework and ticks                                | yes                                                    | yes                                 |
| Red        | `--color-red`                               | The core; the dominant offset block; the focal object | core only (and the single hero block if any)           | dominant offset block, ≥1 per piece |
| Green-deep | `--color-green-deep`                        | Education, growth, legitimacy                         | one arc or element, only where meaning applies (trust) | optional single accent block        |
| Yellow     | `--color-yellow`                            | Warmth, the shared meal                               | rarely; surface tint only                              | optional single accent block        |
| Tints      | `--color-green-tint`, `--color-yellow-tint` | Surfaces, never inside the art                        | no                                                     | no                                  |

Rules: red is always present as a core or dominant block. **Never both green and yellow in one piece** (I3). **No accent** where nothing is being signalled: most Tier A marks use red only. Yellow blocks and charcoal lines must not carry text (there is none). Forbidden hues: blue, teal, pink, purple, navy.

### 3.3 Offset blocks

- A flat shape (circle, rounded rectangle, wedge) drawn **first** (behind) and shifted **6 to 10% of the piece's shorter side** down and right of the line art it supports (locked range).
- Line art above it is knocked out with the surface colour (`var(--illustration-surface)`, §6) so the block shows only where it extends past the contour; this is what gives the "misregistered print" look of the references.
- Blocks may overlap each other but not the _lettering_ (there is none) and never extend beyond the piece's bounding box except where a frame is deliberately cropped.
- Maximum **two** blocks per piece (one red, one accent). Never outlined.

### 3.4 Supporting motifs

| Motif             | Use                                                         | Limits                                                                                 |
| ----------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Hollow circle     | Echo of the hero's "other donors"; marks scale and distance | r ≈ 2 to 4% of the piece width; Tier A 2 to 4, Tier B 3 to 5; same stroke as the piece |
| Short tick        | Energy, direction, "arrival"; irregular angles              | length ≈ 3 to 6% of width; Tier A 0 to 4, Tier B 3 to 6                                |
| Solid dot         | Rare, small; red only, as a miniature core                  | ≤2 per piece                                                                           |
| Existing S1P mark | The tie-back (core and outline dots, rim arcs)              | Every new piece contains at least one                                                  |

Totals: Tier A ≤ ~11 shapes (locked); Tier B ~3 to 6 meaningful elements plus 5 to 12 supporting marks (locked).

### 3.5 Negative space and detail

Tier B keeps ≥ ~40% of its bounding box empty (locked). **Proposed** for Tier A: ≥ 70% empty (the existing marks are >85% empty). Detail passes the **160px test**: unreadable at 160px wide means remove elements. No lettering, numerals, logos, or UI chrome in any illustration.

### 3.6 Forbidden language

Generic SaaS or business: dashboards, charts-as-decoration, shields, gears, keys, envelopes, scales, laptops, speech bubbles. Startup-onboarding characters, faces, avatars, or any recurring cast. Beneficiary or child depictions; poverty imagery. Blue, teal, pink, or purple; gradients; grain or texture; drop shadows; glows. Clip-art pepperoni, cartoon pizza faces, or photographic food. Decorative clutter: confetti fields, stars, sparkles, blobs, "memphis" shapes, sunbursts. Camera, lens or shutter iconography. Official-seal imagery (stars, laurels, crests) on the trust mark.

---

## 4. Composition rules

### 4.1 Size and ratio

Measured container: the `TwoTrack` visual track is ~469px wide at 1440 (`lg`), ~384px at 1024. The 4A slot is `aspect-[4/3]`, `max-w-sm` (384px); Gallery hero is `3/2`, `max-w-xs` (320px).

| Class                                           | Desktop size (proposed, within the locked 160 to 420px) | Share of the track |
| ----------------------------------------------- | ------------------------------------------------------- | ------------------ |
| Tier A mark                                     | 200 to 288px                                            | ≤ 60%              |
| Tier B spot illustration                        | 320 to 400px                                            | ≤ 85%              |
| Quiet utility marks (stat marker, quote anchor) | tiny CSS rules (existing)                               | n/a                |

### 4.2 Rules

- **Asymmetry:** one focal cluster off-centre; never a centred, symmetrical badge.
- **Alignment:** art sits in its own `TwoTrack` track, aligned to the track's trailing edge on `lg` (as built) and vertically centred to the text block. Never behind or under text.
- **Boundaries:** art belongs to one section and may not cross a section boundary or a band edge.
- **Overlap:** art never overlaps text. Within a piece, blocks may overlap line art (by design). A deliberately cropped frame or sleeve may meet the piece's own edge.
- **Panels:** final artwork is **unframed** (no tinted plate); the art's own blocks provide containment (C-5, decision C2). Exception: the Gallery empty state, which is itself a yellow-tint panel.
- **Relationship to existing marks:** the hero and EightSlices keep their weight and prominence; new Tier A marks are quieter in opacity and smaller; Tier B is the only full-opacity line on a page.
- **Static:** no motion (4B did not animate illustrations; 4C does not either).

### 4.3 Breakpoints

| Width | Behaviour                                                                                                                   |
| ----- | --------------------------------------------------------------------------------------------------------------------------- |
| 375   | Slots hidden (current 4A behaviour) except the Mission mark (160px). Proposal O-5 would add a compact closing illustration. |
| 768   | Slots shown stacked **below** the text, centred, at the 4A slot size. Art unchanged; only scale.                            |
| 1024  | Side-by-side `TwoTrack` (track ≈ 384px); art ≤ the sizes above.                                                             |
| 1440  | Track ≈ 469px; art at the upper end of the ranges.                                                                          |

Stroke weight does not change with scale (non-scaling-stroke); detail reduces by dropping supporting marks first, then hollow circles, never the core idea.

### 4.4 Surface handling

Tier B figures knock out with the surface they sit on. Add one CSS custom property, `--illustration-surface` (default `var(--color-cream)`); `ClosingBand` sets it to `var(--color-cream-soft)` for its band. No hard-coded surface colours inside the art.

---

## 5. Accessibility specification

| Category                                                              | Decorative or semantic | `aria-hidden`                                                         | Text duplicate                                             | Alt text | Sole carrier of meaning?                                  |
| --------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- | -------- | --------------------------------------------------------- |
| Tier A marks (Mission, About hero, Gallery hero, Gallery empty state) | Decorative             | Yes, on the SVG (`aria-hidden="true"`, `focusable="false"`), as today | The section text already says everything                   | None     | Never                                                     |
| Trust seal                                                            | Decorative             | Yes                                                                   | Registration, status and location are in the adjacent `dl` | None     | **Never.** It must not be the only signal of "registered" |
| Tier B closing illustration                                           | Decorative             | Yes                                                                   | Section heading and body carry the idea                    | None     | Never                                                     |
| Stat marker and quote anchor (CSS rules)                              | Decorative             | Yes (`aria-hidden`), as today                                         | n/a                                                        | None     | Never                                                     |
| Optional eight-objects composition                                    | Decorative             | Yes                                                                   | The eight items are listed in the story paragraph          | None     | Never                                                     |

All illustration components are `aria-hidden` internally (the `EchoMark` pattern) in addition to the `IllustrationSlot` wrapper. No `<title>`, no `<desc>`, no `role="img"`. No illustration is focusable or interactive. This section is a specification only; no accessibility copy is added to the product.

---

## 6. Production format

| Option                                    | Verdict                                                       | Why                                                                                                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Inline SVG in a React component**       | **Use**                                                       | Matches `GatheringPoint`, `EchoMark`, `EightSlicesMark`; lets strokes and fills use `var(--color-*)` and the new `--illustration-surface`; zero requests; no dependency; trivially `aria-hidden` |
| Imported `.svg` asset (`<img>` or `?url`) | Reject                                                        | An `<img>` SVG cannot see the page's CSS variables, so tokens would be hard-coded hex; extra requests; breaks the "tokens only" rule                                                             |
| CSS-only composition                      | Use only for rules (stat marker, quote anchor)                | Already built; adequate                                                                                                                                                                          |
| Existing component reuse                  | Use wherever the removal test says an existing mark is enough | EchoMark for Mission, About hero, Gallery empty state                                                                                                                                            |
| Illustration or animation library         | Reject                                                        | No compelling reason; contradicts CLAUDE.md §2                                                                                                                                                   |

**Proposed structure** (new folder `src/components/illustrations/`, documented in CLAUDE.md when built):

- `illustrationTokens.ts`: the line weights, opacities and ratios in §3 as named constants.
- One component per piece (`TrustSeal.tsx`, `ViewfinderMark.tsx`, `WedgeOnNotebook.tsx`, and the optional `OriginObjects.tsx`). Each accepts `className` only.
- A small `IllustrationSlot` change: `bare` (no plate) as the default for final art; plate retained as an option for the Gallery empty state.
- `EchoMark` gains non-scaling strokes and a fixed core opacity (C-1, C-2); this is an edit to an existing, unlocked file.
- Guardrail test (once, not per piece): render every illustration component and assert no hard-coded hex colours, no `<text>`, no gradient or filter elements, `aria-hidden="true"`, and an element-count ceiling.

---

## 7. Slot inventory

**Eight distinct slot types, ten placements** (impact markers appear on Home ×4 and About ×2 but count once per page; the closing band appears on About and Gallery). One further optional piece (Origin objects) has no slot yet.

| ID  | Slot                                                                       | Page                  | Placements                               | Tier  | Verdict                                         |
| --- | -------------------------------------------------------------------------- | --------------------- | ---------------------------------------- | ----- | ----------------------------------------------- |
| S1  | Mission mark (not a `data-illustration-slot`; `EchoMark` at 160/224/288px) | Home                  | 1                                        | A     | **Reuse** EchoMark, fix line weight             |
| S2  | `impact-stat-marker`                                                       | Home (×4), About (×2) | 2                                        | A     | **No artwork**; keep the CSS rule               |
| S3  | `quote-anchor`                                                             | Home                  | 1                                        | A     | **No artwork**; keep the CSS rule               |
| S4  | `about-hero-mark`                                                          | About                 | 1                                        | A     | **Reuse** EchoMark, unframed                    |
| S5  | `trust-seal`                                                               | About                 | 1                                        | A     | **New** drawing                                 |
| S6  | `closing-band`                                                             | About, Gallery        | 2                                        | **B** | **New** spot illustration                       |
| S7  | `gallery-hero-mark`                                                        | Gallery               | 1                                        | A     | **New** drawing                                 |
| S8  | `gallery-empty-state`                                                      | Gallery               | 1                                        | A     | **Reuse** EchoMark (existing yellow-tint panel) |
| S9  | Origin objects                                                             | About                 | 0 (needs a new slot and a layout change) | B     | **Conditional** (§9)                            |

**Counts:** Tier A placements 8 (7 slot types); Tier B placements 2 (1 artwork, plus one optional variant); optional 2 (Origin objects, Gallery closing variant). **New artwork required: 3 pieces** (2 Tier A, 1 Tier B) **plus 1 refinement** (EchoMark line weight), and 2 optional pieces.

Each slot below covers all 20 requested fields (page/section and desktop/mobile are combined where the answer is the same).

### S1. Mission mark

| Field                 | Spec                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------- |
| Page / section        | Home / Mission                                                                               |
| Slot name             | none (inline `EchoMark` in the `TwoTrack` aside)                                             |
| Tier                  | A                                                                                            |
| Purpose               | Concept: "what feels small can be life-changing"; anchors the section opposite the text (D7) |
| Communicates          | One contribution (the red core) among others (the outline dots)                              |
| Motifs reused         | Red core, outline dots (this _is_ the existing EchoMark)                                     |
| Subject               | Abstract                                                                                     |
| Composition           | Existing: core slightly right of centre, three dots scattered left and upper right           |
| Colour                | Red core + charcoal outlines; no accent                                                      |
| Density               | 4 shapes; ~90% empty                                                                         |
| Aspect                | 1:1 (viewBox 120)                                                                            |
| Desktop               | 288px, track trailing edge, vertically centred to the text                                   |
| Mobile                | 160px, below the text (the one mark that shows on phones)                                    |
| Decorative / semantic | Decorative                                                                                   |
| `aria-hidden`         | Yes (already)                                                                                |
| Reusable              | Yes (it is the shared mark)                                                                  |
| Copy dependency       | None; the Mission quote may change in 4D without affecting it                                |
| Complexity            | Low (stroke normalisation only)                                                              |
| Priority              | P1 (C-1 makes it visibly inconsistent at 288px)                                              |

### S2. Impact stat marker

| Field                 | Spec                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Page / section        | Home / Impact (×4); About / "What It's Added Up To" (×2)                                                                              |
| Slot name             | `impact-stat-marker`                                                                                                                  |
| Tier                  | A                                                                                                                                     |
| Purpose               | Rhythm: a short rule that draws in as the count begins; red for giving, green-deep for outcomes                                       |
| Communicates          | Separation and emphasis; red versus green carries the giving/outcome split                                                            |
| Motifs reused         | Red (and green-deep) accent only                                                                                                      |
| Subject               | A 2px × 32px rule                                                                                                                     |
| Composition           | Left-aligned (centred on mobile) above the numeral                                                                                    |
| Colour                | `--color-red` or `--color-green-deep`                                                                                                 |
| Density               | 1 shape                                                                                                                               |
| Aspect                | n/a                                                                                                                                   |
| Desktop / mobile      | Same; already built and animated (4B)                                                                                                 |
| Decorative / semantic | Decorative                                                                                                                            |
| `aria-hidden`         | Yes (already)                                                                                                                         |
| Reusable              | Yes (`ImpactStat`)                                                                                                                    |
| Copy dependency       | Figures are placeholders on Home (C-9)                                                                                                |
| Complexity            | None                                                                                                                                  |
| Priority              | **Exclude from 4C.** Removal test: the rule already does its job. A proportion mark would encode placeholder or denominator-less data |

### S3. Quote anchor

| Field                 | Spec                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Page / section        | Home / Testimonials                                                                                                |
| Slot name             | `quote-anchor`                                                                                                     |
| Tier                  | A                                                                                                                  |
| Purpose               | Marks the lead quote                                                                                               |
| Communicates          | "This is a voice"                                                                                                  |
| Motifs reused         | Red accent only                                                                                                    |
| Subject               | A 2px × 40px rule                                                                                                  |
| Composition           | Above the lead quote, left-aligned                                                                                 |
| Colour                | `--color-red` on the yellow-tint band                                                                              |
| Density               | 1 shape                                                                                                            |
| Aspect                | n/a                                                                                                                |
| Desktop / mobile      | Same                                                                                                               |
| Decorative / semantic | Decorative                                                                                                         |
| `aria-hidden`         | Yes (already)                                                                                                      |
| Reusable              | No                                                                                                                 |
| Copy dependency       | Quotes are placeholders (CLAUDE.md §12); the quote text already contains curly quotation marks                     |
| Complexity            | None                                                                                                               |
| Priority              | **Exclude from 4C.** A drawn glyph would duplicate the quotation marks already in the text; the rule is sufficient |

### S4. About hero mark

| Field                 | Spec                                                                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page / section        | About / hero                                                                                                                                                            |
| Slot name             | `about-hero-mark`                                                                                                                                                       |
| Tier                  | A (I4, locked)                                                                                                                                                          |
| Purpose               | Identity and orientation for the page about the origin                                                                                                                  |
| Communicates          | The same single-contribution idea, tying the page to the Home hero and Mission                                                                                          |
| Motifs reused         | EchoMark: core + outline dots (not eight arcs, per I4)                                                                                                                  |
| Subject               | Abstract                                                                                                                                                                |
| Composition           | Existing EchoMark, unframed, at 224 to 288px, trailing edge, vertically centred to the h1 block                                                                         |
| Colour                | Red core + charcoal; no accent                                                                                                                                          |
| Density               | 4 shapes                                                                                                                                                                |
| Aspect                | 1:1                                                                                                                                                                     |
| Desktop               | 224 to 288px (measured track: slot currently 889/202, 384×288)                                                                                                          |
| Mobile                | Hidden (4A)                                                                                                                                                             |
| Decorative / semantic | Decorative                                                                                                                                                              |
| `aria-hidden`         | Yes                                                                                                                                                                     |
| Reusable              | Yes                                                                                                                                                                     |
| Copy dependency       | None                                                                                                                                                                    |
| Complexity            | Low                                                                                                                                                                     |
| Priority              | P1. **Risk (O-2):** it duplicates the Mission mark (Home) in composition. If review finds About too similar to Home, the fallback is a new composition (not eight arcs) |

### S5. Trust seal

| Field                 | Spec                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------- |
| Page / section        | About / "About the Trust"                                                             |
| Slot name             | `trust-seal`                                                                          |
| Tier                  | A                                                                                     |
| Purpose               | Orientation and credibility for the factual block                                     |
| Communicates          | "Held together; registered": enclosure and continuity, without claiming certification |
| Motifs reused         | Rim arcs, red core, outline marks                                                     |
| Subject               | Concentric partial rings (brief in §8.2)                                              |
| Composition           | Unframed, ~200 to 240px, trailing edge, centred to the `dl`                           |
| Colour                | Charcoal + red core + **one green-deep arc** (trust/legitimacy, per §4.2)             |
| Density               | ~9 shapes (≤ 11)                                                                      |
| Aspect                | 1:1                                                                                   |
| Desktop               | 200 to 240px                                                                          |
| Mobile                | Hidden                                                                                |
| Decorative / semantic | Decorative (**not** a seal of authority)                                              |
| `aria-hidden`         | Yes                                                                                   |
| Reusable              | No (one use)                                                                          |
| Copy dependency       | The `dl` carries "Registration No. 316/2016"; the seal contains no text               |
| Complexity            | Medium (new drawing, must not echo EightSlices)                                       |
| Priority              | P2                                                                                    |

### S6. Closing band (About and Gallery)

| Field                 | Spec                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page / section        | About / closing CTA; Gallery / closing CTA                                                                                                               |
| Slot name             | `closing-band`                                                                                                                                           |
| Tier                  | **B**                                                                                                                                                    |
| Purpose               | Transition and emotional moment: the page's last beat before the donate button                                                                           |
| Communicates          | One pizza's cost becomes schoolwork; "the same choice is still there"                                                                                    |
| Motifs reused         | Pizza wedge crust arc (= rim arc), red core as the offset block, hollow circles and ticks                                                                |
| Subject               | A hand setting a pizza wedge on an open notebook (§8.4)                                                                                                  |
| Composition           | One cluster, asymmetric, off-centre in a 4:3 field                                                                                                       |
| Colour                | Charcoal + red + green-deep (notebook); no yellow                                                                                                        |
| Density               | 4 meaningful elements + 2 blocks + ~8 supporting marks                                                                                                   |
| Aspect                | 4:3                                                                                                                                                      |
| Desktop               | 320 to 400px, unframed, trailing edge                                                                                                                    |
| Mobile                | Hidden (4A) → open question O-5                                                                                                                          |
| Decorative / semantic | Decorative                                                                                                                                               |
| `aria-hidden`         | Yes                                                                                                                                                      |
| Reusable              | Yes: one component, used on About and Gallery (+ optional Gallery variant)                                                                               |
| Copy dependency       | Concept relies on "one pizza, or one student's next school fee" (About). If 4D rewrites the closing copy, the idea (pizza → schooling) must be preserved |
| Complexity            | High (the only figurative piece)                                                                                                                         |
| Priority              | P1 (after Tier A foundation is validated)                                                                                                                |

### S7. Gallery hero mark

| Field                 | Spec                                                                             |
| --------------------- | -------------------------------------------------------------------------------- |
| Page / section        | Gallery / hero                                                                   |
| Slot name             | `gallery-hero-mark`                                                              |
| Tier                  | A                                                                                |
| Purpose               | Orientation: this page is about moments/photos                                   |
| Communicates          | "Framed moments" without camera iconography                                      |
| Motifs reused         | Red core, outline dots; four corner ticks as a frame                             |
| Subject               | A "viewfinder" of four L-shaped corner ticks around a small core (brief in §8.3) |
| Composition           | Unframed, 3:2, ~240px wide, trailing edge                                        |
| Colour                | Charcoal + red core; no accent                                                   |
| Density               | ~8 shapes                                                                        |
| Aspect                | 3:2 (matches the current slot)                                                   |
| Desktop               | 240 to 280px                                                                     |
| Mobile                | Hidden                                                                           |
| Decorative / semantic | Decorative                                                                       |
| `aria-hidden`         | Yes                                                                              |
| Reusable              | Possibly for future photo-related sections                                       |
| Copy dependency       | None                                                                             |
| Complexity            | Low                                                                              |
| Priority              | P2                                                                               |

### S8. Gallery empty state

| Field                 | Spec                                                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page / section        | Gallery / grid (empty state)                                                                                                                                         |
| Slot name             | `gallery-empty-state`                                                                                                                                                |
| Tier                  | A (D12)                                                                                                                                                              |
| Purpose               | Emotional moment: "photos are on their way"                                                                                                                          |
| Communicates          | Quiet waiting                                                                                                                                                        |
| Motifs reused         | EchoMark                                                                                                                                                             |
| Subject               | Existing EchoMark inside the existing yellow-tint panel                                                                                                              |
| Composition           | Centred, 96 to 112px                                                                                                                                                 |
| Colour                | Red core; yellow-tint is the panel, not the art                                                                                                                      |
| Density               | 4 shapes                                                                                                                                                             |
| Aspect                | 1:1                                                                                                                                                                  |
| Desktop / mobile      | Same (panel is not hidden on mobile)                                                                                                                                 |
| Decorative / semantic | Decorative                                                                                                                                                           |
| `aria-hidden`         | The mark yes; the panel's sentence is real content                                                                                                                   |
| Reusable              | The panel, yes                                                                                                                                                       |
| Copy dependency       | The sentence is real copy and stays                                                                                                                                  |
| Complexity            | None                                                                                                                                                                 |
| Priority              | **Reuse as-is** (after the shared EchoMark fix). It sits in the first viewport with the Gallery hero mark (C-7), so the hero mark must be the _different_ piece (S7) |

---

## 8. Design briefs for new artwork

### 8.1 EchoMark refinement (S1, S4, S8 depend on it)

No new drawing. Change the stroke to the canonical Tier A weight (§3.1) using non-scaling strokes, set the core to full opacity, and keep the geometry exactly as drawn. Result: the Mission mark at 288px matches the hero's line weight, and the same mark at 112px is no thinner than it. **Verify against C-1 by measuring rendered stroke px at 160/224/288/112.**

### 8.2 Trust seal (S5, Tier A, new)

- **viewBox:** 200×200. **Rendered:** 200 to 240px, unframed.
- **Idea:** enclosure that is held but not sealed shut: continuity, not a stamp of authority.
- **Elements (≈9):**
  1. Red core, r ≈ 9, centred.
  2. Inner ring: three **long** arcs (each ~70 to 90°) at r ≈ 38 with three unequal gaps. Charcoal, 1.75px, .35 opacity.
  3. Outer ring: two long arcs at r ≈ 64 (~120° and ~100°) with two gaps at irregular angles. Charcoal, .35.
  4. One **green-deep** arc segment (~40°) on the outer ring, full opacity: the single accent.
  5. Three tiny ticks outside the outer ring at irregular angles, and one hollow circle (r ≈ 4) near a gap.
- **Must not look like EightSlices:** EightSlices is eight _short_, _evenly spaced_ arcs on _one_ ring at r46 with a r14 core. The seal uses _long_, _uneven_ arcs on _two_ rings with a small core. No eight-fold symmetry anywhere.
- **No** text, numerals, stars, laurels, shield, or crest.
- **Colour:** charcoal + red core + green-deep arc; no yellow.
- **160px test:** two broken rings around a dot, one arc in green; reads as "contained and orderly".
- **Placement:** right track of the Trust section, centred to the `dl`; must differ from the closing illustration in scale (≈220px vs ≈360px) and weight (.35 opacity vs full) because they are co-visible (C-6).

### 8.3 Gallery viewfinder mark (S7, Tier A, new)

- **viewBox:** 240×160 (3:2). **Rendered:** 240 to 280px, unframed.
- **Idea:** a frame around a moment.
- **Elements (≈8):**
  1. Four L-shaped corner ticks forming an implied rectangle (each leg ~20 units), charcoal 1.75px, .4 opacity, with a deliberate ~10% inset and one corner slightly shorter for asymmetry.
  2. Red core (r ≈ 10) placed off-centre inside, like a subject not yet centred.
  3. Two outline dots (r 3 to 4) inside the frame; one hollow circle (r ≈ 3) just outside it.
- **No** lens, shutter, aperture, camera body, or flash.
- **Colour:** charcoal + red; no accent.
- **160px test:** corners plus a red dot read as "a framed subject".
- **Distinct from S8:** S8 is the plain EchoMark (no frame), both in the first viewport.

### 8.4 Closing illustration: "wedge on notebook" (S6, Tier B, new)

- **Story:** the cost of one pizza, set down on a student's schoolwork. Pairs with About's _"one pizza, or one student's next school fee"_ and Gallery's _"someone choosing one pizza's worth of support."_
- **viewBox:** 400×300 (4:3). **Rendered:** 320 to 400px, unframed.
- **Elements (4 meaningful, within the 3 to 6 rule):**
  1. **A hand and forearm**, faceless and unfilled (cream knock-out), entering from the upper-right edge of the piece with a simple cuff line, releasing:
  2. **A pizza wedge**: a triangle with a curved crust edge on the outer side (the crust is a **rim arc**, an existing S1P motif), resting on:
  3. **An open notebook**: two simple page shapes with two ruled lines each, lower-left of centre.
  4. **A ghost of the whole pizza**: a single large hollow circle outline, partly cropped by the upper-left edge, **broken by a wedge-shaped gap** where the slice came from (the "one sacrificed").
- **Offset blocks (2):** a **red** disc (the core motif, enlarged) behind the hand and wedge, offset ~8% down-right; a **green-deep** rounded rectangle behind the notebook, offset ~8%. No yellow (I3).
- **Supporting marks (≈8):** three hollow circles, three short ticks at irregular angles, two small dots (one red).
- **Gesture:** release, not handover: the wedge is just touching the page; no recipient hand (T-2, I1).
- **Negative space:** ≥ ~45%; the upper-right and lower-right are left open for the sleeve and ticks.
- **Line:** charcoal, 2px, full opacity, round caps and joins; all fills are the surface knock-out except the two blocks.
- **160px test:** hand, a triangle, an open book, a red disc. If it reads as "a slice placed on a book", it passes. **Fallback concept** if review rejects the combination: the hand holds the wedge beside an equal-sized pencil and notebook, communicating exchange rather than placement.
- **Forbidden:** faces, a second hand, children, uniforms or school buildings, coins, rupee glyphs, pepperoni, lettering on the notebook.
- **Reuse:** one component on both pages. **Optional variant (4C-C):** on Gallery, replace the notebook with a rectangular photo print whose content is the S1P motif (a red core and two outline dots), accent yellow instead of green-deep, so the two closers rhyme without being identical.

---

## 9. The eight-object Origin composition: evaluation

**Source support.** The origin paragraph lists the eight items verbatim: _a new dress for her granddaughter, sweets, an offering at the temple, bus fare, a doll, bangles, a gift for her son-in-law, and school supplies_ (`ORIGIN_STORY_PARAGRAPHS[1]`).

| Test                              | Finding                                                                                                                                                                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Storytelling value                | **High.** It is the only place on the site where the founding story could be shown as objects rather than abstraction, and it is the most authentic S1P subject available.                                                                                |
| Relationship to `EightSlicesMark` | The mark already says "eight small things" abstractly. The objects would add _what_ they were, not _that_ there were eight.                                                                                                                               |
| Information added                 | Mostly redundant: the same eight items are named in the paragraph directly beside it. It adds concreteness and warmth, not new facts.                                                                                                                     |
| Visual density                    | **Conflicts with T-1.** Eight props exceed the Tier B "3 to 6 meaningful elements" ceiling. Eight simplified props in one frame is workable, but it needs an explicit exception to a locked rule.                                                         |
| Crowding                          | The Origin section is already 760px tall at 1440 (953 to 1713) with a 192px mark. A band of eight objects would add roughly 280 to 320px, making the section taller than one viewport and putting two graphics (the mark and the objects) in one section. |
| Requires layout change            | **Yes.** There is no slot for it; the section is a two-track split. Layout was closed in 4A.                                                                                                                                                              |
| Information gaps                  | _An offering at the temple_ has no specified object (a lamp, flowers, a coconut are all inventions). _A gift for her son-in-law_ is unspecified. Neither can be drawn faithfully from the source.                                                         |
| Cultural and dignity risk         | It depicts a real woman's purchases. Handled carefully (objects only, no figure), it is respectful; depicting a religious offering needs the client's confirmation of what is appropriate.                                                                |

**Recommendation: exclude from the first 4C pass; include later only if all of the following hold.**

1. The two information gaps are answered by the client (what the temple offering is; whether to show it).
2. The locked density rule is explicitly relaxed _for this one piece_ (eight props are story-bound), with a cap of eight props, no supporting ticks beyond four, and ≥ ~45% empty space.
3. A layout decision is approved: the objects sit as a single horizontal strip **below** the Origin text-and-mark row, inside the same section, not beside the mark.
4. It is built last, after the closing illustration has been validated, so it inherits the settled grammar.

**If included, spec (conditional):** eight icon-scale props in one row or a gently arced strip on a thin hairline: dress; a sweet (wrapped, two twisted ends); offering (object TBD, G-1); bus fare (two small coins or a ticket stub shape, no rupee glyph); a doll (a simple bust-less rag-doll silhouette with no face); bangles (three nested hollow circles, using the hollow-circle motif); a gift (box with a ribbon cross); school supplies (pencil and notebook corner). Charcoal 2px; **one** red offset block shared behind all eight, plus a single accent only if the offering object warrants it; no green and yellow together. Total width ≤ the text column (≈ 640px), height ≈ 100 to 120px. Unframed; `aria-hidden`.

---

## 10. Page rhythm

### Home (0 new Tier B; correct and intentional)

Geometry (1440): hero mark 202 to 622, Mission mark 836 to 1124, stat markers 1544, quote anchor 2597.

- **Needs new illustration work?** No. The page already has an animated hero, a static Mission mark, and data and quote markers. The Testimonials band is the page's colour moment; the Donation panel is a task area and should stay clear.
- **Only change:** the Mission/EchoMark line weight (C-1). Adding a second Tier A variant would put two similar core-and-dots marks in adjacent screens (C-8).

### About (1 Tier B, 1 new Tier A; optional objects)

Geometry (1440): hero mark slot 202 to 490, What S1P Is 603 to 953 (no art), Origin 953 to 1713 (EightSlices at 1237 to 1429), Journey 2080 to 2782 (the chart is the art), Impact markers 3084, Trust seal 3481 to 3769, closing 4051 to 4339.

- **First viewport:** hero mark only. Good.
- **Competing pairs:** Trust seal and closing illustration are 282px apart and co-visible (C-6). Differentiate by scale (≈220 vs ≈360px), weight (Tier A .35 vs Tier B full), and silhouette (concentric rings vs figurative cluster).
- **Journey and Impact** deliberately have no illustration: the chart and the numerals are the visual interest.
- **Origin** keeps the unchanged `EightSlicesMark`.

### Gallery (1 Tier B, 1 new Tier A)

Geometry (1440): hero mark 186 to 426, empty state 547 to 819, closing 1059 to 1347.

- **First viewport:** hero mark _and_ the empty state. They must not be the same drawing (C-7): viewfinder (S7) above, plain EchoMark in the yellow panel (S8) below.
- **Empty state and closing** are co-visible; Tier A (panel) + Tier B (closing) is within budget (I8 counts spot illustrations only), and the yellow-tint panel is the only strong colour field.
- When real photos exist, the grid replaces the empty state and the page becomes photo-led; the hero mark and closer remain.

---

## 11. Implementation map

| Illustration                          | Page                 | Tier  | New artwork? | Component or asset                              | Priority | Dependencies                                      |
| ------------------------------------- | -------------------- | ----- | ------------ | ----------------------------------------------- | -------- | ------------------------------------------------- |
| EchoMark line-weight refinement       | Home, About, Gallery | A     | No (edit)    | `EchoMark.tsx`                                  | P1       | Approve C8                                        |
| Mission mark                          | Home                 | A     | No           | existing `EchoMark`                             | P1       | EchoMark refinement                               |
| About hero mark                       | About                | A     | No           | existing `EchoMark` (unframed)                  | P1       | Slot `bare`; C1                                   |
| Gallery empty-state mark              | Gallery              | A     | No           | existing `EchoMark` in the existing panel       | P1       | EchoMark refinement                               |
| Stat markers                          | Home, About          | A     | No           | existing CSS rule                               | n/a      | none (excluded)                                   |
| Quote anchor                          | Home                 | A     | No           | existing CSS rule                               | n/a      | none (excluded)                                   |
| Trust seal                            | About                | A     | **Yes**      | `TrustSeal.tsx`                                 | P2       | Tokens file, `bare` slot                          |
| Gallery viewfinder mark               | Gallery              | A     | **Yes**      | `ViewfinderMark.tsx`                            | P2       | Tokens file, `bare` slot                          |
| Closing illustration                  | About, Gallery       | **B** | **Yes**      | `WedgeOnNotebook.tsx` (one component, two uses) | P1       | Tokens, `--illustration-surface`, `bare` slot, C3 |
| Gallery closing variant (photo print) | Gallery              | B     | Variant      | prop on `WedgeOnNotebook`                       | optional | Closing illustration validated; C4                |
| Origin objects                        | About                | B     | **Yes**      | `OriginObjects.tsx`                             | optional | §9 conditions; layout approval                    |

### 4C-A: Tier A (quiet marks)

1. EchoMark line-weight refinement (shared fix).
2. Reuse EchoMark: Mission, About hero, Gallery empty state.
3. New: Trust seal; Gallery viewfinder mark.
4. Leave as CSS rules: stat markers, quote anchor.

### 4C-B: Tier B (spot illustrations)

1. `WedgeOnNotebook` closing illustration, shared by About and Gallery.

### 4C-C: Optional (only if approved)

1. Gallery closing variant (photo print instead of notebook).
2. Origin objects composition (all four conditions in §9).
3. A compact mobile version of the closing illustration (O-5).
4. A new About hero composition if the reused EchoMark proves too similar to Home (O-2).

**Totals:** 10 slot placements mapped across 8 slot types; Tier A 8 placements (3 new or refined artworks, the rest reuse); Tier B 2 placements (1 artwork); optional 4 items.

---

## 12. Implementation order

Ordered to minimise visual drift: every later piece is drawn against already-validated neighbours.

1. **Foundations.** `illustrationTokens.ts`, `--illustration-surface`, the `bare` slot option, and the EchoMark line-weight refinement. Measure rendered stroke px at every EchoMark size (C-1). _Why first:_ it fixes the one measurable inconsistency and defines the weights every other piece must match.
2. **One representative Tier A piece: the Trust seal.** It is the hardest Tier A (must not echo EightSlices) and the best test of the grammar. Review at 1440 and 1024 next to the real EightSlicesMark (same page) and the existing hero.
3. **Validate** against §13. Only then proceed.
4. **Remaining Tier A:** Gallery viewfinder; place the reused EchoMark in Mission, About hero, Gallery empty state; confirm the Gallery first viewport no longer shows two identical marks.
5. **One representative Tier B piece: the closing illustration**, drawn on the About page against the validated Trust seal (they are co-visible).
6. **Validate** at 1440/1024/768 (and 375 if O-5 is approved). Check the 160px test and the B-versus-seal differentiation.
7. **Optional pieces**, one at a time, each re-validated.
8. **Integrate** (replace placeholders in `IllustrationSlot`), add the one guardrail test, update CLAUDE.md (folder structure, tokens file, grammar summary).
9. **Responsive and accessibility review** (§13).

---

## 13. Review checklist (after implementation)

For every illustration:

- [ ] Does it communicate something specific? (State it in one sentence.)
- [ ] Would removing it hurt comprehension, identity, or storytelling (not merely density)?
- [ ] Does it contain at least one existing S1P motif (red core, outline dots, rim arcs)?
- [ ] Colour: charcoal + red + **at most one** of green-deep or yellow; no blue/teal/pink/purple; no gradient, grain, or shadow?
- [ ] Is the line weight correct (Tier A ≈ 1.75px at .32 to .45; Tier B 2px full), identical at 375/768/1024/1440?
- [ ] Offset blocks sit behind, offset 6 to 10%, at most two?
- [ ] Is there enough negative space (Tier B ≥ ~40%; Tier A ≥ ~70%)? Does it pass the 160px test?
- [ ] No faces, figures, children, lettering, or forbidden props (§3.6)?
- [ ] Does it avoid generic SaaS or startup-onboarding language?
- [ ] Does it compete with nearby content or another illustration in the same viewport?
- [ ] Does it work at 375px (hidden or compact as decided) and at 1440px?
- [ ] Is it `aria-hidden`, non-focusable, free of `<title>`/`<desc>`, and never the sole carrier of meaning?
- [ ] No hard-coded hex values; only tokens?
- [ ] Does it still feel like S1P (restrained, warm, editorial) rather than a generic illustration system?
- [ ] Is it consistent with the Hero and `EightSlicesMark` (not louder than the hero; not echoing the mark)?

---

## 14. Open questions, information gaps, and decisions required

### Information gaps

| #   | Gap                                                                                         | Impact                                                         |
| --- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| G-1 | What object represents "an offering at the temple"? Whether to depict it at all.            | Blocks the Origin objects piece                                |
| G-2 | "A gift for her son-in-law" is unspecified.                                                 | Origin objects (use a generic wrapped box)                     |
| G-3 | What the Gallery photos will actually show (school visits, handovers, community).           | Informs whether the viewfinder mark is apt                     |
| G-4 | No S1P logo or pizza mark exists.                                                           | The wedge becomes the first literal pizza; specify once, reuse |
| G-5 | Home stat figures are placeholders.                                                         | Reason stat marks are excluded                                 |
| G-6 | The reference images used in 4A are available only in the conversation, not the repository. | A future designer cannot see them; see C9                      |

### Decisions required

| #       | Decision                                                                                                                                                   | Recommendation                                                                    |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **C1**  | About hero: reuse EchoMark (unframed), or commission a new composition?                                                                                    | **Reuse**; revisit only if review finds Home/About too alike (O-2)                |
| **C2**  | Drop the 4A tinted plate behind final artwork (unframed by default), keeping it only for the Gallery empty state?                                          | **Yes** (adds a `bare` option to `IllustrationSlot`)                              |
| **C3**  | Approve the closing concept (hand sets a wedge on an open notebook; red + green-deep; no recipient), with the "wedge beside pencil and notebook" fallback? | **Approve**                                                                       |
| **C4**  | Build the Gallery closing variant (photo print, yellow accent)?                                                                                            | **Later**, after the base piece is validated                                      |
| **C5**  | Show a compact closing illustration on phones (it is hidden below `md` today)?                                                                             | **Yes, small (≈240px), only for the closing piece**; needs a one-line slot change |
| **C6**  | Confirm no artwork for stat markers and the quote anchor (keep the CSS rules)?                                                                             | **Confirm**                                                                       |
| **C7**  | Origin objects: exclude from the first pass, include later only under the §9 conditions?                                                                   | **Confirm**; provide answers to G-1 and G-2 if you want it                        |
| **C8**  | Approve editing `EchoMark` (non-scaling strokes, core opacity 1) to fix the line-weight inconsistency (C-1)?                                               | **Approve**                                                                       |
| **C9**  | Save the 4A reference images into the repo (for example `Docs/references/`) so future work can use them?                                                   | **Yes**, if you can supply the files                                              |
| **C10** | Trust seal: approve the two-ring, uneven-arc design with a single green-deep arc and no text or crest?                                                     | **Approve**                                                                       |
