# Phase 4C — Illustration Production Specifications

**Status:** specification only. No artwork, SVG, source file or commit was produced for this document.
**Sources:** `Docs/PHASE4A_VISUAL_SYSTEM_AUDIT.md` (§4, §5, §5.7 I1 to I8, decision register D1 to D13), `Docs/PHASE4C_ILLUSTRATION_AUDIT.md` (§3 to §8, §14), `Docs/PHASE4B_INTERACTION_AUDIT.md`, `CLAUDE.md`, and the current working-tree implementation (uncommitted).
**Purpose:** let you generate the artwork yourself, then have it integrated into the existing slots without anyone redrawing it.

**How to read each specification.** Every field is tagged:

- **LOCKED** is explicitly decided in the 4A or 4C audit (I1 to I8, D1 to D13, or a 4C audit rule you approved).
- **INFERRED** is derived by me from the audit or the layout. It is not locked. Treat it as a proposal.
- **OPEN** needs your decision before generating. The decisions are collected in §10.

One caution that affects the whole document. The 4C audit's recommendations C1 to C10 were never individually signed off in this conversation. Where this document relies on one (for example C2 "unframed" or C10 "approve the seal"), it is tagged LOCKED only if the 4A decisions or your 4C brief fix it, otherwise INFERRED.

---

## 1. Locked illustration system

### 1.1 Rules from 4A (I1 to I8, D5, D6, D12, D13)

| #   | Rule                                                                                                                                                            | Status |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| I1  | Hands and props only. No faces, no figures, no recurring cartoon cast, no beneficiaries or children.                                                            | LOCKED |
| I2  | Two tiers: **Tier A** quiet marks (existing style), **Tier B** full-line spot illustrations.                                                                    | LOCKED |
| I3  | Charcoal + red + **at most one** of green-deep or yellow per illustration. Never both.                                                                          | LOCKED |
| I4  | About hero stays a quiet Tier A mark.                                                                                                                           | LOCKED |
| I5  | `EightSlicesMark` is kept, unchanged (no recolour, no highlighted arc). The eight-object composition, if ever built, is separate and Origin-section only (D13). | LOCKED |
| I6  | Phase 1 hero untouched.                                                                                                                                         | LOCKED |
| I7  | No grain, no texture, no gradients. Flat colour only.                                                                                                           | LOCKED |
| I8  | Max 3 to 4 spot illustrations per page; never two in one viewport.                                                                                              | LOCKED |
| D12 | Gallery empty state is Tier A, not a spot illustration.                                                                                                         | LOCKED |

### 1.2 Style rules (4A §5.3, 4C audit §3)

| Property             | Rule                                                                                                                                                        | Status            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Character            | Flat, clean vector, editorial, restrained. No wobble, no hand-inked look, no lettering, no numerals.                                                        | LOCKED            |
| Outline colour       | Charcoal `#1D1D1F`. Never navy, never pure black.                                                                                                           | LOCKED            |
| Line caps / joins    | Round caps, round joins. No variable-width strokes. No dashes.                                                                                              | LOCKED            |
| One weight per piece | Single stroke weight inside a piece.                                                                                                                        | LOCKED            |
| Forms                | Mostly unfilled. Figures and props are filled with the surface colour (a "knock-out") so colour blocks show only where they extend past the contour.        | LOCKED            |
| Colour blocks        | Flat shapes drawn **behind** the line art, offset roughly **6 to 10% of the piece's shorter side** down and right. Never outlined. Never used as a contour. | LOCKED            |
| Max blocks           | Two per piece (one red, one accent).                                                                                                                        | LOCKED            |
| Supporting motifs    | Hollow circles and short ticks only. Tier A: 2 to 4 circles, 0 to 4 ticks. Tier B: 3 to 5 circles, 3 to 6 ticks. At most 2 small solid red dots.            | LOCKED            |
| Skin                 | Hands are never skin-coloured; they stay cream/unfilled.                                                                                                    | LOCKED            |
| Density              | Tier A at most about 11 shapes. Tier B about 3 to 6 meaningful elements plus 5 to 12 supporting marks.                                                      | LOCKED            |
| Negative space       | Tier B at least about 40% of the bounding box empty. Tier A at least about 70% (proposed in the audit, so INFERRED for Tier A).                             | LOCKED / INFERRED |
| 160px test           | The idea must read at 160px wide, otherwise remove elements.                                                                                                | LOCKED            |
| Every piece          | Contains at least one existing S1P motif (red core, outline dots, rim arcs).                                                                                | LOCKED            |
| Motion               | None. Static.                                                                                                                                               | LOCKED            |

### 1.3 Palette (the only colours that may appear)

| Name       | Hex       | Token                | Role in artwork                                                           | Status            |
| ---------- | --------- | -------------------- | ------------------------------------------------------------------------- | ----------------- |
| Charcoal   | `#1D1D1F` | `--color-charcoal`   | All linework and ticks                                                    | LOCKED            |
| Red        | `#E63946` | `--color-red`        | The core; the dominant block; tiny solid dots                             | LOCKED            |
| Green-deep | `#2D7A4D` | `--color-green-deep` | The single accent where meaning applies (trust, education)                | LOCKED            |
| Yellow     | `#F2B632` | `--color-yellow`     | Allowed by I3 in principle. **Not used by any piece in this document.**   | LOCKED (not used) |
| Cream      | `#FFF8F2` | `--color-cream`      | The surface under Tier A pieces. Hole/knock-out colour on cream surfaces. | LOCKED            |
| Cream-soft | `#FDEDE3` | `--color-cream-soft` | The closing band's surface. Knock-out fill for the closing piece.         | LOCKED            |

Forbidden: blue, teal, pink, purple, navy, orange, `#2ECC71` (success fills only), gradients, tints inside art, shadows, glows.

### 1.4 Stroke and opacity (Tier A and Tier B)

These are **rendered pixel values on the live page**, held constant at every size.

| Property        | Tier A                                                                                       | Tier B             |
| --------------- | -------------------------------------------------------------------------------------------- | ------------------ |
| Rendered stroke | **1.75 px** (hero ~1.6, EightSlices ~1.9) (LOCKED by 4C §3.1)                                | **2 px** (LOCKED)  |
| Stroke colour   | Charcoal at reduced opacity: rim/arc marks .32 to .35, outline dots .45, frames .40 (LOCKED) | Charcoal, **100%** |
| Core            | Red `#E63946`, 100% (LOCKED)                                                                 | n/a                |

**Opacity cannot be reproduced by an image generator.** If you must deliver flattened colours, use these equivalents on cream `#FFF8F2` (INFERRED; computed by blending charcoal over cream):

| Charcoal opacity | Flattened on cream |
| ---------------- | ------------------ |
| 35%              | `#B0ABA8`          |
| 40%              | `#A5A09E`          |
| 45%              | `#999593`          |

See §9 for the preferred handoff (pure `#1D1D1F` plus stated opacity).

### 1.5 What the family looks like

The three new pieces plus the existing marks are meant to read as one family:

- **Tier A** pieces (EchoMark, EightSlicesMark, Trust seal, viewfinder): faint charcoal arcs, rings, corner ticks and hollow dots around **one solid red dot**. Same dot-and-arc vocabulary as the hero. No fills except the red core. Quiet.
- **Tier B** (closing piece): the same vocabulary at full strength, plus objects. Red disc and green rectangle are the only colour. It is the only piece on its page with full-opacity line.
- Nothing is louder than the hero. Nothing on a page should look like a stock illustration.

---

## 2. Asset inventory

| Asset                                 | Tier | New / Existing      | Page                 | Section                                  | Status                                                                                                      |
| ------------------------------------- | ---- | ------------------- | -------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Hero `GatheringPoint`                 | A    | Existing            | Home                 | Hero                                     | **Locked, untouched** (I6)                                                                                  |
| `EightSlicesMark`                     | A    | Existing            | About                | Origin story                             | **Locked, unchanged** (I5)                                                                                  |
| `EchoMark`                            | A    | Existing            | Home, About, Gallery | Mission; About hero; Gallery empty state | Reuse. Technical refinement already applied (stroke). **No new artwork.**                                   |
| Trust seal                            | A    | **New to generate** | About                | About the Trust                          | Placeholder code-drawn version exists, uncommitted; to be **replaced** by your asset                        |
| Gallery viewfinder mark               | A    | **New to generate** | Gallery              | Hero                                     | Placeholder code-drawn version exists, uncommitted; to be **replaced** by your asset                        |
| Closing-band illustration             | B    | **New to generate** | About and Gallery    | Closing CTA band (both)                  | Placeholder code-drawn version exists, uncommitted; to be **replaced** by your asset. **One shared asset.** |
| Impact stat marker                    | A    | Existing (CSS)      | Home, About          | Impact; About figures                    | Excluded. Stays a CSS rule.                                                                                 |
| Testimonial quote anchor              | A    | Existing (CSS)      | Home                 | Testimonials                             | Excluded. Stays a CSS rule.                                                                                 |
| Gallery closing variant (photo print) | B    | Deferred            | Gallery              | Closing band                             | Not in this pass (4C-C)                                                                                     |
| Origin eight-object composition       | B    | Deferred            | About                | Origin story                             | Not in this pass (4C §9 conditions unmet)                                                                   |
| Compact mobile closing piece          | B    | **OPEN**            | About, Gallery       | Closing band, below `md`                 | Not built. Needs your decision (§10, Q6)                                                                    |

**Net new artwork required: three pieces** (two Tier A, one Tier B). Nothing else in the audit needs generated art.

---

## 3. Trust seal

### 3.1 Summary

| Field        | Value                                                                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Name      | Trust seal (`trust-seal`). Working title only: it is **not** a seal of authority.                                                                                                                             |
| 2. Tier      | **A** (LOCKED; audit §7 S5)                                                                                                                                                                                   |
| 3. Purpose   | Orientation and credibility for the factual block ("held together, registered") without claiming any certification. LOCKED in intent; the "continuity, not a stamp" wording is from the audit's brief (§8.2). |
| 4. Placement | About page, "About the Trust" section, in the right-hand visual track beside the legal-info list. Desktop (`md` and up) only. LOCKED slot; hidden below `md` is the current 4A behaviour.                     |

### 3.2 Rendered size

| Breakpoint      | Size                                       | Status                                                                                      |
| --------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Desktop (≥1024) | **224 px** square (audit range 200 to 240) | LOCKED range; 224 INFERRED                                                                  |
| Tablet (768)    | **208 px** square, centred below the text  | INFERRED from the current slot                                                              |
| Mobile (<768)   | **Hidden**                                 | LOCKED as current behaviour; whether to change is OPEN only for the closing piece, not this |

### 3.3 Composition

All coordinates are on a **square canvas, centre at 50%, 50%**. Angles are measured clockwise starting at 3 o'clock (3 o'clock = 0°, 6 o'clock = 90°, 9 o'clock = 180°, 12 o'clock = 270°). Percentages are of the canvas width.

LOCKED by the audit: two concentric broken rings; a small red core; one green-deep arc on the outer ring; three tiny ticks and one hollow circle outside; no eight-fold symmetry; long uneven arcs. INFERRED: every exact angle and radius below (the audit gives approximate ranges; these are one concrete choice).

1. **Red core:** solid circle, diameter about 9% of width, dead centre, `#E63946`.
2. **Inner ring**, radius 19% of width (about 38% of the half-width). **Three long arcs**, charcoal at 35%:
   - arc 1: 10° to 95° (from just below 3 o'clock to 6 o'clock), about 85° long;
   - arc 2: 125° to 195° (about 7:30 to 9:30), about 70° long;
   - arc 3: 235° to 330° (about 10:30 to 2 o'clock), about 95° long.
   - Gaps (unequal): about 30° at the bottom, about 40° at the left, about 40° at the upper right.
3. **Outer ring**, radius 32% of width. **Two long arcs**, charcoal at 35%:
   - arc A: 25° to 145° (about 3:30 to 7:30), about 120° long;
   - arc B: 175° to 265° (about 9 o'clock to just before 12), about 90° long.
4. **One green-deep arc** on the same outer ring, `#2D7A4D`, 100% opacity, 40° long, 290° to 330° (about 12:30 to 2 o'clock). Same stroke width as the others. It sits in the gap between arc B and arc A, so the outer ring is almost, but not fully, closed.
5. **Three tiny ticks** outside the outer ring, each 3 to 4% of the width long, radial, charcoal at 45%, at **70°, 232° and 345°**, starting about 37% from the centre.
6. **One hollow circle**, diameter about 4% of width, charcoal at 45%, centred at 160° and about 40% of the width from the centre (beside the gap between arcs A and B).

Total shapes: 1 core + 3 inner arcs + 2 outer arcs + 1 green arc + 3 ticks + 1 circle = **11**. That is the Tier A ceiling.

### 3.4 Subject and orientation

| Field      | Value                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 7. Subject | Two broken rings around a single red dot. It should read as "contained and orderly, but not sealed shut". (LOCKED idea, audit §8.2.) |
| 8. Pose    | No hands. Flat, frontal, no perspective, no rotation.                                                                                |

### 3.5 Linework, colour, blocks

| Field                    | Value                                                                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9. Linework              | Open arcs and short ticks only. Round caps. **1.75 px rendered**, one weight everywhere. Nothing outlined except the hollow circle. No fills except the core. LOCKED. |
| 10. Colour               | Charcoal arcs at 35%, ticks and circle at 45%. Red core `#E63946`. One green-deep arc `#2D7A4D`. Everything else transparent. No yellow. LOCKED.                      |
| 11. Offset colour blocks | **None.** Tier A marks carry no blocks. LOCKED (blocks are Tier B).                                                                                                   |
| 12. Existing S1P motif   | The hero's core-with-rim-arcs: a red core and short charcoal rim arcs. LOCKED. It must read as a cousin of `EightSlicesMark`, not a copy.                             |
| 13. Negative space       | About 85% or more of the canvas empty. The area between rings is empty. INFERRED.                                                                                     |
| 14. Cropping             | **None.** Everything stays inside the canvas with a margin of at least 8%. INFERRED.                                                                                  |
| 15. Background           | **Transparent.** The About page supplies cream `#FFF8F2`. Do not add a plate, circle or tint behind it (LOCKED by C2 only if you accept it; see Q9).                  |

### 3.6 Must NOT appear

- Any text, numerals, "316/2016", initials, or monogram. (LOCKED)
- Stars, laurels, crests, ribbons, shields, checkmarks, stamps, wax seals, badges. (LOCKED: official-seal imagery is forbidden)
- Eight-fold or any rotational symmetry; evenly spaced equal arcs on one ring (that is `EightSlicesMark`). (LOCKED)
- A closed ring. A tinted disc. Any second accent colour. Gradients, glow, shadow, texture.

### 3.7 Visual relationship

| Compared to       | Relationship                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `EchoMark`        | Same red-dot-and-faint-marks vocabulary; the seal is concentric, EchoMark is scattered.                                                    |
| `EightSlicesMark` | **Must differ**: long uneven arcs, two radii, small core, one green arc; EightSlices is eight short even arcs, one radius, bigger core.    |
| Closing piece     | Co-visible on About (about 840 px apart at 1440). Seal is ~224 px and faint; closing piece is ~400 px and full strength. Keep it that way. |
| Hero              | Quieter and smaller. Never louder.                                                                                                         |

### 3.8 Accessibility and asset

| Field                  | Value                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 18. Accessibility      | Decorative. `aria-hidden`, no title or description, never the only signal of "registered" (the adjacent list says it). LOCKED.                                                             |
| 19. Asset requirements | **SVG**, transparent background, viewBox **1:1** (suggest `0 0 200 200`). Must scale cleanly. Strokes preferably kept as strokes (not expanded) so the live page can hold 1.75 px. See §9. |
| 20. Generation prompt  | §8.1                                                                                                                                                                                       |

### 3.9 Locked / Inferred / Open

| LOCKED                                                                                                                                                                             | INFERRED                                                                  | OPEN                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tier A; two broken rings, small red core, one green-deep arc, ticks and a hollow circle; no text, no crest; unframed track; hidden on mobile; colours; stroke 1.75 px; aria-hidden | All angles, radii, tick positions, 224 px size, 11-shape count, 8% margin | Q1: generator versus vector tool for Tier A. Q3: whether the faint green arc is acceptable at 1.75 px or may be heavier. Q9: confirm "unframed, no plate". |

---

## 4. Gallery ViewfinderMark

### 4.1 Summary

| Field        | Value                                                                                                                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Name      | Gallery viewfinder mark (`gallery-hero-mark`)                                                                                                                                                               |
| 2. Tier      | **A** (LOCKED)                                                                                                                                                                                              |
| 3. Purpose   | Orientation: "this page is about framed moments". It also differentiates the Gallery hero from the plain `EchoMark` used by the empty state below it (they sit in one viewport). LOCKED (audit §7 S7, C-7). |
| 4. Placement | Gallery page, hero section, in the right-hand visual track beside the "Our Gallery" heading. Desktop and tablet only; hidden below `md`. LOCKED slot.                                                       |

### 4.2 Rendered size

| Breakpoint      | Size                                      | Status                     |
| --------------- | ----------------------------------------- | -------------------------- |
| Desktop (≥1024) | **280 × 187 px** (audit range 240 to 280) | LOCKED range; 280 INFERRED |
| Tablet (768)    | **240 × 160 px**, centred below the text  | INFERRED                   |
| Mobile (<768)   | **Hidden**                                | LOCKED (current behaviour) |

### 4.3 Composition

Canvas **3:2 landscape**. Positions are percentages of the canvas width (x) and height (y), origin top-left. LOCKED by the audit: four L-shaped corner ticks forming an implied rectangle, inset about 10%; one corner shorter; red core off-centre; two outline dots inside; one hollow circle outside the frame. INFERRED: the exact coordinates.

1. **Four L-shaped corner ticks**, charcoal at 40%, round caps, forming an implied rectangle with **10% inset** on all sides (rectangle corners at about 10%, 10% / 90%, 10% / 90%, 90% / 10%, 90%).
   - Top-left, top-right, bottom-left: each leg about **9% of the width** (about 14% of the height) long.
   - Bottom-right: legs about **5% of the width**, the deliberately shorter corner.
   - The rectangle itself is **never drawn**, only implied by the four corners.
2. **Red core:** solid circle, diameter about 8% of width, `#E63946`, **off-centre**, at about **59% x, 56% y** (right of and below centre, like a subject not yet centred).
3. **Two outline dots** inside the frame, hollow, charcoal at 45%: one diameter about 3.3% of width at about **32% x, 35% y**; one diameter about 2.5% of width at about **43% x, 70% y**.
4. **One hollow circle outside** the frame, diameter about 2.5% of width, charcoal at 45%, at about **96% x, 29% y** (just beyond the top-right corner tick, still inside the canvas).

Total shapes: 4 corners + 1 core + 2 dots + 1 circle = **8**.

### 4.4 Subject, linework, colour

| Field                    | Value                                                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 7. Subject               | A frame with a red dot inside it: "a framed subject". No camera.                                                                   |
| 8. Pose                  | No hands. Flat, frontal, no perspective.                                                                                           |
| 9. Linework              | L-shaped open corners and hollow circles only. Round caps and joins. **1.75 px rendered**. Nothing filled except the core. LOCKED. |
| 10. Colour               | Charcoal 40% (corners) and 45% (dots, circle); red core `#E63946`. No accent colour. LOCKED.                                       |
| 11. Offset colour blocks | None. LOCKED (Tier A).                                                                                                             |
| 12. Existing S1P motif   | Red core plus outline dots (the `EchoMark` vocabulary). LOCKED.                                                                    |
| 13. Negative space       | About 90% empty. INFERRED.                                                                                                         |
| 14. Cropping             | None. INFERRED.                                                                                                                    |
| 15. Background           | **Transparent.** The Gallery hero supplies cream `#FFF8F2`. No plate.                                                              |

### 4.5 Must NOT appear

- Lens, aperture, shutter, camera body, flash, film strip, polaroid, picture-frame, mountain-and-sun photo icon. (LOCKED: no camera/lens/shutter iconography)
- A full drawn rectangle or any fully closed frame.
- Text, numerals, crosshair lines through the middle, focus brackets with a centre cross, grid lines.
- Any accent colour, gradient, shadow.

### 4.6 Visual relationship

| Compared to                      | Relationship                                                                                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EchoMark` (Gallery empty state) | Co-visible in the Gallery's first viewport (about 360 px apart). Must stay clearly different: the viewfinder has a frame, the empty state is the bare mark. |
| Trust seal                       | Different page. Same weight, same dot vocabulary.                                                                                                           |
| Closing piece                    | The Gallery closing band is below. Viewfinder is faint Tier A; the closer is the only full-strength piece.                                                  |

### 4.7 Accessibility and asset

| Field                  | Value                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| 18. Accessibility      | Decorative, `aria-hidden`, never the carrier of meaning. LOCKED.                                   |
| 19. Asset requirements | **SVG**, transparent, viewBox **3:2** (suggest `0 0 240 160`), scales cleanly, strokes as strokes. |
| 20. Generation prompt  | §8.2                                                                                               |

### 4.8 Locked / Inferred / Open

| LOCKED                                                                                                                                               | INFERRED                                             | OPEN                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Tier A; four corner ticks, one shorter; red off-centre core; two dots inside, one hollow circle outside; no camera iconography; 3:2; colours; stroke | Coordinates; 280 px size; 8% to 10% inset arithmetic | Q1: generator versus vector tool. Q8: the Gallery photos' content is unknown (audit G-3), so "framed moments" is assumed apt, not confirmed. |

---

## 5. Closing-band illustration

This is the only figurative piece and the only one that realistically needs an image generator.

### 5.1 Summary

| Field        | Value                                                                                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Name      | Closing-band illustration, "wedge on notebook" (`closing-band`)                                                                                                                                                                                                                                                    |
| 2. Tier      | **B** (LOCKED)                                                                                                                                                                                                                                                                                                     |
| 3. Purpose   | The last emotional beat before the donate button: the cost of one pizza set down on a student's schoolwork. Pairs with About's "one pizza, or one student's next school fee" and Gallery's "one pizza's worth of support". LOCKED concept (audit §8.4, decision C3 recommended; your 4C brief named this concept). |
| 4. Placement | The shared `ClosingBand` section at the bottom of **About** and **Gallery**, in the right-hand visual track beside the heading, text and "Donate One Pizza" button. **One asset used in both places.** Desktop and tablet only.                                                                                    |

### 5.2 Rendered size

| Breakpoint      | Size                                      | Status                                                             |
| --------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| Desktop (≥1024) | **400 × 300 px** (audit range 320 to 400) | LOCKED range; 400 INFERRED                                         |
| Tablet (768)    | **320 × 240 px**, centred below the text  | INFERRED                                                           |
| Mobile (<768)   | **Hidden** today                          | LOCKED as current 4A behaviour. A compact version is **OPEN** (Q6) |

### 5.3 Composition

Canvas **4:3 landscape**. Percentages are of canvas width (x) and height (y), origin top-left. Everything below is LOCKED at the level of "which objects exist and roughly where" (audit §8.4); every number is INFERRED unless stated.

Draw in this back-to-front order.

**Layer 1: two flat colour blocks (no outline).**

- **Green block:** a rounded rectangle, `#2D7A4D`, corner radius about 4% of the height. Spans about **23% to 83% of the width** and **71% to 97% of the height**. It sits behind the notebook and is offset about 8% (about 24 px on a 300 px-tall canvas) **down and to the right** of the notebook, so it shows only along the notebook's right and bottom edges.
- **Red block:** a flat circle, `#E63946`, diameter about **39% of the width**, centre at about **72% x, 55% y**. It sits behind the hand and the wedge, offset about 6 to 8% down-right of that cluster. It is hidden below the notebook's top edge.

**Layer 2: the whole pizza, "with the slice gone" (outline only).** A large hollow circle, charcoal, **no fill**, upper-left, with a **wedge-shaped gap** cut out of its rim where the slice came from, the gap facing the lower right (toward the notebook). Gap is about 36° of arc, centred about 40° below the horizontal toward the lower right. This is the "one sacrificed" idea and the rim-arc motif.

- Version A (the 4C audit, LOCKED): the circle is **partly cropped by the upper-left edge** of the canvas. Diameter about 48% of the width, centre about 12% x, 19% y.
- Version B (my earlier deviation, OPEN, see Q3): the circle is **fully inside** the canvas. Diameter about 33% of the width, centre about 20% x, 28% y.

**Layer 3: open notebook (filled with the surface colour, outlined).** An open book/notebook seen almost straight on, **lower-left of centre**: two page shapes meeting at a central spine. Each page is a flat rectangle with a very slightly curved top and bottom edge. Together they span about **17% to 77% of the width** and **62% to 89% of the height** (a wide, low shape, about 60% of the width). **Two thin ruled lines on each page**, same stroke weight as the outline, no text. No cover thickness drawn, no binding rings, no pencil in the notebook. Filled `#FDEDE3` (the band surface) so the blocks behind it only show outside its contour.

**Layer 4: the pizza wedge (filled with surface colour, outlined).** One slice resting on the **right-hand page**: a triangle with the **point down, touching the page**, and the **curved crust edge at the top**. The crust is a plain arc; add **one second arc just inside it** to show crust thickness (this inner arc is the "rim arc" motif). Height about **33% of the canvas height**, width at the crust about **17% of the canvas width**, tilted about **10° clockwise** as if just set down. Tip at about **59% x, 76% y**. **No toppings, no pepperoni, no cheese drips, no face.** Filled `#FDEDE3`.

**Layer 5: the hand and sleeve (filled with the surface colour, outlined).** One **faceless right hand and forearm**, entering from the **upper-right corner** and pointing down-left toward the crust.

- The forearm is a straight band about 12% of the width wide, leaving the canvas through the **top edge and right edge near the upper-right corner** (intentional crop, LOCKED).
- A **sleeve cuff** across the forearm about 15% of the forearm length before the wrist: a rounded rectangle slightly wider than the arm.
- The hand below the cuff is shown **from the back**, wrist at about **75% x, 22% y**, fingers pointing down-left. **Thumb and index finger are separated by a visible V-shaped gap** about one finger-width wide and are about to release the crust. The tips hover **about one finger-width above the crust and do NOT touch it**. The other three fingers are curled and indicated by **two short curved lines** on the side of the hand. This is a release, not a handover (LOCKED).
- Left unfilled except for the surface colour. Skin is never coloured.

**Layer 6: supporting marks.** Charcoal, same weight, no fill unless noted.

- **Three hollow circles**, diameters about 1.5%, 2% and 2.5% of the width: at about 49% x / 17% y (above the wedge), 8.5% x / 77% y (far left), and 88% x / 79% y (right of the green block).
- **Three short ticks** (about 3% of the width long, irregular angles, none parallel) in the open space **between the ghost pizza and the wedge**, around 46% to 51% x and 43% to 57% y.
- **Two tiny solid red dots**, `#E63946`, about 1.3% of the width: near the lower-left and lower-right corners. (The audit's brief says "two small dots (one red)"; solid dots are red-only by the audit's own motif rules, so both are red. See Q10.)

Total: 2 blocks, 1 ghost circle, 2 notebook pages plus 4 ruled lines, 1 wedge plus its inner arc, 1 hand and sleeve, 3 circles, 3 ticks, 2 dots. Meaningful objects (ghost, notebook, wedge, hand) = **4**, within the 3 to 6 rule.

### 5.4 Subject, pose, perspective

| Field       | Value                                                                                                                                                                                                                                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7. Subject  | "A pizza slice being set down on an open notebook." A viewer should read: slice, hand, book, red and green blocks. 160px test: if it reads "a slice placed on a book", it passes. LOCKED.                                                                                                                                          |
| 8. Pose     | Right hand, back of the hand toward the viewer, forearm descending from the upper right at roughly 45°, thumb and index finger open with a V gap above the crust. Orientation of the wedge: point down, crust up, 10° clockwise tilt. INFERRED (the audit only says "release, not handover; the wedge is just touching the page"). |
| Perspective | **Flat, frontal, almost orthographic.** The wedge and notebook are drawn as if seen from just above, with no vanishing point, no foreshortening, no cast shadows, no ground plane. INFERRED.                                                                                                                                       |

### 5.5 Linework, colour, blocks

| Field                    | Value                                                                                                                                                                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9. Linework              | Charcoal `#1D1D1F`, **100% opacity**, **2 px rendered at 400 px wide** (about 0.5% of the canvas width), round caps and joins, **one weight for the whole piece**. Outlined: ghost circle, notebook, ruled lines, wedge, hand, sleeve, hollow circles, ticks. Blocks and dots are not outlined. LOCKED. |
| 10. Colour               | Charcoal; red `#E63946` (disc and two dots); green-deep `#2D7A4D` (rectangle). Notebook, wedge, hand and sleeve filled `#FDEDE3`. **No yellow.** Nothing else. LOCKED (red + one accent).                                                                                                               |
| 11. Offset colour blocks | Two flat blocks drawn **behind** the line art: a red disc behind hand and wedge, a green rounded rectangle behind the notebook, each offset about 6 to 8% down-right. LOCKED technique; shapes and numbers INFERRED.                                                                                    |
| 12. Existing S1P motif   | Crust arc = the **rim arc**; red disc = the **core**, enlarged; hollow circles and ticks = the outline dots. All three are present. LOCKED.                                                                                                                                                             |
| 13. Negative space       | About 45% of the canvas empty (audit: at least 40%, brief says about 45%). Leave open: the **lower-left** (below the ghost pizza, left of the notebook), the **upper-middle**, and the **right edge** below the arm.                                                                                    |
| 14. Cropping             | The forearm and sleeve leave the canvas through the **top edge and right edge at the upper-right corner**. In Version A the ghost pizza is also cropped by the **top and left edges**. Nothing else may touch an edge.                                                                                  |
| 15. Background           | **Transparent.** The Closing band supplies `#FDEDE3`. The knock-out fills are `#FDEDE3` so they disappear into the band; if the asset is ever used on a different surface, the fills would need to change (not planned).                                                                                |

### 5.6 Must NOT appear

- A second hand, a recipient, any face or figure, any child, any student, uniform, school building, backpack. (LOCKED)
- Coins, rupee symbol, banknotes, phone, card, payment imagery. (LOCKED)
- Pepperoni, olives, cheese strings, toppings, a whole pizza box, a plate, any photographic or clip-art food. (LOCKED)
- Any lettering, numerals, handwriting or scribbles on the notebook pages. (LOCKED)
- Pencil, pen, eraser, ruler, or other stationery (the fallback concept uses a pencil; this one does not). INFERRED.
- Yellow, blue, teal, pink, purple, orange. Gradients, shading, hatching, cast shadows, glow, grain, paper texture. (LOCKED)
- A background, ground line, shelf, table, or frame around the piece. INFERRED.
- Generic business imagery: shields, gears, keys, envelopes, charts, handshake, lightbulb. (LOCKED)

### 5.7 Visual relationship

| Compared to            | Relationship                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EchoMark`             | Same vocabulary at full strength: red disc = enlarged core; hollow circles = outline dots.                                                                                |
| `EightSlicesMark`      | The wedge and the gapped ghost circle echo the "slices" idea. The ghost circle must **not** be eight-segmented or evenly spaced.                                          |
| Trust seal, viewfinder | They are faint Tier A; this is the only full-strength piece on its page. On About it is co-visible with the seal: keep the contrast (scale 400 vs 224, line full vs 35%). |
| Hero                   | Quieter overall (static, small, off to one side).                                                                                                                         |

### 5.8 Accessibility and asset

| Field                  | Value                                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 18. Accessibility      | Decorative, `aria-hidden`, no title/description. The section heading and body carry the meaning. LOCKED.                                                                                               |
| 19. Asset requirements | **SVG**, transparent background, viewBox **4:3** (suggest `0 0 400 300`), scales cleanly. Blocks and fills as closed shapes; outlines kept as strokes (not expanded). Fills exactly `#FDEDE3`. See §9. |
| 20. Generation prompt  | §8.3                                                                                                                                                                                                   |

### 5.9 Locked / Inferred / Open

| LOCKED                                                                                                                                                                                                                                                                                  | INFERRED                                                                                                                                      | OPEN                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Concept (hand sets a wedge on an open notebook), no recipient, red + green-deep only, 4 meaningful elements, ghost pizza with a wedge gap, rim-arc crust, 2 blocks offset 6 to 10%, 2 px full-opacity charcoal, no lettering, 4:3, one shared asset, forearm cropped at the upper-right | All coordinates and sizes, hand pose details (back of hand, V gap, curled-finger lines), tilt, perspective, `#FDEDE3` fills, 400/320 px sizes | Q2: hand-based pose versus the audit's fallback concept. Q3: ghost circle cropped or contained. Q6: compact mobile version. Q7: Gallery photo-print variant later. Q10: red dots both red or one charcoal. |

---

## 6. EchoMark

### 6.1 Existing, no new artwork

| Field               | Value                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Status              | **Reused, technically refined, not replaced.** LOCKED by 4C audit §8.1 and your 4C brief ("Keep the existing EchoMark concept"). |
| Geometry            | Unchanged: viewBox 120, red core r10 at (62,60), outline dots r4 at (38,30), r3 at (86,46), r3.5 at (54,92).                     |
| Refinement (done)   | Non-scaling 1.75 px stroke; outline dots at .45 opacity; core at 100%. Already applied in the working tree, uncommitted.         |
| Where used          | Home Mission (160/224/288 px); About hero (224 px, unframed); Gallery empty state (96/112 px, inside its yellow-tint panel).     |
| New artwork needed? | **No.** Nothing in this document redraws it.                                                                                     |
| Palette             | Charcoal outline dots, red core `#E63946`. No accent.                                                                            |

### 6.2 Things that are not decided

- **Small-size weight (OPEN, Q4):** at 96 to 112 px a 1.75 px stroke makes the outline dots look heavy (inner void about 1.5 px). One option is a 1.25 px stroke below 128 px, roughly what it rendered before 4C. It is a code change, not new artwork.
- **About hero duplicates Mission (OPEN, Q5):** the About hero uses the same `EchoMark` as Home Mission. The audit's fallback is a new composition (not eight arcs). This is the **only** scenario in which `EchoMark` would need new artwork.

### 6.3 `EightSlicesMark` and other existing marks

| Mark                  | Decision                                                                            |
| --------------------- | ----------------------------------------------------------------------------------- |
| `EightSlicesMark`     | **Reuse unchanged.** No recolour, no highlighted arc, no re-weighting. LOCKED (I5). |
| `GatheringPoint` hero | **Reuse unchanged.** LOCKED (I6).                                                   |
| `favicon.svg`         | Out of scope; untouched.                                                            |

---

## 7. Deferred / excluded artwork

| Item                                          | Decision                                                                                                                                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Origin eight-object composition               | **Deferred.** Needs a layout change, a relaxed density rule, and answers to audit G-1 (what the temple offering is) and G-2 (the son-in-law's gift). Not part of this pass. LOCKED as optional (D13); excluded by 4C §9. |
| Impact stat markers                           | **Excluded.** Remain the existing CSS rule. The Home figures are placeholders, so a proportion mark would encode false data. (4C S2, C6.)                                                                                |
| Testimonial quote anchor                      | **Excluded.** Remains the existing CSS rule; a drawn glyph would duplicate the quotation marks already in the text. (4C S3, C6.)                                                                                         |
| Gallery closing variant (photo print, yellow) | **Deferred** until the base closing piece is approved (C4).                                                                                                                                                              |
| Compact mobile closing piece                  | **Not built; OPEN** (C5/O-5, Q6).                                                                                                                                                                                        |
| New About hero composition                    | **Not needed unless Q5 is answered "yes".**                                                                                                                                                                              |
| Gallery empty-state artwork                   | **None.** Reuses `EchoMark` inside its existing yellow-tint panel (D12).                                                                                                                                                 |
| Any other slot                                | **None.** No other slot needs generated artwork.                                                                                                                                                                         |

---

## 8. Generation prompts

**Read first.**

1. Each prompt describes only the image. Paste one at a time.
2. An image generator cannot reproduce exact stroke weights, opacities or arc angles. The prompts give the closest achievable wording; expect to check the result against the specification above and re-roll or correct in a vector editor. **Prompts 8.1 and 8.2 are geometric and are usually better drawn in a vector tool than generated** (Q1).
3. If your tool cannot output a transparent background, use the flat background colour stated in each prompt (it matches the page surface exactly) and mark it for removal.
4. Ask for **SVG output** if the tool can; otherwise ask for the largest possible PNG and I will treat it as a reference for tracing, not as a final asset (see §9).

### 8.1 Trust seal

```
A square 1:1 minimalist line-art mark on a flat solid #FFF8F2 background. Flat vector style, no gradients, no shadows, no texture, no text.

Centre of the square: one small solid filled circle in red #E63946, diameter about 9% of the image width, placed exactly at the centre.

Around it, two concentric rings drawn only as open, broken arcs (never closed circles), using a thin even line of uniform weight, rounded line ends, in dark charcoal #1D1D1F at about 35% opacity (a soft mid-grey).

Inner ring, radius about 19% of the image width: exactly three long arcs of unequal length with three unequal gaps between them. Measuring angles clockwise from 3 o'clock: arc one from 10 degrees to 95 degrees, arc two from 125 degrees to 195 degrees, arc three from 235 degrees to 330 degrees.

Outer ring, radius about 32% of the image width: exactly two long arcs. Arc A from 25 degrees to 145 degrees, arc B from 175 degrees to 265 degrees.

On the outer ring only, one additional short arc about 40 degrees long, from 290 degrees to 330 degrees, drawn in deep green #2D7A4D at full opacity with the same line weight. This is the only coloured line apart from the red dot.

Outside the outer ring: exactly three tiny straight radial tick marks, each about 3 to 4% of the image width long, in charcoal at about 45% opacity, at 70 degrees, 232 degrees and 345 degrees. Plus exactly one small hollow circle outline, diameter about 4% of the image width, charcoal at about 45% opacity, at 160 degrees, about 40% of the image width away from the centre.

The composition is deliberately irregular and asymmetric: no eight-fold or any repeating symmetry, no evenly spaced arcs. About 85% of the image stays empty. Everything stays at least 8% inside the edges.

Absolutely none of: text, letters, numbers, stars, laurels, crests, shields, ribbons, stamps, badges, checkmarks, a closed outer ring, filled discs other than the red dot, gradients, glow, shadows, texture, any other colour.
```

### 8.2 Gallery viewfinder mark

```
A landscape 3:2 minimalist line-art mark on a flat solid #FFF8F2 background. Flat vector style, no gradients, no shadows, no texture, no text.

Four small L-shaped corner brackets that together imply an invisible rectangle inset about 10% from every edge of the image. The rectangle itself is never drawn; only the four corners. Each bracket is a thin even line of uniform weight with rounded ends, in dark charcoal #1D1D1F at about 40% opacity (a soft mid-grey). Top-left, top-right and bottom-left brackets have arms about 9% of the image width long. The bottom-right bracket is deliberately shorter, arms about 5% of the image width.

Inside the implied frame, slightly right of and below centre, at about 59% from the left and 56% from the top: one solid filled circle in red #E63946, diameter about 8% of the image width. It is clearly not centred.

Also inside the frame: two small hollow circle outlines, charcoal at about 45% opacity, same line weight. One about 3.3% of the image width in diameter at about 32% from the left and 35% from the top; one about 2.5% in diameter at about 43% from the left and 70% from the top.

Outside the frame, just beyond the top-right bracket: one more tiny hollow circle outline, about 2.5% of the image width in diameter, charcoal at about 45% opacity, at about 96% from the left and 29% from the top.

Eight shapes in total. About 90% of the image stays empty. No other colour than the red dot.

Absolutely none of: a camera, lens, aperture, shutter, flash, film strip, photo-icon with mountain and sun, a fully drawn rectangle, crosshair or centre cross, grid lines, text, numbers, gradients, shadows, glow, texture.
```

### 8.3 Closing-band illustration

Default is **Version A** (ghost pizza cropped, as in the 4C audit). To use Version B (fully contained), replace the sentence marked `[GHOST CIRCLE]` with the Version B text printed after the prompt.

```
A landscape 4:3 flat editorial vector illustration on a flat solid #FDEDE3 background. Clean uniform dark charcoal #1D1D1F outlines, all one identical line weight (thin, about 0.5% of the image width), rounded line ends and corners, no variable line width. Objects are filled with the same flat #FDEDE3 as the background so they look unfilled and only their outlines show. No gradients, no shading, no shadows, no hatching, no texture, no grain. The only colours are #1D1D1F outlines, flat red #E63946, flat deep green #2D7A4D, and the #FDEDE3 fill.

Scene: a single faceless hand has just released one pizza slice onto an open notebook. Flat frontal view from slightly above, no perspective, no vanishing point, no cast shadows, no ground line.

Layer 1, two flat colour blocks with no outline, drawn behind everything. (a) A flat deep green #2D7A4D rounded rectangle spanning from about 23% to 83% of the image width and from 71% to 97% of the height, sitting directly behind and below the notebook, shifted down and right so it only shows along the notebook's right and bottom edges. (b) A flat red #E63946 circle, diameter about 39% of the image width, centred at about 72% from the left and 55% from the top, sitting behind the hand and the pizza slice, shifted slightly down and right of them. The notebook covers its lower part.

Layer 2: [GHOST CIRCLE] A large outline-only circle in the upper-left of the image, charcoal line, no fill, representing the whole pizza, diameter about 48% of the image width, centred at about 12% from the left and 19% from the top, so that it runs off the top and left edges of the image. A wedge-shaped gap about 36 degrees wide is missing from its rim, centred on the lower right of the circle, facing toward the notebook, showing where the slice was taken from. The gap is a plain break in the circle line, with no radial lines.

Layer 3: an open notebook, lower-left of centre, seen almost straight on: two rectangular pages side by side meeting at a central spine, each page with a very slightly curved top and bottom edge, outlined, filled #FDEDE3. It spans about 17% to 77% of the image width and 62% to 89% of the height, a wide low shape. Each page has exactly two thin horizontal ruled lines in the same charcoal line weight. No writing, no letters, no numbers, no cover thickness, no binding rings, no pencil.

Layer 4: one pizza slice resting on the right-hand page: a triangle with its point facing down and just touching the page, and a curved crust edge at the top. Draw the crust as one outer arc and one second arc just inside it to show crust thickness. The slice is about 33% of the image height tall and about 17% of the image width across at the crust, tilted about 10 degrees clockwise as if it was just set down, with its tip at about 59% from the left and 76% from the top. Outlined, filled #FDEDE3. No toppings, no pepperoni, no cheese, no face.

Layer 5: a single faceless right hand and forearm entering from the upper-right corner, pointing down and to the left at roughly 45 degrees. The forearm is a straight band about 12% of the image width wide that runs off the top edge and right edge of the image near the corner. A simple rounded-rectangle sleeve cuff crosses the forearm just before the wrist. The hand is seen from the back, wrist at about 75% from the left and 22% from the top. The thumb and index finger are open with a clear V-shaped gap about one finger-width wide, hovering about one finger-width above the crust of the slice and not touching it, as if just letting go. The other three fingers are curled, suggested by two short curved lines on the side of the hand. Outlined, filled #FDEDE3. Skin is not coloured. The hand is simple and geometric, not realistic.

Layer 6, small supporting marks in the same charcoal line: three small hollow circle outlines (about 1.5%, 2% and 2.5% of the image width in diameter) at about 49% from the left and 17% from the top, at 8% from the left and 77% from the top, and at 88% from the left and 79% from the top; three short straight tick marks about 3% of the image width long at irregular, non-parallel angles in the open space between the pizza circle and the slice, around 46 to 51% from the left and 43 to 57% from the top; and two tiny solid red #E63946 dots about 1.3% of the image width across, near the lower-left and lower-right corners.

The overall composition is one asymmetric cluster with about 45% of the image left empty: keep the lower-left, the upper-middle, and the right edge below the arm open. Visual hierarchy: the red disc and the hand-and-slice are the focal point, the green block anchors the bottom, the open circle and small marks are quiet.

Absolutely none of: faces, any second hand, any other person, children, uniforms, schools, backpacks, coins, money, rupee symbols, phones, pepperoni, toppings, pizza boxes, plates, pencils or pens, any text or numbers or handwriting, yellow, blue, teal, pink, purple, orange, gradients, shadows, glow, shading, texture, grain, paper texture, a frame or border, a table or ground, handshake, gears, shields, keys, envelopes, charts.
```

**Version B replacement for `[GHOST CIRCLE]`** (fully contained circle):

```
A large outline-only circle in the upper-left of the image, charcoal line, no fill, representing the whole pizza, diameter about 33% of the image width, centred at about 20% from the left and 28% from the top, fully inside the image with a clear margin on every side, nothing cropped. A wedge-shaped gap about 36 degrees wide is missing from its rim, centred on the lower right of the circle, facing toward the notebook, showing where the slice was taken from. The gap is a plain break in the circle line, with no radial lines.
```

**Optional fallback prompt (only if Q2 is answered "use the fallback").** Not written out in full here: it replaces layers 4 and 5 with a pizza slice, a pencil and the notebook placed side by side, equal in size, with a single hand holding the slice. I will write it once you confirm the fallback.

---

## 9. Asset handoff requirements

### 9.1 Where to put the files

Create this folder at the repository root, outside `src/` and `public/` (so nothing here ships to the site until I integrate it):

```
art/phase4c/
  trust-seal.svg
  gallery-viewfinder.svg
  closing-wedge-notebook.svg
  preview/
    trust-seal@2x.png
    gallery-viewfinder@2x.png
    closing-wedge-notebook@2x.png
```

Use exactly these names. The three SVGs are the assets. The PNGs are **only** for my visual check against the spec; they are not shipped.

### 9.2 Format requirements for each SVG

| Requirement           | Value                                                                                                                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Format                | Plain SVG, vector paths only. **No embedded raster images.** No fonts, no text, no filters, no gradients, no masks that require external files.                                                                                                              |
| Background            | **Transparent** (no full-canvas background rectangle).                                                                                                                                                                                                       |
| viewBox               | Trust seal `0 0 200 200` (1:1). Viewfinder `0 0 240 160` (3:2). Closing `0 0 400 300` (4:3). Other viewBoxes are fine if the aspect ratio matches exactly.                                                                                                   |
| Strokes               | Keep outlines as **strokes**, not expanded to filled outlines, so the live site can hold the rendered weight (1.75 px or 2 px) at every size. If your tool can only export outlined shapes, say so; the weight will then scale with size and I will flag it. |
| Colours               | Only the hex values in §1.3. Outlines `#1D1D1F`. No near-matches.                                                                                                                                                                                            |
| Opacity (Tier A)      | Keep charcoal as `#1D1D1F` with the stated opacity (35%, 40%, 45%) set as stroke opacity, **not** pre-blended. If your tool flattens opacity, use the §1.4 equivalents and tell me.                                                                          |
| Fills (closing piece) | Knock-out fills exactly `#FDEDE3`.                                                                                                                                                                                                                           |
| Grouping              | Group by layer if you can: blocks, ghost circle, notebook, wedge, hand, marks. Not required, but speeds integration.                                                                                                                                         |
| Size                  | Under 50 KB each if possible.                                                                                                                                                                                                                                |
| Cleanliness           | No stray points, no hidden objects, no off-canvas junk. Intentional crops (closing piece forearm; Version A ghost circle) simply extend past the viewBox.                                                                                                    |

### 9.3 What I will and will not do after you drop them in

- I will inline each SVG as a React component under `src/components/illustrations/` (the existing pattern; `<img>` cannot use the page's colour tokens), set `aria-hidden`, and wire it into the existing slots. The audit's rule that **artwork must not use hard-coded hex** means I will convert your hex values to the matching CSS tokens; this is a mechanical substitution, not a visual change.
- I will **not** redraw, retouch, re-space, re-weight or recolour anything. If something is wrong I will tell you and you regenerate.
- I will run the guardrail test (no `<text>`, no gradients, `aria-hidden`, element ceiling) and the 375/768/1024/1440 overflow check, and report.
- The placeholder components currently in the working tree (`TrustSeal.tsx`, `ViewfinderMark.tsx`, `WedgeOnNotebook.tsx`) will be replaced by yours.

### 9.4 If you can only produce PNGs

State this when you drop them in. I cannot integrate a raster as a final asset without conflicting with the audit's production rule (§6: tokens only, scale cleanly, no extra requests). I would trace it to SVG, which **is** redrawing and needs your explicit approval first.

---

## 10. Open decisions

Only items that genuinely block or change the artwork are listed. Where I recommend an answer, I say so; none of these have been silently decided.

| #   | Decision                                                                                                                                                                                                                                                                                                                                                   | Recommendation                                                                                                                                                              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | **How are the two Tier A marks made?** An image generator cannot hold 1.75 px strokes, 35% to 45% opacities, or exact arc angles. A vector tool (Figma, Illustrator, Inkscape) can. Prompts 8.1 and 8.2 are provided, but may give you results needing manual correction.                                                                                  | Use a vector tool for the seal and viewfinder; use the generator only for the closing piece. If you want the generator anyway, treat outputs as drafts to correct.          |
| Q2  | **Hand pose.** Confirm the hand-based concept (hand releases a wedge onto the notebook; thumb-and-index pinch), or switch to the audit's **fallback** (the hand holds the wedge beside an equal-sized pencil and notebook, "exchange rather than placement"). The hand is the riskiest element to generate and the previous attempt was the most disliked. | Keep the concept; if the generator cannot produce a clean, faceless, geometric hand after a few tries, adopt the fallback rather than accept a realistic or malformed hand. |
| Q3  | **Ghost circle:** Version A (cropped by the upper-left edge, per the 4C audit) or Version B (fully contained, my earlier deviation). I found the cropped version read as stray arcs with a nearly invisible gap, and recommended B.                                                                                                                        | Version B, but it is a change to the audit. Version A is the locked default in the prompt.                                                                                  |
| Q4  | **Small `EchoMark` weight** (96 to 112 px, Gallery empty state): keep 1.75 px, or use a compact 1.25 px below 128 px.                                                                                                                                                                                                                                      | Compact 1.25 px below 128 px. Code only, no new artwork.                                                                                                                    |
| Q5  | **About hero mark** reuses the Mission's `EchoMark`. Accept, or commission a new quiet composition (not eight arcs, per I4/I5). Only this would create a fourth artwork.                                                                                                                                                                                   | Accept for now; revisit only if you see Home and About as too alike.                                                                                                        |
| Q6  | **C5 compact mobile closing piece** (about 240 px, visible below `md`). The audit recommends it, but it was never approved, so slots stay hidden on phones. If approved, the same SVG is reused (no new artwork); only the slot changes.                                                                                                                   | Approve; it needs no extra artwork.                                                                                                                                         |
| Q7  | **Gallery photo-print variant** (yellow accent) of the closing piece. Deferred; if you want it, it needs a fourth asset.                                                                                                                                                                                                                                   | Defer until the base closing piece is approved.                                                                                                                             |
| Q8  | **Viewfinder aptness:** the Gallery photos' content is unknown (audit G-3). "Framed moments" is assumed.                                                                                                                                                                                                                                                   | Proceed; low risk.                                                                                                                                                          |
| Q9  | **Confirm "unframed, no tinted plate"** for the seal, viewfinder and closing piece (audit C2). It is implemented that way already.                                                                                                                                                                                                                         | Confirm.                                                                                                                                                                    |
| Q10 | **Closing piece dots:** two solid red dots (consistent with the motif rules) versus the audit's "two small dots (one red)". Cosmetic.                                                                                                                                                                                                                      | Two red dots.                                                                                                                                                               |
| Q11 | **Seal's green arc weight:** the single accent at 1.75 px is subtle on cream. Allow it slightly heavier, or keep one weight per piece (the locked rule).                                                                                                                                                                                                   | Keep one weight; accept the subtlety.                                                                                                                                       |

### Completeness check (every new artwork)

| Requirement                        | Trust seal | Viewfinder | Closing piece |
| ---------------------------------- | ---------- | ---------- | ------------- |
| Exact composition description      | §3.3       | §4.3       | §5.3          |
| Exact colour guidance              | §3.5, §1.3 | §4.4, §1.3 | §5.5, §1.3    |
| Dimensions and aspect              | §3.2, §3.8 | §4.2, §4.7 | §5.2, §5.8    |
| Explicit exclusions                | §3.6       | §4.5       | §5.6          |
| Copy-paste generation prompt       | §8.1       | §8.2       | §8.3          |
| LOCKED / INFERRED / OPEN separated | §3.9       | §4.8       | §5.9          |
