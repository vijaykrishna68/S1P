# Phase 4A — Visual System Audit & Proposal

**Status:** Audit and proposal only. No code, tokens, copy, or interactions were changed.
**Baseline:** `main` @ `f7acf84`.
**Method:** Read the code (`src/styles/index.css`, `ui/*`, Header/Footer, every Home section, About, Gallery, the hero/Echo/EightSlices SVGs, the donation steps). Spacing figures below are computed from the Tailwind classes actually in the source. **I did not render or screenshot the pages**, so claims about how something _feels_ are inferred from the composition the code produces, not observed.

> **Update (rev. 4):** every decision (D1 to D13, I1 to I8) is now resolved; see the Decision register at the end. Items that changed since rev. 3 are marked "decided" or "approved." Since the first draft, edits are confined to §4.1 to §4.4, §5, the About / Origin / CTA / FAQ / Gallery rows of §6, §7 items 2, 7, 8, 10, 11, §8.4, §9, §10, §11, and the decisions lists.

---

## 1. Current visual system

### 1.1 Color (from `src/styles/index.css` `@theme`)

| Token            | Value     | Actual use in code                                                                                                              |
| ---------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `cream`          | `#fff8f2` | Page background (`html`, `body`)                                                                                                |
| `cream-soft`     | `#fdede3` | Alternating section band (17 uses): Impact, About Origin / Impact / CTA, Gallery CTA; also inset panels, hover fills, skeletons |
| `charcoal`       | `#1d1d1f` | Headlines, SVG outlines (at 0.3–0.45 opacity), hairlines (`/10`–`/35`)                                                          |
| `charcoal-muted` | `#6b6b6b` | Body copy everywhere                                                                                                            |
| `red`            | `#e63946` | Hero core, EchoMark core, EightSlices core, focus ring, active testimonial dot, hover text on links                             |
| `red-deep`       | `#c92c3a` | Button resting fill, error text, chart line                                                                                     |
| `red-darkest`    | `#9f232e` | Button hover/active fill                                                                                                        |
| `green`          | `#2ecc71` | **One public use:** the "copied" check icon in `CopyUpiButton`. Admin uses it as a button fill.                                 |
| `orange`         | `#ff7a00` | **Defined, never used** (grep finds only the token)                                                                             |

There are no gradients, no yellow, no tinted surfaces other than `cream-soft`, and no textures anywhere. The only non-token color literal in a component is the button hover shadow, `rgba(159,35,46,0.55)`, which is `red-darkest`.

### 1.2 Typography

- Display: **Outfit** (500/600/700), applied to `h1`–`h3` in `@layer base` and via `font-display`. Body: **Plus Jakarta Sans** (400/500/600).
- Type scale in practice: h1 `text-4xl → md:5xl → lg:6xl` (Hero), `text-4xl → md:5xl` (About, Gallery). **Every h2 is the identical `text-3xl md:text-4xl font-bold tracking-tight`** (12 files). Body `text-base md:text-lg leading-relaxed text-charcoal-muted`. Pull quotes `text-2xl md:text-3xl font-semibold` (Mission, About "Why Education"), testimonials `text-xl md:text-2xl font-medium`.
- Small uppercase tracked labels exist twice, both on About (`Registered Trust · No. 316/2016`, `Non-profit · Education-focused…`). CLAUDE.md §3 says no decorative eyebrows; these carry factual content, not decoration.

### 1.3 Spacing and containers

- `Container`: `max-w-[1200px] px-6 md:px-10`. This is the only container.
- **Every section uses `py-20 md:py-28 lg:py-32`** (80 / 112 / 128px top _and_ bottom) on Home (Mission, Impact, Donation, Testimonials, FAQ), About (7 of 8 sections), and Gallery. Exceptions: Hero (same value on its own Container), About "Why Education" (`py-16 md:py-20`), Footer (`py-14 md:py-16`), Gallery grid (`pb-20 md:pb-28 lg:pb-32`, no top).
- Text blocks are capped narrower than the container: `max-w-2xl` (672px) in 9 places, `max-w-xl` (576px) in 4, plus `max-w-[46ch]` / `[52ch]` on paragraphs.

### 1.4 Borders, radii, shadows

- Borders are hairlines: `border-charcoal/10` (7), `/15` on inputs and the copy button (4), `/30` on hover (4). FAQ and Trust use `divide-y` + `border-y` at `/10`.
- Radii: `rounded-full` (10: buttons, dots, icon wells), `rounded-xl` (6: inputs, gallery tiles), `rounded-2xl` (4: QR well, empty state, dialog image), `rounded-lg` (2).
- Shadows: **one**, the button hover glow. No card shadows. There are essentially no "cards": surfaces are `cream-soft` bands or white input wells.

### 1.5 Section patterns

1. **Text column on cream**: h2 + muted paragraph in a `max-w-2xl` block, left-aligned (Impact heading, About hero / What S1P Is / Journey intro / Trust / CTA, Gallery hero / CTA).
2. **Centered text column**: Mission only (`mx-auto max-w-2xl`).
3. **Soft band**: the same text column on `bg-cream-soft` (Impact, Origin, About Impact, both CTAs).
4. **Split**: Hero (`1.1fr / 1fr`) and About Origin (`1fr / auto`), the only two two-column compositions.
5. **Hairline list**: FAQ, Trust info.
6. **Narrow task column**: Donation (`mx-auto max-w-xl`, form `max-w-sm`).

### 1.6 Motion / reveal conventions

- `useScrollReveal` → `.reveal` (opacity 0→1, `translateY(16px)`, 600ms expo-out), once, IntersectionObserver at 0.15. Used on nearly every heading block.
- Hero has its own staged `.hero-enter` (700ms, staggered delays). Donation steps use `.step-enter` (450ms).
- Hero SVG is the only ambient loop. All of it respects `prefers-reduced-motion`.
- _(Recorded for the boundary in §11 only. Not audited for change here.)_

### 1.7 Visual motifs already in the codebase

Everything graphic on the site is one family: **a solid red circle plus faint charcoal outline marks**.

| Asset                            | Geometry                                                                                           | Treatment         |
| -------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------- |
| `GatheringPoint` (hero)          | r=26 core, 5 outline dots (r 7–10, stroke 1.5, 0.45 opacity), 5 rim arcs (r=30, stroke 1.75, 0.32) | Animated          |
| `EchoMark` (Mission)             | r=10 core, 3 outline dots (stroke 1.25, 0.3)                                                       | Static, 64–80px   |
| `EightSlicesMark` (About Origin) | r=14 core, **8 evenly spaced rim arcs** (r=46, stroke 2, 0.32)                                     | Static, 160–192px |
| `JourneyTimeline` chart          | `red-deep` line 2.5px, `red` area at 0.12 opacity                                                  | Static data viz   |
| Favicon                          | cream square, red r=9 circle                                                                       | Static            |

Note that `EightSlicesMark` is already, geometrically, a pizza cut into eight. That reading is latent in the system but nothing on the page makes it explicit.

---

## 2. Problems identified

### P-1. Uniform section padding makes the page read as one repeating beat (system-level)

- **What exists:** One padding recipe, `py-20 md:py-28 lg:py-32`, on essentially every section, regardless of how much that section contains.
- **Why it's a problem:** Section weight and section spacing are decoupled. A 4-item FAQ hairline list, a 2-stat band, and a pull quote all get 128px above and below. Where two neighbours share a background, the visible gap is the _sum_ (see §3) and nothing marks the boundary except space.
- **Where:** Home: Hero→Mission, Donation→Testimonials→FAQ (all cream-on-cream). About: Hero→What S1P Is, Trust→CTA edges. Gallery: Hero→grid.

### P-2. Text-only `max-w-2xl` left-aligned blocks leave a dead right-hand third (system-level)

- **What exists:** 9 text blocks capped at 672px inside a 1120px content area, left-aligned, with nothing opposite them.
- **Why:** At ≥1024px roughly 450px (~40%) of the row is empty cream with no function. The eye has nothing to travel to, and the right side reads as "unfinished," not as margin. This is the most specific cause of the "empty rather than intentional" impression.
- **Where:** Home Impact heading; About hero, What S1P Is, Journey intro, Trust, CTA; Gallery hero and CTA. (Hero, Origin, and Donation are not affected: they have a counterweight or are intentionally centered.)

### P-3. Consecutive sections share one composition (system-level, worst on About)

- **What exists:** About's first two sections are the same recipe: cream, `max-w-2xl`, left, h1/h2 + paragraph(s) + small uppercase caption. They are separated by 256px of nothing. Later, Journey intro, Impact, Trust, and CTA repeat it.
- **Why:** The Mission section's own comment says it was made single-column "so the page doesn't repeat the same layout family back to back," but outside Hero and Origin nothing carries that thought through. About has two split compositions out of eight sections.
- **Where:** About (strongest), Gallery (hero and CTA are the same block), Home Testimonials→FAQ (both full-width left-aligned lists under an h2).

### P-4. Inconsistent alignment axes (section-specific, Home)

- **What exists:** Mission is `mx-auto` centered in the container (text column starts ~260px from the left edge at 1440). Impact, Testimonials, FAQ, and Donation headings start at the container's left edge or center again (Donation).
- **Why:** The reader's left edge jumps container-edge → centered → container-edge → centered. It isn't a deliberate alternation because nothing visibly justifies the centered Mission column (its supporting `EchoMark` is 64–80px and sits inline with the pull quote, not anchoring the column).
- **Where:** Mission vs Impact / Testimonials / FAQ; Donation `max-w-xl` centered.

### P-5. Visual identity is carried by a single 5-element motif, used at very different scales with no connective tissue (system-level)

- **What exists:** Hero (420px, animated), EchoMark (≤80px), EightSlices (≤192px). Between them there are zero graphic elements: no dividers, no section marks, no backgrounds, no illustration.
- **Why:** The motif is coherent but sparse. Whole viewports, especially Impact, Testimonials, FAQ, Trust, and Gallery's header, contain only type on flat cream/peach, which is where the impression of "too plain / too much whitespace" becomes more than a spacing issue.
- **Where:** Everything after the Hero on Home; About sections 1, 2, 4, 5, 6, 7.

### P-6. Red is the only chromatic voice, and its hover state changes character (system-level + Button)

- **What exists:** `Button` rests at `red-deep #c92c3a` and hovers to `red-darkest #9f232e`, with a `rgba(159,35,46,.55)` glow. `:focus-visible`, text-link hover, active testimonial dot, and the error text all use red too.
- **Why:** `#9f232e` is a perceptibly brown-maroon shift, which is the "dark maroon on hover" you flagged. The glow is derived from the same maroon, so the whole hover reads as a different color rather than the same red under light. And since red is also the _error_ color (`red-deep`, form errors) and the focus ring, the brand voice, the alert voice, and the interaction voice are all one hue.
- **Where:** `src/components/ui/Button.tsx` (single definition, so one fix covers Header, Hero, Donation, About CTA, Gallery CTA); admin dashboard filter buttons reuse the same tokens.

### P-7. The two supporting colors are effectively absent, and one is unsafe as defined (system-level)

- **What exists:** `orange` is unused. `green #2ecc71` has one public use (the copy-confirmation check).
- **Why it matters beyond "add more color":** `#2ecc71` on cream computes to roughly **2:1** (hand-computed, verify with tooling). That's below the 3:1 non-text minimum CLAUDE.md §3 applies to icons, so the existing "Copied ✓" icon is already under-contrast. The token cannot be used for anything meaningful as-is, which is part of why green never appears.
- **Where:** `index.css` token; `CopyUpiButton.tsx`.

### P-8. Data is shown but not given visual weight (section-specific)

- **What exists:** Impact (Home) and the About impact band render numbers as `text-4xl/5xl` charcoal text. About's two stats sit in a `max-w-xl` grid, so on a ~1120px content area the numbers occupy about half the width of a full `cream-soft` band.
- **Why:** The two figures the About page leads with (₹29L+, 55+ students) are the page's strongest proof but have the same visual presence as a heading. The `JourneyTimeline` chart is the one place data is drawn, and it is `md:max-w-3xl` (768px), also leaving the right of the page empty.
- **Where:** Impact, About "What It's Added Up To", Journey.

### P-9. Gallery has no framing of its own (section-specific)

- **What exists:** A text hero (`py-32`), then the grid starts with zero top padding (`pb-` only), then a peach CTA band. Loading is eight `animate-pulse` squares; empty is a generic `ImageBroken` icon on a `cream-soft` rounded box.
- **Why:** Until real photos exist (and with few of them), the page is a title, a gray-ish block, and a banner. The empty state, which is what a visitor sees today, uses a system icon with no connection to the brand. Note that `animate-pulse` is a looping animation outside the hero, which conflicts with §3's motion rule; that's a 4B item, flagged in §11.
- **Where:** `GalleryPage.tsx`, `GalleryGrid.tsx`.

### P-10. Testimonials and FAQ are structurally unbranded (section-specific)

- **What exists:** Testimonials: two plain `font-display` quotes with straight curly quotes, 44px dot buttons. FAQ: hairline list with a Plus icon.
- **Why:** These are the two sections where a person would most expect warmth (voices) and reassurance (questions), and they're the plainest on the page. They share the Home page's last 40% with no change of background, density, or composition between them.
- **Where:** Home only.

---

## 3. Whitespace audit

### 3.1 Computed gaps (content-to-content, bottom padding of one section + top padding of the next)

| Boundary                       | Mobile  | md       | lg       | Same background?  |
| ------------------------------ | ------- | -------- | -------- | ----------------- |
| Home: Hero → Mission           | 160     | 224      | **256**  | yes (cream/cream) |
| Home: Mission → Impact         | 160     | 224      | 256      | no (band edge)    |
| Home: Impact → Donation        | 160     | 224      | 256      | no                |
| Home: Donation → Testimonials  | 160     | 224      | **256**  | yes               |
| Home: Testimonials → FAQ       | 160     | 224      | **256**  | yes               |
| Home: FAQ → Footer             | 80 + 56 | 112 + 64 | 128 + 64 | border line       |
| About: Hero → What S1P Is      | 160     | 224      | **256**  | yes               |
| About: Origin → Why Education  | 80 + 64 | 112 + 80 | 128 + 80 | no                |
| About: Why Education → Journey | 64 + 80 | 80 + 112 | 80 + 128 | yes               |
| Gallery: Hero → Grid           | 80      | 112      | **128**  | yes               |

The five **256px cream-on-cream** gaps are the problem spots. The same number is fine where a background change already marks the edge.

### 3.2 Whitespace that is intentional and should stay

- **Hero `lg:py-32` and its text column.** The hero is the one place where a big quiet field supports the signature animation.
- **Line lengths** (`max-w-[46ch]`/`[52ch]`) and `leading-relaxed` body. These are what make the type feel editorial; reducing them would be a regression.
- **Mission's generous padding around the pull quote**, as long as it gets an anchor (see §6).
- **Donation's narrow column.** A focused task area should be narrow. The surrounding emptiness is the issue, not the column.
- **`Why Education`'s smaller padding (`py-16 md:py-20`).** This is the only section where padding was already tuned to content weight, and it works as a pause beat between two denser sections. This is the model to copy, not correct.
- **Hairline list rhythm in FAQ/Trust** (`py-5 md:py-6`).

### 3.3 Excessive spacing

- The five 256px cream-on-cream gaps in 3.1. These are the gaps that create "section → whitespace → section."
- Gallery hero's 128px bottom padding before a grid that, when empty, is itself a mostly-blank box.
- Footer is fine.

### 3.4 Sections that feel empty (because of composition, not padding)

| Section                | Why it reads empty                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| About hero             | h1 + 2 paragraphs + caption in the left 60%; nothing opposite at lg                                                            |
| About What S1P Is      | One paragraph + caption in the left 60%                                                                                        |
| About Trust            | `max-w-2xl` dl; right 40% blank                                                                                                |
| Gallery hero           | h1 + one sentence in the left 60%                                                                                              |
| Home Impact            | 4 stats across the width but no marker of what they _are_                                                                      |
| Home Testimonials      | Two quotes + dots; no portrait/mark/anchor, so quotes float                                                                    |
| Donation (amount step) | `max-w-sm` form inside `max-w-xl` inside a 1120px content area, so a lot of cream either side, and the step has no side visual |

### 3.5 Repeated patterns to break

1. Same h2 class + muted paragraph + `mt-14 / mt-16` gap into the content (Impact, About Impact, Journey).
2. `max-w-2xl` left + empty right.
3. `bg-cream-soft` used both as "alternate band" and as "highlight/inset" with no distinction between those two meanings.

### 3.6 Visual-anchor opportunities (where something should sit opposite a text column)

About hero; About What S1P Is (pairs with Origin's existing mark); Trust (a seal/stamp-like mark is a literal fit for a "registered trust" block); Gallery hero; Testimonials; Impact; Donation side column on ≥lg. Each is developed in §6–7.

**Rule applied:** reduce dead space by giving it a job (an anchor, a different composition, a band change), not by uniformly cutting padding. Where padding is cut, it's only to the cream-on-cream 256px gaps, and only after an anchor or band change has taken over the "separator" role.

---

## 4. Color system proposal

**Principle:** red stays the brand. Green and yellow are _supporting_, tied to meaning (growth/education, warmth/the pizza itself), not decoration. All values below are **proposals, hand-calculated against `#fff8f2`; verify with tooling before adoption.**

### 4.1 Red (existing, behavior change only)

| Item                       | Proposal                                                                                                                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resting fill               | Unchanged: `red-deep #c92c3a` (white-on-red 5.38:1, per existing decision)                                                                                                                                 |
| Hover                      | **Decided (D3a): fill stays exactly `red-deep` `#c92c3a`.** Hover = the existing 2px lift + a red-hued shadow (`rgba(201,44,58,…)`, replacing today's maroon `rgba(159,35,46,…)`). No fill change on hover |
| Active/pressed             | `red-darkest #9f232e` on `:active` only. Today `Button` applies it on hover and defines no pressed fill, so this is an addition                                                                            |
| Where red appears          | Primary CTAs, focus ring, hero/mark cores, active states, chart line                                                                                                                                       |
| Where it should NOT appear | Decorative bands, large backgrounds, secondary buttons                                                                                                                                                     |
| Separation from error      | Errors currently share `red-deep`. Keep, but note that adding green/yellow means success/warn states stop having to borrow red or sit alone.                                                               |

### 4.2 Green: "growth / education / outcome"

**Status: approved (D5).** `green-deep ≈ #2F7D4F` + pale tint. `#2ecc71` is reserved for success-state fills only. Green may be the single secondary accent inside an illustration (I3). Exact hex values are finalised with a computed contrast check at implementation; the figures below are hand estimates.

| Role                | Detail                                                                                                                                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Semantic            | The basil on the pizza; the student's outcome; success                                                                                                                                                                                                         |
| Proposed values     | **`green-deep ≈ #2F7D4F`** (text/line/icon safe, ~4.7:1 on cream) and **`green-tint ≈ #E6F1E8`** (surface only). The existing `#2ecc71` stays reserved for success _fills_ with dark/white-bordered content; it fails as an icon or text color on cream (~2:1) |
| Frequency           | ~20% of accent use. Never more than one green element per viewport                                                                                                                                                                                             |
| Where               | Impact outcome markers (students, meals); the "after" state in any before/after metaphor; success/copied confirmations; a single leaf/basil detail inside illustrations; Trust "registered" stamp ring                                                         |
| NOT                 | Buttons, links, headings, body text, large backgrounds, anything that implies "go / safe to pay" near payment fields                                                                                                                                           |
| Relationship to red | Complementary: red = _act_, green = _result_. They shouldn't touch on the same element.                                                                                                                                                                        |

### 4.3 Yellow: "warmth / the shared meal / highlight"

**Status: approved (D6).** `yellow ≈ #F2B632` + pale tint; fill/surface only, never text. Testimonials gets the one yellow-tinted band. Yellow may be the single secondary accent inside an illustration (I3). Exact hex finalised with a computed contrast check at implementation.

| Role                | Detail                                                                                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Semantic            | Melted cheese; warmth; a highlight on a human moment                                                                                                                                                                                 |
| Proposed values     | **`yellow ≈ #F2B632`** (fill only) and **`yellow-tint ≈ #FBEFC8`** (surface). Yellow on cream is ~1.7:1, so **never** text, never a lone border, never the only carrier of meaning. Text on yellow fills: charcoal (~9:1)            |
| Frequency           | ~10% of accent use, the rarest color. At most one yellow element per section                                                                                                                                                         |
| Where               | The one "highlight" fill inside an illustration; a quote-mark or underline accent under a testimonial; one band (Testimonials) as `yellow-tint` in place of `cream-soft`; **not** on the EightSlicesMark, which stays unchanged (I5) |
| NOT                 | Text, icons on cream, buttons, error/warn semantics, backgrounds behind white text                                                                                                                                                   |
| Relationship to red | Analogous warm neighbor. Red-core-with-yellow-highlight reads as sauce + cheese without any literal pizza clip-art                                                                                                                   |

### 4.4 Orange

**Decided (D4): retire.** `--color-orange` is defined in `src/styles/index.css` and referenced nowhere else (verified by grep). Remove it; do not introduce another use for orange.

### 4.5 Surfaces

Keep `cream` as the base and `cream-soft` as the default band. Add at most two tinted bands (`green-tint`, `yellow-tint`), each used for one section on a page, not alternated.

---

## 5. Illustration language

> **Revision 2 (references reviewed).** This section replaces the first draft, which was written without the references. §5.6 lists exactly what changed and why. **Revision 3:** decisions I1–I8 are now locked; see §5.7. Wherever earlier text said "recommended," "by default," or "pending decision" for an illustration question, it has been updated to the locked outcome.

### 5.1 What the four references actually are

These are four different sources, not one system. I extracted what they share and noted where one is an outlier.

| #   | Reference                                                                                | Key traits                                                                                                                                 |
| --- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | Indigo handshake through two "windows," dashed orbit circle, envelopes, pencils, scales  | Navy outline, one blue fill, scattered hollow circles and short tick marks, thin dashed ring                                               |
| R2  | Three people in speech bubbles                                                           | Same navy outline; flat yellow / blue / teal blocks sitting **offset** from the contour; confetti triangle, pentagon, dots                 |
| R3  | Sheet of ten concept spots (trophy, handshake, book, shield, hourglass, gears, headset…) | Black outline, white-filled figures, flat yellow / blue / pink / red blocks **misregistered behind** the linework, tiny sparkles and ticks |
| R4  | Single avatar: peach background, purple sweater, salmon skin, black hair                 | **No outline**, solid organic fills, line only for facial features                                                                         |

**R4 is the outlier** and I recommend not adopting it. It is a filled-shape avatar style, which is the generic profile-picture look. The other three are line-led and share a method.

#### 1. Overall style

- **Geometric vs organic:** hybrid. Containers and props are geometric (rectangles, circles, wedges); bodies and hands are organic, with large simplified limbs. R4 is fully organic.
- **Hand-drawn vs clean vector:** clean vector with slightly exaggerated proportions. Nothing looks hand-inked; there is no wobble.
- **Playful vs sophisticated:** friendly and light, but controlled. R3 is the most sophisticated (tight palette, concept-led); R2 is the most playful.
- **Flat vs dimensional:** flat. Depth comes only from overlap and the offset color blocks, never shading.
- **Editorial vs decorative:** editorial. Each image states one idea (agreement, connection, time, security). This is the right instinct for S1P.

#### 2. Shape language

Rounded rectangles and speech-bubble frames used as **windows people reach out of**; circles; short wedges and triangles as confetti; oversized hands; asymmetric clusters of overlapping panels. Recurring forms: the **frame/window**, the **hand**, **hollow circles and tick marks** scattered around the subject, and a **single dashed ring** (R1).

#### 3. Line treatment

One consistent outline weight per image, dark, full strength, round joins. Outlines are prominent: they carry the drawing. Color never carries a contour on its own. Secondary marks (ticks, sparkles) use a thinner line or an accent color.

#### 4. Color treatment

- **Count:** 1 accent (R1), 3 accents (R2), 3 to 4 plus black (R3). Never more than four.
- **Distribution:** accents appear as large flat blocks behind the line art, plus tiny matching ticks and dots. One block usually dominates; the others are smaller.
- **The technique that makes it recognisable:** the color shape is **not registered to the outline.** It is shifted, cropped by a different rectangle, or a plain geometric shape sitting behind a hand or object (the yellow disc behind the fist in R2; the yellow and pink panels in R3).
- **Skin and clothing are mostly left unfilled** (white) in R2 and R3. This avoids committing to skin tones and keeps the focus on the accent blocks.
- **Palette fit:** the references' blue / teal / pink / purple are not in S1P's system and should not be imported. The method transfers; the hues don't.

#### 5. Texture

Flat everywhere. No grain, paper texture, roughness, or deliberate imperfection. The only "imperfection" is the offset of the color blocks. Texture is **ruled out** (I7).

#### 6. Composition

Spot illustrations: one cluster, floating, with generous air, framed or unframed. Subjects interlock by overlap (hand through window, panel over panel). Density is **moderate**: roughly 3 to 6 meaningful elements plus 5 to 12 tiny ticks/dots. They stand beside content or alone, not behind text.

#### 7. Subject matter

People (often cropped to head, torso and hands), hands doing something (shaking, holding, offering, writing), and symbolic props (envelope, pencil, book, key, shield, hourglass, scales, gears, trophy). Roughly half the props are SaaS/business tropes (security shield, gears, chart, envelope), which are exactly the "generic SaaS decoration" the brief says to avoid.

**For S1P specifically:**

| Subject                                                                                                                    | Verdict                                                     | Why                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Hands (giving, holding, passing, writing)                                                                                  | **Adopt**                                                   | Carries the giving gesture without needing a face. All four references lean on hands or bodies            |
| Pizza as a circle cut into wedges; a single wedge handed over                                                              | **Adopt, core subject**                                     | The actual brand idea ("sacrifice one pizza") and already latent in `EightSlicesMark`                     |
| The eight objects from the origin story (dress, sweets, temple offering, bus fare, doll, bangles, a gift, school supplies) | **Permitted, optional (I5).** Separate from EightSlicesMark | A real, specific, culturally grounded story from the About copy (`aboutData.ts`); props instead of people |
| Education props (book, notebook, pencil, school bag)                                                                       | **Adopt**                                                   | The trust funds education; R1 and R3 already use these                                                    |
| Rupee coin / phone-with-tick                                                                                               | **Adopt cautiously**                                        | Relevant to the donation flow; must not imply payment verification (CLAUDE.md §12)                        |
| Frames/windows                                                                                                             | **Adopt as a device**                                       | Also solves "where does the illustration end" without a background                                        |
| Full cartoon characters with faces, as a recurring cast                                                                    | **Do not adopt (I1)**                                       | See §5.2. Dignity, authenticity, and "stock illustration" risk                                            |
| Beneficiary students or children depicted                                                                                  | **Do not adopt**                                            | Conflicts with the project's no-poverty-imagery, no-guilt stance                                          |
| Shields, keys, gears, envelopes, dashboards, scales                                                                        | **Do not adopt**                                            | Generic SaaS/enterprise tropes                                                                            |
| R4-style filled avatars                                                                                                    | **Do not adopt**                                            | Different style family; reads as a profile picture                                                        |

### 5.2 Relationship to the existing S1P visual language

#### What lines up (can be adopted without the site feeling like a different brand)

- **Hollow circles and short tick marks.** R1 and R2 scatter small outline circles and dashes around the subject. S1P's hero is already "outline circles around a solid core." This is the strongest bridge: the same vocabulary, used decoratively in the references and semantically in ours.
- **A dashed ring** (R1) is close to what the hero's orbiting dots imply.
- **Outline plus flat fill, no gradients, no shading**, which matches the site's rules.
- **One dominant solid shape.** Our red core corresponds to the dominant color block in each reference.
- **Wedge geometry.** The references' triangles and slices are the same family as our rim arcs.
- **Editorial intent:** one idea per image.

#### What differs, and how to resolve it

| Difference       | References              | S1P today                           | Resolution                                                                                                                                  |
| ---------------- | ----------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Outline strength | Full-strength dark line | Charcoal at **0.3 to 0.45 opacity** | Two tiers (§5.3): existing abstract marks stay quiet; new spot illustrations use a full-strength charcoal line. They never share a viewport |
| Detail           | 20+ paths per image     | ≤ 11 shapes                         | Marks stay minimal; spot illustrations get moderate detail                                                                                  |
| Color count      | 3 to 4 hues             | 1 (red)                             | Cap spot illustrations at charcoal + red + one of green/yellow                                                                              |
| People           | Faces and bodies        | None                                | Hands and props only; no faces or figures (I1)                                                                                              |
| Outline color    | Navy / black            | `#1d1d1f`                           | Use charcoal. Never navy or pure black                                                                                                      |
| Overall mood     | SaaS/startup friendly   | Warm editorial                      | Real risk; see below                                                                                                                        |

#### Risk to name plainly

Used wholesale, these references would make S1P look like a software product's onboarding page. The elements that cause that are the cartoon cast, the blue/teal/pink palette, and the business props. The elements worth taking are the offset color-block technique, the confetti ticks, the hands, and the window device. **Adopt the technique, not the cast.**

#### Typography

Outfit's geometric rounds already harmonise with the references' round line caps. Illustrations should contain no lettering at all (R3's "DEL" and numerals are what I'd copy least).

### 5.3 Illustration specification

There are two tiers. This matters for coherence: the site keeps its quiet abstract marks and gains a second, richer tier only where the story needs objects.

|                 | **Tier A: Marks** (existing)                                                                               | **Tier B: Spot illustrations** (new, 4C)                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Examples        | Hero, EchoMark, EightSlicesMark; proposed seal ring, stat marks, About hero mark, Gallery empty-state mark | Closing-band illustration (hand passing a pizza wedge); optional eight origin-story objects                |
| Job             | Identity, data, orientation                                                                                | Story, concept, emotional moment                                                                           |
| Level of detail | ≤ ~11 shapes                                                                                               | ~3 to 6 elements + 5 to 12 ticks/dots                                                                      |
| Line            | Charcoal 1.25 to 2.5, **0.3 to 0.45 opacity**                                                              | Charcoal `#1d1d1f`, **full opacity**, one weight per image (≈2px at a 400px viewBox), round caps and joins |
| Fill            | One solid red core                                                                                         | Unfilled/cream figures + 1 to 2 flat offset color blocks                                                   |
| Max per page    | Unlimited, small                                                                                           | **3 to 4 (I8), never two in the same viewport.** Currently planned: 0 to 2 per page (§5.7)                 |

**Visual style:** flat, clean vector, editorial, friendly but restrained. No lettering.

**Shape language:** wedges and arcs (from the site), rounded rectangles as frames/windows, oversized simplified hands, hollow circles, short ticks. Figures and faces are not used: hands and props only (I1).

**Stroke language (Tier B):** single weight per illustration, full-strength charcoal, round caps and joins, no variable-width strokes, no outline-less shapes (R4-style is out). Accent ticks may use the accent color.

**Color rules (Tier B):**

- Maximum **three** colors including charcoal: charcoal + **red** + at most one of **green** or **yellow** (I3, locked: never both).
- Color appears **only as flat blocks behind the line art, offset roughly 6 to 10% from the contour**, plus tick/dot accents. Never as a contour.
- Red is the dominant block (or the focal object such as the wedge). Yellow is cheese/warmth; green is growth/education, per §4.
- No blue, teal, pink, purple, navy. No gradients; tints only if §4's tint tokens are approved, and only as the offset block.
- Hands are left cream or unfilled; skin tone is never colored.

**Texture rules:** none. Flat color only. Ruled out across the site, for illustrations and bands alike (I7).

**Composition rules:**

- One focal cluster, asymmetric, with ≥ ~40% empty bounding-box area (relaxed from ≥ 50% in the first draft; the references are denser than the abstract marks).
- Sits in its own grid track beside text, or alone in a band. **Never behind or under text.**
- Uses a frame, window, or hairline edge to terminate the art; no floating clutter.
- 160 to 420px on desktop; scales down by dropping ticks first.
- Static (motion is 4B).

**Acceptable subjects:** hands; pizza wedges and the eight-slice ring; the eight origin-story objects; education props; a coin or phone-with-tick (donation context only); frames/windows; green sprout; ticks, hollow circles, confetti triangles.

**Unacceptable:** recurring cartoon cast; beneficiary or child depictions; poverty imagery; SaaS props (shields, keys, gears, dashboards, envelopes); R4-style filled avatars; clip-art pepperoni or food photography; anything with lettering; faces or figures of any kind (I1).

**Recommended level of detail:** the "160px test." If the idea is unreadable at 160px wide, remove elements until it reads.

### 5.4 When an illustration is allowed (rule kept, extended)

**Kept:** the removal test. If deleting it loses nothing except visual fullness, it should not exist.

An illustration is justified when it does **at least one** of:

1. **Explains an idea:** makes a concept physical (one pizza → one gift).
2. **Visualizes a story:** depicts a beat that is already in the copy (the eight things).
3. **Represents a concept:** collective effort, many small → one.
4. **Supports a data point:** encodes a figure rather than echoing it.
5. **Creates a meaningful transition:** marks a chapter change or the end of a page.
6. **Establishes orientation:** tells the reader what kind of content this is (the trust seal; an empty state).
7. **Reinforces S1P identity:** carries the core/outline/wedge vocabulary (Tier A only).

…and **all** of these hold:

- **Removal test:** removing it loses meaning or orientation, not just density.
- **Vocabulary test:** it contains at least one existing S1P motif (red core, outline circles, arc/wedge). This is what stops Tier B drifting into a different brand.
- **Spacing test:** no other illustration within one viewport.
- **Tier test:** Tier B only when objects or gesture are needed to say the thing. If an abstract mark can say it, use Tier A.
- **Cost test:** static SVG, no new dependency, `aria-hidden` unless it carries information.
- **Budget test (I8):** at most 3 to 4 spot illustrations per page, and never two within one viewport. Check this at mobile widths too, where stacked layouts shrink the scroll distance between sections.
- **Order of operations:** fix composition and spacing first (§6, §8). Add art only if the section still fails the tests.

"The section looks empty" does **not** qualify on its own.

### 5.5 Effect on the rest of the audit (applied in rev. 3)

§6 and §7 were updated to match the locked decisions (listed in §5.7). The tier for each item is now:

| Item in §6/§7                 | Likely tier                                                                |
| ----------------------------- | -------------------------------------------------------------------------- |
| Mission scaled mark           | A                                                                          |
| Impact stat marks             | A                                                                          |
| Trust seal ring               | A                                                                          |
| Eight-slice chapter marks     | A                                                                          |
| Origin Story: EightSlicesMark | A, **kept unchanged (I5)**                                                 |
| Eight origin-story objects    | B, **optional**, separate from the mark, **Origin section only** (I5, D13) |
| About hero                    | **A (I4, locked)**                                                         |
| Testimonials quote anchor     | A                                                                          |
| Closing band (About, Gallery) | B (a hand passing a wedge is the natural subject)                          |
| Gallery empty state           | **A** (approved, D12: keeps the Gallery within I8)                         |

I have not re-ranked priorities. Tier B items cost more than Tier A and should probably follow them within 4C.

### 5.6 What changed from the first draft of §5, and why

| First draft                                                                    | Revised                                                                                     | Reason                                                                                                                                                                                      |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Avoid faces and hands"                                                        | **Hands adopted; faces not by default**                                                     | The references lean on hands, and a hand is the most direct way to show giving without depicting a recipient. The blanket ban on hands was wrong                                            |
| Charcoal outlines at low opacity everywhere                                    | **Two tiers.** Low-opacity for existing marks; full-strength for new spot illustrations     | The references get their character from strong lines. Faint lines would make them look like sketches, but raising the hero to full strength would break Phase 1. Two tiers keep both honest |
| "One solid fill (red) … at most one secondary fill"                            | **Flat, offset color blocks behind the line art; max charcoal + red + one of green/yellow** | The offset block is the defining technique in R2 and R3 and works within a restricted palette                                                                                               |
| Detail ≤ ~11 shapes                                                            | Tier A unchanged; Tier B ~3 to 6 elements + ticks                                           | Honest about the references' density                                                                                                                                                        |
| ≥ 50% empty                                                                    | ≥ ~40% for Tier B                                                                           | Same reason                                                                                                                                                                                 |
| Texture "none by default" with grain left open                                 | **None**; leans toward D10 = ruled out                                                      | All references are flat                                                                                                                                                                     |
| Subjects described loosely                                                     | Table in §5.1.7 with verdicts                                                               | You asked for this                                                                                                                                                                          |
| Eight-slice ring as a chapter mark only                                        | **Eight origin-story objects added as a Tier B subject**                                    | The About copy lists them; they are the most authentic S1P subject found                                                                                                                    |
| Rule listed 5 roles                                                            | 7 roles, adding "explains an idea" and "identity"                                           | Matches your list                                                                                                                                                                           |
| Rule said "build from the existing shape family, with at most one new element" | Replaced by the **vocabulary test** (must contain at least one existing motif)              | Looser on shapes, because Tier B needs hands and props, but still anchors every piece to the brand                                                                                          |

**Unchanged:** the removal test, the "fix layout first" principle, no gradients/blobs/stock imagery, static in 4A/4C, `aria-hidden` by default, and the 4A/4B/4C/4D boundaries in §11.

### 5.7 Locked illustration decisions (I1–I8)

| #   | Decision (locked)                                                                                            | How it is applied in this document                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I1  | Hands and props only. No recurring characters, no faces                                                      | §5.1 subject table, §5.3 unacceptable list                                                                                                                                                                              |
| I2  | Two tiers: quiet existing marks (A) + full-line spot illustrations (B)                                       | §5.3 tier table; §5.5 assigns every item a tier                                                                                                                                                                         |
| I3  | Charcoal + red + at most **one** secondary accent (green **or** yellow) per illustration                     | §5.3 color rules. Note: this binds illustrations, not page-level use of green/yellow tokens (§4)                                                                                                                        |
| I4  | About hero stays a quiet existing-style mark (Tier A)                                                        | §6 About hero row; answers D9                                                                                                                                                                                           |
| I5  | Keep EightSlicesMark, do not replace it. The eight objects may be used separately in the Journey/origin area | EightSlicesMark is unchanged (no recolor, no highlighted arc). Per D13: **one optional** Tier B composition of the objects, planned for 4C in the **Origin section** (not Journey), alongside, not instead of, the mark |
| I6  | Phase 1 hero untouched                                                                                       | §6 Hero row, §9                                                                                                                                                                                                         |
| I7  | No grain or texture                                                                                          | §5.3, §7 item 10, §10 item 17 removed; answers D10                                                                                                                                                                      |
| I8  | Max 3 to 4 spot illustrations per page; never two in one viewport                                            | §5.4 budget test; per-page plan below                                                                                                                                                                                   |

**Judgment calls I made in applying these (tell me if any is wrong):**

1. **I5 read strictly.** "Keep EightSlicesMark" means _unchanged_. I therefore removed two earlier ideas that edited it: the highlighted yellow arc (§4.3, §6) and reusing the full eight-arc ring in the About hero (§7 item 2). The full ring now appears only in Origin.
2. **I4 mark must differ from the ring.** The About hero's quiet mark should use the hero's core-plus-scattered-outline-dots vocabulary, not eight arcs, so the two About sections don't repeat each other.
3. **I8 counts Tier B only.** Tier A marks don't count toward the budget, but they still shouldn't be stacked so densely that the page feels busy.
4. **Gallery empty state moved to Tier A** (approved, D12), because it sits close to the closing band and would otherwise put two spot illustrations in the same viewport.

**Per-page spot-illustration plan (I8):**

| Page    | Tier B planned                                            | Tier A planned                                                               | Within budget?                                        |
| ------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| Home    | 0                                                         | Hero (untouched), Mission mark, Impact stat marks, Testimonials quote anchor | Yes (0 of 3 to 4)                                     |
| About   | Closing band (1) + optional eight objects (1) = at most 2 | Hero mark, EightSlicesMark (unchanged), Trust seal                           | Yes. The two Tier B pieces are several sections apart |
| Gallery | Closing band (1)                                          | Hero mark, empty-state mark                                                  | Yes (with D12)                                        |

---

## 6. Section-by-section visual map

Priority is by impact on identified problems P-1…P-10, not by taste.

### Home

| Section          | Current composition                                                   | Visual issue                                                                                | Proposed direction                                                                                                                                                                                                 | Illustration justified?                                                                                                        | Possible role                                      | Accent                                              | Priority         |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | --------------------------------------------------- | ---------------- |
| **Header**       | Transparent → `cream/90` sticky bar, text nav, red pill CTA           | Fine structurally; CTA hover is the maroon issue (P-6)                                      | No structural change                                                                                                                                                                                               | No                                                                                                                             | —                                                  | Red (CTA)                                           | P0 (CTA only)    |
| **Hero**         | Split text / animated mark, `py-32`                                   | None. Locked per Phase 1.                                                                   | Leave. Only the Button hover changes                                                                                                                                                                               | Already has one                                                                                                                | —                                                  | Red                                                 | P0 (button only) |
| **Mission**      | Centered `max-w-2xl`; h2, paragraph, pull quote with 64–80px EchoMark | Isolated centered axis (P-4), 256px cream gap from Hero (P-1); EchoMark too small to anchor | Left-align to the container axis; make the pull quote a distinct beat (larger, with the mark at real scale on the opposite track at lg)                                                                            | **Yes: Concept** (many small marks → one gift; extends the existing EchoMark, no new language)                                 | Scaled-up static EchoMark as the right-hand anchor | Red core, optional single yellow dot                | P0               |
| **Impact**       | `cream-soft` band; h2 + paragraph + 4 stats                           | Stats are only text; no signal of what the numbers are (P-8)                                | Keep band; give each stat a marker and group them as one data unit; introduce green for outcome stats                                                                                                              | **Yes: Data**, small stat marks (e.g. wedge/arc proportion marks) that echo slices                                             | Per-stat glyph                                     | Green (outcomes), red (raised)                      | P1               |
| **Donation**     | Narrow centered column, steps swap in place                           | Large empty margins at ≥lg (3.4); text-only                                                 | Keep the narrow task column; place a quiet two-track layout at ≥lg (context/reassurance on one side) or contain the form in a bordered surface so the column reads as a deliberate "panel"                         | Maybe: **Orientation** (step progress shown as slice marks). **Only** if the step indicator is judged functional; otherwise no | Slice-based step indicator                         | Red (action), green (success step)                  | P1               |
| **Testimonials** | Plain text, 2-up                                                      | No anchor, no warmth, same bg as neighbors (P-10)                                           | Swap band to `yellow-tint` (single use), enlarge first quote as lead, small mark beside attribution                                                                                                                | **Yes: Emotional moment**, a quote mark built from the motif (outline circle + solid core)                                     | Quote anchor                                       | Yellow (band + one accent), red (dot)               | P1               |
| **FAQ**          | Hairline accordion                                                    | Dense and fine, but identical bg/padding as Testimonials (P-1)                              | Deliberately the _dense, utilitarian_ beat: tighter vertical padding, two-column heading + list at lg (heading/context left, list right; stacked below lg, per D8) so it stops being full-width centered-left text | No. A heading + list needs composition, not art                                                                                | —                                                  | None (green only if "answered" state is ever shown) | P1               |
| **Footer**       | Border-top, 2 columns, text                                           | Plain but appropriate                                                                       | Optional closing mark (hero core at tiny scale) as a signature                                                                                                                                                     | Marginal: **Orientation**/signature                                                                                            | Single small mark                                  | Red                                                 | P2               |

### About

| Section            | Current                                  | Issue                                                         | Direction                                                                                                                  | Illustration?                                                                  | Role                                                                                                                               | Accent                                          | Priority              |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------- |
| **Hero**           | h1 + 2 paras + caption, `max-w-2xl` left | Dead right 40%, same as next section (P-2, P-3)               | Make it a split like the home hero but static; opposite track holds a mark                                                 | **Tier A mark only (I4).** Orientation/identity                                | Quiet static mark in the hero's vocabulary (core + outline dots). Must not repeat the eight-arc ring, which stays unique to Origin | Red core; no secondary accent needed            | P0                    |
| **What S1P Is**    | Same text recipe                         | Duplicate of hero composition, 256px gap (P-1, P-3)           | Compact into a tighter statement beat or merge visually with hero; shrink padding on this boundary only                    | No                                                                             | —                                                                                                                                  | None                                            | P0                    |
| **Origin Story**   | `cream-soft`, split with EightSlicesMark | Good. The strongest composition on the site                   | **Keep unchanged (I5).** EightSlicesMark is not replaced, recolored, or re-weighted                                        | **Already justified: Story** (Tier A, existing)                                | Existing mark. One optional, separate Tier B eight-objects composition is planned for 4C in this section (D13, §5.7)               | No change                                       | n/a (4C optional: P2) |
| **Why Education**  | Pull quote, `py-16/20`                   | Works as a pause beat                                         | Leave padding; it's the model                                                                                              | No                                                                             | —                                                                                                                                  | None                                            | P2                    |
| **Journey**        | Chart `max-w-3xl`, text                  | Right 1/3 empty; chart is the only data viz on the site (P-8) | Use full 12-col width: chart + callouts side by side at lg; green for "students/outcomes" if a second series is ever shown | Chart **is** the Data illustration; no extra art                               | Chart annotation                                                                                                                   | Red line stays; green only for a secondary mark | P1                    |
| **Impact (About)** | `cream-soft`, 2 stats in `max-w-xl`      | Strongest proof, weakest presence (P-8)                       | Make the two figures the visual center (very large numerals, wide)                                                         | Possibly **Data** marks, only if they encode a proportion                      | —                                                                                                                                  | Green (students), red (rupees)                  | P1                    |
| **Trust**          | dl in `max-w-2xl`                        | Dead right side (P-2)                                         | Two-track: dl left, registered-trust "seal" mark right                                                                     | **Yes: Orientation/trust**, a stamp-like ring from the existing arc vocabulary | Seal                                                                                                                               | Green-deep ring (trust/legitimacy)              | P1                    |
| **CTA**            | `cream-soft`, `max-w-xl` left            | Same as Gallery CTA; ends the page with a text box            | Shared closing-band component with a mark and the button                                                                   | **Yes: Transition** (closing beat), **Tier B**                                 | Closing illustration: a hand passing a pizza wedge (hands and props only)                                                          | Red + at most one of yellow/green (I3)          | P1                    |

### Gallery

| Section  | Current                                           | Issue                                               | Direction                                                                                      | Illustration?                                                                         | Role                                                   | Accent            | Priority |
| -------- | ------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------- | -------- |
| **Hero** | Text only                                         | Empty header (P-9)                                  | Two-track like About hero; shares the same header component                                    | Maybe: **Orientation**; Tier A only                                                   | Small mark                                             | Red               | P1       |
| **Grid** | Square tiles, skeleton, `ImageBroken` empty state | Empty state is generic and is what visitors see now | Replace the system icon with an on-brand empty state; add the missing top spacing deliberately | **Yes: Emotional moment** (empty state), **Tier A** so the page stays within I8 (D12) | Empty-state mark (core + outline dots, "on their way") | Yellow tint panel | P1       |
| **CTA**  | Same as About CTA                                 | Duplicate                                           | Share the closing band                                                                         | Shared (Tier B, same component as About; one per page)                                |                                                        |                   | P1       |

---

## 7. Background / graphic opportunities

Each one is justified by the §5.4 rule. None is a generic filler.

1. **Scaled Mission mark (right track).** _Why:_ The Mission pull quote is the site's thesis ("small → life-changing"). The motif that already says "many small marks around one core" should carry that sentence at a size where it's actually seen, rather than inline at 64px.
2. **Eight-slice ring as a recurring "chapter mark."** _Why:_ It's the site's one literal pizza reference and already exists. Partial versions (1–8 arcs lit) could serve as small orientation markers elsewhere, but the full ring stays unique to Origin and EightSlicesMark itself is unchanged (I5). Demoted to P2 and conditional on that.
3. **A single hairline divider with a core-dot** between cream-on-cream sections. _Why:_ Replaces 256px of pure space with a marker that says "new section," so spacing can come down on those boundaries without feeling cramped. Uses the same `charcoal/10` hairline and a `red` r=3 dot.
4. **Impact stat marks.** _Why:_ Numbers become shapes (a filled wedge for "₹ raised," a small arc count for "students"). They turn a text row into a data unit without adding card chrome.
5. **Trust seal ring (About).** _Why:_ The block's job is credibility. A concentric ring made of the site's own arcs functions as a literal stamp/seal without borrowing government iconography.
6. **Testimonial quote anchor + yellow band.** _Why:_ The only human voice on the site; one warm surface change marks it as the emotional peak of the page.
7. **Closing band illustration, Tier B (shared by About and Gallery CTAs).** _Why:_ Both pages currently end with an identical text block; one shared closing composition solves two sections and signals "end of page."
8. **Gallery empty-state mark (Tier A).** _Why:_ It is currently the first thing a visitor sees on /gallery.
9. **Large low-contrast artwork behind sections:** **not recommended** here. Opacity-tinted art behind body text would conflict with the 4.5:1 requirement and with the "no decoration with no semantic purpose" principle. Revisit only for the hero if a decision is made to unlock it (hero is locked).
10. **Texture:** ruled out (I7). Flat color only: no grain on bands or illustrations.
11. **Eight origin-story objects (optional, Tier B).** _Why:_ The About copy lists eight specific things (a dress, sweets, a temple offering, bus fare, a doll, bangles, a gift, school supplies). Drawn as props, they would visualise the site's founding story without depicting any person. Decided (D13): **one** optional composition in the **Origin section** (not Journey), **separate from EightSlicesMark**, planned for 4C.

---

## 8. Visual rhythm strategy

Replace uniform section → space → section with a deliberate sequence of beat _types_.

### 8.1 Beat types

| Type           | Density | Container                         |
| -------------- | ------- | --------------------------------- |
| **Visual-led** | Relaxed | Full 12 columns, mark on one side |
| **Text-led**   | Medium  | `max-w-2xl` + anchor opposite     |
| **Data-led**   | Dense   | Full-width band                   |
| **Task-led**   | Tight   | Narrow panel                      |
| **Utility**    | Dense   | Hairline lists, 2-col             |
| **Pause**      | Relaxed | Single pull quote, small padding  |

### 8.2 Proposed Home sequence

1. Hero: visual-led (unchanged)
2. Mission: text-led + scaled mark (relaxed)
3. Impact: data-led band (`cream-soft`, dense)
4. Donation: task-led panel (tight, framed)
5. Testimonials: emotional/visual-led (`yellow-tint` band)
6. FAQ: utility, dense, 2-col at lg
7. Footer

Result: alternates cream / soft / cream / (panel) / tint / cream, and every neighbor pair differs in either background or composition.

### 8.3 Proposed About sequence

1. Hero: visual-led split
2. What S1P Is: short text-led beat (tight padding)
3. Origin: visual-led soft band (keep)
4. Why Education: pause (keep)
5. Journey: data-led, full-width chart
6. Impact: data-led, large numerals (soft band)
7. Trust: utility + seal
8. CTA: closing band (shared)

### 8.4 Spacing as a function of beat

**Approved (D2).** Three tiers, written as vertical padding per side at mobile / md / lg:

| Tier          | Padding (px)   | Typical use                                                                                                               |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Tight**     | 56 / 72 / 80   | Utility and task beats (FAQ, Trust, Donation, "What S1P Is") and the side of a cream-on-cream boundary that should shrink |
| **Standard**  | 80 / 96 / 112  | Text-led and data-led beats (Impact, Journey, Mission bottom)                                                             |
| **Breathing** | 80 / 112 / 128 | Today's value. Visual-led beats and closers (hero, Testimonials, Origin, CTA)                                             |

Tiers apply **per side**, so a section may take a different tier on top and bottom. Cream-on-cream boundaries also get the divider (§7.3).

**Proposed assignment** (derived from the approved tiers and beat types in §8.1; adjustable at visual review). Gaps are lg content-to-content, in px:

| Boundary                                | Before    | After           | How                                                                                  |
| --------------------------------------- | --------- | --------------- | ------------------------------------------------------------------------------------ |
| Home: Hero → Mission (cream/cream)      | 256       | 208             | Hero untouched (128) + Mission top **tight** (80) + divider                          |
| Home: Mission → Impact                  | 256       | 224             | Mission bottom standard, Impact standard                                             |
| Home: Impact → Donation                 | 256       | 192             | Impact standard, Donation tight                                                      |
| Home: Donation → Testimonials           | 256       | 208             | Donation tight, Testimonials breathing (now a yellow band, so no longer cream/cream) |
| Home: Testimonials → FAQ                | 256       | 208             | Testimonials breathing, FAQ top tight                                                |
| About: Hero → What S1P Is (cream/cream) | 256       | 192             | Hero bottom standard (112) + What S1P Is tight (80) + divider                        |
| About: What S1P Is → Origin             | 224       | 208             | Tight (80) + Origin breathing (128), band edge                                       |
| About: Origin → Why Education → Journey | unchanged | unchanged       | Why Education keeps its tuned `py-16 md:py-20` (§9)                                  |
| About: Journey → Impact → Trust → CTA   | 256 each  | 224 / 192 / 208 | Standard, standard, tight, then CTA breathing                                        |
| Gallery: Hero → grid (cream/cream)      | 128       | 80              | Hero bottom tight, grid top 0                                                        |
| Gallery: grid → CTA                     | 128 + 128 | 112 + 128       | Grid bottom standard, CTA breathing                                                  |

The Hero → Mission gap stays at 208 because the Phase 1 hero is untouched (I6). If it still feels loose in review, the lever is the hero container's bottom padding, which would need your explicit OK.

### 8.5 Full-width vs contained

Full-width: Impact band, Testimonials band, closing band. Contained: everything else. Never two full-width bands adjacent.

---

## 9. What NOT to change

- **Cream base `#fff8f2`, charcoal text, red as the brand.** Locked in CLAUDE.md §3 and the visible identity.
- **Outfit + Plus Jakarta Sans pairing and the type scale.** Heading weights, tracking, and line lengths are doing real work.
- **The hero ("Gathering Point" + "Absorbed Facet").** Locked per Phase 1. Only the Button beneath it changes.
- **No gradients, no blobs, no stock imagery.** Rule carried over from Phase 1 and the brief.
- **The shape family: core + outline marks + arcs.** New artwork extends this; it doesn't replace it.
- **`EightSlicesMark` (I5) and the existing quiet-mark tier (I2).** Neither is replaced, recolored, or re-weighted.
- **`Container` 1200px, 8px base unit.**
- **The editorial restraint:** hairlines, no card-shadow stacks, no icons-in-circles.
- **The donation flow structure, accessibility focus management, and the 44px targets.**
- **`Why Education`'s tuned padding and the Origin split layout.** Already the best examples of the target rhythm.
- **Copy** (separate pass, 4D).
- **Admin UI.** Out of scope, aside from inheriting the shared `Button` change (D11). Admin's hand-rolled inline buttons (not the shared primitive) are left as they are in 4A; see the checklist's risks.

---

## 10. Implementation priorities

Ranked by expected effect on the identified problems, not by aesthetics.

### P0: essential system changes (fix P-1, P-2, P-3, P-6)

1. **Button hover color + shadow** (P-6), approved D3a: fill stays `red-deep` on hover; red-hued shadow; `red-darkest` only on `:active`. One file, site-wide effect; admin inherits through the shared primitive (D11).
2. **Spacing tiers** (approved D2) replacing the single `py-20/28/32` recipe, with the per-side assignment in §8.4 (P-1).
3. **Two-track layout primitive** for text-led sections so `max-w-2xl` text has something on the other side (P-2, P-3). A layout component only, not artwork yet.
4. **Mission left-aligned with the mark opposite** (approved D7) (P-4).
5. **Add green/yellow tokens** (approved D5/D6, hex finalised by a computed contrast check), **remove `--color-orange`** (D4), and fix the `#2ecc71` icon contrast (P-7).
6. **About hero / What S1P Is** consolidation (worst P-3 instance).

### P1: high-value (fix P-5, P-8, P-9, P-10)

7. Impact and About stat presentation (data marks, green/red coding).
8. Testimonials band + lead quote composition.
9. FAQ two-column layout at lg (approved D8); stacked on mobile.
10. Trust two-track with seal mark.
11. Shared closing band for About and Gallery CTAs.
12. Gallery hero and branded empty state.
13. Divider component for cream-on-cream boundaries.
14. Donation panel framing at ≥lg.
15. Journey chart full-width layout.

### P2: optional polish

16. Footer signature mark.
17. ~~Faint grain on soft bands.~~ Removed: texture is ruled out (I7).
18. Partial eight-slice ring as a small orientation marker, only if it never competes with Origin's EightSlicesMark (I5).
19. Mobile-specific tuning pass after P0/P1 land.
20. One optional Tier B eight-objects composition in the Origin section (I5, D13), in 4C.

---

## 11. 4A → 4B → 4C → 4D boundaries

| Phase                 | Owns                                                                                                                                                                                                                                                                                                                         | Items from this audit                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **4A: Visual system** | Tokens, color, spacing tiers, layout primitives, section compositions, Button static styling (rest/hover _color_ and shadow hue), dividers as static elements, band backgrounds, empty-state _layout_                                                                                                                        | P0 1–6; P1 7–15 for **layout and color only**, with placeholder or no art                                                         |
| **4B: Interaction**   | All motion and state feedback: button hover lift/press behavior, reveal system upgrades, stat count behavior, testimonial transition, FAQ open behavior, **gallery skeleton `animate-pulse` (a looping non-hero animation that conflicts with §3's motion rule)**, hover/focus micro-interactions, any animated illustration | The Button's _transform/lift_ behavior; scroll-reveal redesign                                                                    |
| **4C: Illustrations** | The actual artwork. **Tier A:** scaled Mission mark, impact stat marks, trust seal, quote anchor, About hero mark, Gallery empty-state mark. **Tier B (hands and props only):** closing-band illustration; optionally the eight origin-story objects                                                                         | §6/§7 illustration items. 4A only reserves their layout slots                                                                     |
| **4D: Copy**          | All text changes, including headings, captions, empty-state text, and the uppercase caption lines                                                                                                                                                                                                                            | None. Note only that About's two caption lines and the Impact subhead will be rewritten, and layouts must tolerate length changes |

**Boundary rule:** if a 4A change would require a new SVG, it gets a labeled empty slot in 4A and the SVG ships in 4C. If a 4A change involves anything that moves, it waits for 4B. The Button hover is split on purpose: the _color_ is 4A (you asked for it now), the _motion_ of that hover is 4B. Under D3a, 4A removes the hover fill change and re-hues the shadow; the existing 2px lift is kept as it is. Any redesign of lift or press motion is 4B.

---

## Locked illustration decisions

I1 to I8 are locked and recorded in §5.7. They are not open.

## Decision register

**All decisions are resolved. No open decisions remain for Phase 4A.**

| #        | Topic                      | Outcome                                                                                                   |
| -------- | -------------------------- | --------------------------------------------------------------------------------------------------------- |
| D1       | Illustration references    | Reviewed; §5 revised                                                                                      |
| D2       | Spacing tiers              | Approved: tight 56/72/80, standard 80/96/112, breathing 80/112/128 (§8.4)                                 |
| D3       | Button hover               | Option A: fill stays `#c92c3a`; lift + red-hued shadow; maroon only when pressed                          |
| D4       | Orange                     | Retire; remove the token; no new use                                                                      |
| D5       | Green                      | Approved: `≈#2F7D4F` + tint; `#2ecc71` for success fills only; may be an illustration's single accent     |
| D6       | Yellow                     | Approved: `≈#F2B632` + tint; fill/surface only; Testimonials band; may be an illustration's single accent |
| D7       | Mission                    | Left-aligned editorial composition, mark opposite                                                         |
| D8       | FAQ                        | Two columns at lg (heading/context left, list right); stacked on mobile                                   |
| D9       | About hero                 | Split with a Tier A mark (via I4)                                                                         |
| D10      | Grain                      | Ruled out (via I7)                                                                                        |
| D11      | Admin                      | The shared `Button` change applies to Admin; no separate Admin treatment                                  |
| D12      | Gallery empty state        | Tier A quiet mark, not a spot illustration                                                                |
| D13      | Eight origin-story objects | One optional Tier B composition in the Origin section, 4C; does not replace EightSlicesMark               |
| I1 to I8 | Illustration rules         | Locked, unchanged (§5.7)                                                                                  |

---

## Implementation notes (added at commit time)

- **Final tokens:** `green-deep #2d7a4d` (the audit's `≈#2F7D4F` measured 4.42:1 on `cream-soft`, under AA, so it was nudged), `green-tint #e6f1e8`, `yellow #f2b632`, `yellow-tint #fbefc8`. `--color-orange` removed.
- **Gallery grid top spacing:** the §8.4 table said hero-bottom tight with grid top 0 (80px). Implemented as hero-bottom tight + divider + 32/40px below it (about 113px), to satisfy the brief's "deliberate top spacing" for the grid.
- **Slots below `md`:** framed illustration slots are hidden below `md`, so a stacked mobile page does not gain a large empty box per slot. The Mission mark and the Impact/quote rule markers remain visible.
- **Shared primitives added:** `TwoTrack`, `IllustrationSlot`, `SectionDivider`, `ClosingBand`.
