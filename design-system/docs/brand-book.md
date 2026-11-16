S1P — Sacrifice One Pizza — is a charitable initiative. Its visual world is **a playful illustrated world with geometric editorial structure**: warm cream pages, flat colour-blocked people on a dark crust ground line, a pizza that is always missing one slice, and motion that tells a short story once and then lets you read. Pizza is the starting point of the palette and the motifs; the subject is always people, generosity and what contributions became.

## Principles

1. **Care first, then ask.** Every page earns attention with the mission and real evidence before the contribution action takes centre stage — but the action is never more than one screen away.
2. **Show, don't claim.** Only verified figures, consented photos and real quotes. Unknown facts appear as visible `[placeholders]`, never as plausible inventions.
3. **One missing slice.** The brand's signature: the pizza disc with a single slice gone (the `motif-disc`, the hero scene, the stat and timeline marks). The slice is what someone gave.
4. **Playful, not childish.** Geometric construction, a Swiss grid, restrained colour per composition. Characters gesture; they don't mug.
5. **Motion with a beginning and an end.** Scenes rise in once, figures settle on their real values, then everything is still.
6. **The donation path is the calmest place on the site.** Expression drops, controls lead, every state is explicit.

## Voice and content

- Warm, plain and specific. Short sentences. "We", "you". Sentence case everywhere, including buttons.
- Verbs first on actions: "Contribute now", "See our impact", "Try again". The final button names the amount: "Contribute ₹1,000".
- No guilt, no urgency, no countdowns, no exclamation marks in system messages, no emoji.
- Never pair an amount with an outcome ("₹500 = 10 meals") unless S1P has verified and approved that exact relationship.
- Never fabricate testimonials, beneficiary stories, partners or certifications. Illustrations are illustrative — never caption a drawing as a real event, and never use one in place of documentary evidence.
- Describe people with dignity: activities and roles, not hardship. Identify beneficiaries only with recorded consent.
- Confirmation copy says only what the payment system confirmed.
- Placeholder convention: square brackets and the `placeholder` Badge. Nothing in brackets ships.

## Colour

Five ingredients, in this order of presence: **mozzarella cream** (the page), **crust brown** (text and line), **tomato** (identity and action), **golden cheese** (warmth and celebration), **basil** (growth and success). Soft rose is the storytelling ground.

- Pages sit on `color-background-canvas`; alternate bands use `color-background-surface`; story bands `color-background-story`; cards, inputs and dialogs `color-background-elevated`; the closing call-to-action band and footer `color-background-inverse` (add the `s1-inverse` class so the focus ring turns gold).
- Text is `color-text-primary`; supporting text `color-text-secondary`; tomato text (`color-text-brand`) only for links, eyebrows and short emphasis.
- `color-action-primary` (tomato-600, white label 5.8:1) is the only fill for the contribution action. The identity tomato `palette-tomato-500` is for shapes, illustration and display type 24px+ — it is 4.3:1 with white, so never put small white text on it.
- Gold (`color-brand-highlight`) is never text on light grounds; text on gold is always `palette-crust-900` (8.8:1).
- Basil and gold are accents: a page is roughly 70% cream/neutral, 15% crust (type and line), 10% tomato, 5% gold and basil together. A single section uses one accent colour plus tomato, not all four.
- Feedback colours always travel with an icon and words: success basil + check, warning gold-700 + triangle, error tomato-700 + circle, information oven-ink + "i".
- Dark theme swaps the semantics, not the brand: dark crust canvas, cream text, a lighter tomato with dark labels, gold focus ring. Illustrations keep their colours on `color-illustration-plate`.
- Every text token's note names the grounds it passes 4.5:1 on, in both themes.

## Typography

- **Sora** (display family) for headings, the hero and figures: geometric, Bauhaus-adjacent, tight but never cramped. **Manrope** (text family) at 500 for reading, 650–800 for labels, nav and eyebrows. Mono only for admin identifiers.
- Scale: `display-hero` (homepage only) → `display-page` (page titles) → `heading-1` (sections) → `heading-2` → `heading-3` (components) → `body-lg` (leads) → `body` → `body-sm` → `caption`. Interface: `label`, `nav`, `eyebrow` (uppercase, tracked), `message`. Numbers: `figure-xl`, `figure-md`, tabular.
- Display and heading sizes are fluid; the token holds the desktop maximum and its note gives the `clamp()` (bundle.css applies them).
- Measure: running text ≤ `layout-text` (≈68ch); leads ≤ 60ch; hero headline ≤ 12ch per line, balanced.
- One eyebrow per viewport. Never set body copy in Sora or headings in Manrope.
- Emphasis inside a display headline: one word in a gold marker block (`<em>` in HeroSection), never colour alone.

## Layout and grid

- 12 columns ≥ `bp-lg` (1024), 8 at `bp-md` (768), 4 below; gutters `layout-gutter` (16px on mobile); margins `layout-margin-desktop` / `layout-margin-mobile`; content ≤ `layout-max`.
- Swiss grid as the skeleton, broken on purpose: illustrations may bleed `space-8` past the content edge or off the page; story slabs may overlap the band above with `radius-slab` tops. Text never leaves the grid.
- Compositions are asymmetric: 5/7 or 7/5 splits, art and copy alternating sides down a page. Avoid three equal cards as the default section.
- Section rhythm: `space-24` between sections on desktop, `space-16` on mobile; `space-12` from a section heading to its content; `space-10` between illustration and text.

## Shape

- Each radius means something: `radius-ticket` labels and checkboxes · `radius-input` fields · `radius-chip` amount chips and gallery tiles · `radius-card` cards, dialogs, alerts · `radius-slab` illustration plates and story bands · `radius-pill` buttons and status pills only.
- Circles and half-discs come from the pizza: stat marks, timeline markers, the wordmark pill, hill shapes in scenes.
- Ink borders (`border-sticker`, 3px crust) mark stickers: the selected amount, the quote mark, numbered steps, timeline markers.

## Surfaces and elevation

- Flat colour fields first. Depth comes from layering flat shapes, not blur.
- `shadow-offset` (a hard 5px crust offset) is a graphic device for stickers — the selected amount chip and the hero CTA — at most two per viewport. Buttons grow `shadow-offset-sm` only on hover.
- `shadow-float` only for things that float: dialogs, menus, the mobile nav sheet.
- No glassmorphism, no decorative gradients, no generic floating-card stacks.

## Iconography

- One functional set (the Icon component; `Icons` asset group): 24px grid, `stroke-icon` 2px, round caps and joins, outlined, `currentColor`.
- Two S1P glyphs extend it: `give` (hand offering a heart) and `slice`.
- Brand motifs (`Motifs` asset group) are for expression and never stand in for functional icons; functional icons never decorate.
- No emoji anywhere in the interface.

## Logo and wordmark

- No logo file was available when this system was made. Until it is, the header uses a type-only stand-in: "S1P" in Sora 800 on a `color-brand-primary` pill plus "Sacrifice One Pizza" in Sora 700. Do not redraw or approximate the existing logo; drop it into a `Logos` asset group when supplied and replace the stand-in.
- Clear space around any mark: at least the height of its "S". On dark grounds the pill stays tomato and the name turns cream.

## Accessibility

- Target WCAG 2.2 AA. Text pairs meet 4.5:1 (3:1 for 24px+), controls and focus 3:1, in both themes.
- Focus: `focus-ring` everywhere — a 2px gap in the ground colour, then a solid 3px crust ring (gold in dark and on inverse bands).
- Touch targets ≥ `layout-touch` (44px). Amount chips are 64px tall.
- Meaning never by colour alone; status always has an icon and a word.
- Meaningful illustrations get concise alt text (each scene has one); decorative ones are hidden. Content never waits for an animation; `prefers-reduced-motion` gets the final frame.
- Forms: visible labels, "Required"/"Optional" in words, errors beside the field and in a summary, input kept after errors.

## Using this system

- Load `tokens.css`, the two font files, `components/bundle.css`, React 18, then `components/bundle.js` → `window.S1P` (Button, NavBar, HeroSection, Illustration, AmountSelector, TextField, Select, Checkbox, ContributionSummary, Alert, ImpactStat, Timeline, GalleryGrid, Accordion, StoryQuote, EmptyState, Skeleton, Dialog, PublishStatus, AdminTable, Icon, Badge, Wordmark).
- Type styles are classes named after their tokens (`display-hero`, `body`, `caption`…).
- Illustrations: use `S1P.Illustration` on the web (it loads the PNG scenes in the `Illustrations` group); use the PNG and motif SVG files directly elsewhere.
- Read the sections that follow for the illustration system, motion, page art direction and the implementation handoff.
