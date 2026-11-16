# S1P components — usage rules

One section per component, copied from the design system. Props describe the reference implementation in `reference/bundle.js`; port the behaviour, states and rules, not the code style.


## Accordion

FAQ disclosure built on native `details`/`summary`: the plus turns into a gold × when open.

**Provide:** `items` (`[{q, a, open}]`).

- Questions in the visitor's words; answers short, with links to the detail.
- Content stays in the page for search and find-in-page.

## AdminScreen

The admin gallery screen: the same tokens, type, buttons, fields and feedback as the public site, with the expression turned down — no hero art, no stickers, no scroll motion, 14px tables.

- Navigation: a quiet surface sidebar; the active item is elevated with a 3px tomato edge.
- Every list shows its publish state with PublishStatus; failures get an Alert above the table and a Retry in the row.
- Deleting asks in a destructive Dialog that names the item.
- Illustrations appear only in empty states (static) and after a successful first setup.
- Keep the existing admin's sections and permissions; the sidebar labels here are examples.

## AdminTable

A dense, readable data table for admin lists — photos, contributions, impact entries.

**Provide:** `columns` (`[{key, label, align}]`, `align: 'end'` for numbers), `rows` (objects keyed by column; cells may be nodes), `caption` (also names the scroll region).

- 14px text, 10px row padding, sticky uppercase header, tabular numerals right-aligned, first cell is the row header.
- Row actions are tertiary icon buttons with labels; destructive actions open a Dialog.
- Wide tables scroll horizontally inside the rounded frame (keyboard-focusable region), never the page.
- No illustrations, no motion beyond hover tint.

## Alert

An inline message with icon, title, optional body and action: success, warning, error or information.

**Provide:** `tone`, `title` (the outcome in one sentence), `children` (what it means / what to do), `action` (a Button), `onDismiss` for non-critical messages.

- Errors use `role="alert"` (announced immediately); the rest `role="status"`.
- Every tone is identified by its icon and words, never colour alone.
- Payment wording: say only what the payment system confirmed. "Nothing was charged" appears only if the system can confirm it.
- Placement: form error summary at the top of the form; payment outcome replaces the form area; admin messages above the table they concern.

## AmountSelector

A radio group of amount chips, plus "Other amount", where the selected chip becomes an unmistakable gold sticker with an ink border, offset shadow and check badge.

**Provide:** `amounts` (the organisation's approved suggestions only), `currency` (symbol prefix, from the existing flow), `value` + `onChange` (or `defaultValue`), `label`, `hint`, `error`, `allowCustom` (default true), `otherLabel`, `customLabel`, `customHint` (e.g. the minimum), `onCustomChange`.

**States:** unselected (elevated, `color-border-strong`) → hover (ink border, lifts 2px) → focus (`focus-ring` around the chip) → selected (gold fill, 3px ink border, `shadow-offset`, check pops, `motion-ease-spring`, 220ms) → error (unselected chips get error borders, message with icon below, announced politely).

- Native radios underneath: arrow keys move the selection, Space selects, the legend names the group.
- Never attach outcomes to amounts ("₹500 feeds a family") unless S1P has verified and approved that exact relationship; use plain amounts otherwise.
- Never preselect the largest amount. Preselecting nothing, or the organisation's stated default, are both fine.
- Mobile: chips are at least 132px wide and 64px tall — two per row on small phones, three from `bp-sm`.

## Badge

A small ticket-shaped label (`radius-ticket`) for one or two words of status or category.

**Provide:** `children`, `tone` (`neutral` · `brand` · `success` · `warning` · `error` · `info` · `placeholder`), optional `icon`.

- Status tones always carry an icon as well as colour.
- `placeholder` (dashed) marks any content that is waiting for a verified fact — figures, quotes, dates. It must never ship to production.
- Not a button: badges are never clickable.

## Button

The tactile pill that carries every action; **primary** (tomato) is the contribution action and appears at most once per view.

**Provide:** `children` (verb-first, sentence case: "Contribute now", not "DONATE!"), `variant` (`primary` · `secondary` · `tertiary` · `destructive`), `size` (`sm` 40px · `md` 48px · `lg` 56px), optional `icon` / `iconEnd` (icon names from the Icon component), `href` to render a link, `loading` + `loadingText`, `success` + `successText`, `fullWidth` (mobile), `label` (required when icon-only).

**Lifecycle:** default → hover (lifts 2px up-left, ink border, `shadow-offset-sm` appears — the sticker peels) → focus (`focus-ring`, lift removed) → pressed (sinks 1px, offset gone, `color-action-primary-pressed`, `motion-duration-instant`) → loading (spinner, `aria-busy`, `aria-disabled`, label stays so width holds) → success (basil fill, check pops with `motion-ease-spring`) or back to default with an Alert explaining the error.

**Do**
- Use `lg` primary for the hero and the final submit; `md` elsewhere; `sm` only in the nav bar and admin toolbars.
- Keep one primary per view. Pair it with a `secondary` for the learn-more route.
- Say what happens: "Contribute [amount]" on the final step.

**Don't**
- Don't make a gold or basil "primary" — tomato means *act*.
- Don't disable the submit to signal missing fields; let people press and show errors.
- Don't animate the button while idle (no pulsing, no wiggle).
- `destructive` lives in admin only, always behind a confirmation Dialog.

## Checkbox

A 24px ticket-cornered box with a 44px hit area, for consent and independent options.

**Provide:** `label`, `hint`, `error`, native props (`checked`/`defaultChecked`, `onChange`, `name`, `required`).

- Consent is never pre-checked. Marketing consent and required acknowledgements are separate boxes.
- Checked = ink fill with a cream tick that pops in (`motion-duration-standard`, spring).
- The label text is the full statement; links inside it open in the same tab and are underlined.

## ContributionSummary

The receipt-like recap shown before the final submit: what will be paid, how often, and where the receipt goes.

**Provide:** `rows` (`[{label, value}]` — only details the flow actually collects), `total`, `totalLabel`, `note` (who processes the payment and what happens next, in the organisation's verified wording), `title`.

- The dashed rule above the total is the ticket-tear motif; keep it.
- Show exactly what the payment system will charge. Fees, recurring terms or tax-receipt eligibility appear only if the existing system supports and confirms them.
- Sits beside the form on desktop (sticky within the form column) and above the submit button on mobile.

## Dialog

A modal panel for confirmations and the gallery lightbox: focus moves in, Tab is trapped, Escape and the × close it, focus returns to the trigger.

**Provide:** `open`, `title`, `children`, `actions` (Buttons, safest first, the action last), `onClose`, `tone="destructive"` (role `alertdialog`), `wide` (lightbox).

- Destructive confirmations name the thing and the consequence; the destructive button repeats the verb ("Delete photo", not "OK").
- Never use a dialog to interrupt the public contribution flow or to ask for a contribution.
- Enters with `motion-duration-emphasized` (scrim fades, panel rises `motion-distance-sm`).

## DonateFlow

The contribution journey in two steps with its processing, success and failure states — restrained next to the homepage: functional controls dominate, the illustration only reassures.

- Step 1: AmountSelector + Continue. Step 2: details + consent + the final button that names the amount ("Contribute ₹1,000") with the lock icon.
- Processing: the button holds its width, shows a spinner and "Processing your contribution…"; the form is not cleared or hidden.
- Failure: an error Alert at the top of the step, everything typed is kept, focus moves to the alert, retry is one press.
- Success: replaces the form; `success-celebrate` plays once; the heading receives focus; wording reflects only what the payment system confirmed.
- On mobile the summary sits above the form and the side illustration is dropped.
- The amounts, currency, provider and receipt wording are placeholders for the existing flow's real values.

## EmptyState

Illustration plus a short explanation and one next step, for empty lists and recoverable errors.

**Provide:** `title`, `body`, `action` (one Button), `illustration` (`empty-plate` for empty, `error-try-again` for recoverable errors, `looking-closely` for no search results), `compact` (stacked, centred — admin side panels).

- Say why it's empty and what happens next; never blame the visitor.
- The illustration is decorative here — the words carry the meaning.

## GalleryGrid

An editorial photo grid — every sixth tile a 2×2 feature, some tall — with captions and a lightbox.

**Provide:** `items` (`[{src, alt, caption, date}]` from the approved gallery), `inlineLightbox` (previews only).

- Photographs are documentary evidence: no filters, overlays, stickers or illustration on top of them. Brand presence comes from the frame — `radius-chip` corners, captions in `caption` style, illustrations *between* gallery sections, never over photos.
- Each tile is a button labelled "Open photo: [alt]". The lightbox is a Dialog: focus moves in, Escape closes, Previous/Next buttons, focus returns to the tile.
- Images lazy-load with a surface-colour placeholder; use the existing gallery's responsive sizes. Crop with `object-fit: cover` in tiles and show the full image in the lightbox.
- Loading: Skeleton tiles. Empty: EmptyState (`empty-plate`). Error: Alert with retry.
- Only photos with consent; avoid images where a beneficiary is identifiable unless that consent is recorded. Captions describe the activity, not someone's hardship.
- Mobile: two columns, features span both, tall tiles become square.

## HeroSection

The homepage opening: an editorial cover — headline, one lead line, the contribution action and the shared-table scene.

**Provide:** `title` (≤ 8 words; wrap one key word in `<em>` for the gold marker block (crust text on gold, 8.8:1 in both themes)), `eyebrow`, `lead` (the existing mission statement), `primaryLabel`/`primaryHref` (existing contribution route), `secondaryLabel`/`secondaryHref` (About or Impact), optional `note`, `illustration` (default `hero-shared-table`).

- Layout: 5/7 split on the 12-column grid; the art bleeds `space-8` past the content edge on desktop. Below 900px the art moves above the copy and the headline stays in the first viewport with the button.
- The headline in this preview is a *proposed* line for S1P's review, not existing copy.
- The primary CTA wears `shadow-offset` at rest here — the only button that does.
- The art (S1P-ILL-001, square S1P-ILL-002 below 900px) loads eagerly and rises in once; copy and button are never delayed.

## HomepageDesktop

The homepage told as six beats with the system's own parts: cover (HeroSection) → why it matters (story band + contribution scene) → what we've done (ImpactStat row) → real days (GalleryGrid) → how to help (steps + impact scene) → the closing tomato-on-crust call to action.

- Rhythm: canvas → story rose → canvas → surface → canvas → inverse. Never two tinted bands in a row.
- One primary per viewport: hero, then the closing band. The nav's Contribute stays available throughout.
- Copy in brackets is a slot for S1P's verified content; the headings are draft lines for review.

## HomepageMobile

The same homepage at 390px: art moves above the headline, splits stack, stats become a single column, gallery goes two-up, steps keep their sticker numbers.

- The headline and the Contribute button stay in the first screen together.
- Illustrations are recomposed by scaling the whole scene; no character is cropped out.

## Icon

Functional interface icons: 24px grid, 2px stroke (`stroke-icon`), round caps and joins, outlined only, drawn in `currentColor`.

**Provide:** `name` (one of `S1P.icons`), `size` (16 · 20 · 24; default 20), and `label` only when the icon stands alone and means something — otherwise it is hidden from assistive technology.

- Icons sit beside words; they do not replace them, except close, menu, previous/next and the admin edit/delete row actions (which carry an `aria-label`).
- Align to the text's cap height: 20px with 16–17px text, 16px with 13–14px text, gap `space-2`.
- Use the brand motifs (slice, sunburst, disc) for expression and these icons for function. Never use emoji in the interface.
- `give` and `slice` are S1P-specific glyphs; everything else follows the common shapes people already recognise.

## Illustration

Shows one of the twelve approved S1P scenes (S1P-ILL-001 to 012) as a transparent PNG on its cream plate, and fades it up once when it scrolls into view.

**Provide:** `name` (one of `S1P.scenes`: `hero-shared-table`, `contribution-pass-it-on`, `impact-many-hands`, `people-cast`, `set-aside-slice`, `welcome-to-the-table`, `success-celebrate`, `empty-plate`, `error-try-again`, `looking-closely`, `wandering-slice`), optional `label` (alt text; each scene has a plain default), `decorative` (empty alt when the copy beside it says everything), `priority` (eager load — the hero only), `animate` (`auto` default · `off`), `plate={false}` to drop the plate on light grounds (dark theme always keeps it, because the art's dark lines vanish on dark grounds).

**Sources:** each scene loads from this design system's Illustrations assets. On the live site, point them at your own files once, before rendering: `S1P.illustrationSources['contribution-pass-it-on'] = { src: '/illustrations/S1P-ILL-003_pass-it-on@2x.webp' }` (the hero also takes `mobile`), or pass `src` / `mobileSrc` per use.

**Motion:** the image is visible by default; when JavaScript arms it, it waits for 35% visibility, then rises `motion-distance-md` and fades in once (`motion-duration-entrance`). Reduced motion shows it immediately.

- `hero-shared-table` swaps to the square mobile composition (S1P-ILL-002) below 900px.
- Use the scene that matches the section's job — hero on the homepage only; `contribution-pass-it-on` beside the contribution form; `success-celebrate` only after the payment system confirms; `error-try-again` on recoverable failures; `empty-plate` for empty lists; `looking-closely` for no search results; `wandering-slice` for the 404 page.
- Size: hero 560–720px wide; section scenes 320–640px; spot scenes 200–320px. The masters are about 1,450px wide, so never render one wider than about 720px.

## ImpactStat

One verified figure, its label, period and source, with the slice-disc mark in the corner.

**Provide:** `value` (the exact display string, e.g. "12,480" or "12k+"), `countTo` (number, only for exact verified values), `label`, `period`, `source`, `exact` or `rounded`, `status` (`verified` default · `placeholder`), `tone` (`tomato` · `basil` · `gold` — decorative only), `size` (`xl` default · `md`).

- The count-up runs once, 1.1s ease-out, when half the card is visible, and lands on the real value. The real value is in the DOM from the start for screen readers; reduced motion shows it immediately.
- Never count rounded or "+" values. Never animate a figure upward to imply growth that the data doesn't show.
- Label, period and source stay visible — never hide them in a tooltip.
- Placeholder figures (`[000]`) carry a dashed badge and must be replaced with S1P's verified historical figures before launch.

## MotionSystem

A live board of the motion tokens — durations, the four easing curves — and the three signature illustration sequences, each replayable.

- Read it with the Motion section of the brand book: what moves, when, and what reduced motion shows instead.

## NavBar

The site header: plain-type S1P wordmark, up to five links, and the one persistent Contribute action.

**Provide:** `items` (`[{label, href, current}]` — use the site's existing pages and labels), `ctaLabel` and `ctaHref` (the existing contribution route), `homeHref`; `compact` forces the mobile layout.

- Desktop (≥768px): links right-aligned, active page underlined in tomato, hover underline grows in gold from the left (`motion-duration-standard`).
- Mobile: wordmark + menu button (44px). The sheet opens below the bar with `motion-duration-emphasized`, lists links at 19px and ends with a full-width primary button. `aria-expanded` and `aria-controls` are set; Escape and a route change should close it in the app.
- Sticky behaviour: the bar may stick (`z-nav`) but never shrinks or hides on scroll on the contribution page.
- Wordmark: there is no logo file in this system yet — the "S1P" pill in `color-brand-primary` plus the full name in Sora is a type-only stand-in. Replace with the real logo once it is provided; do not redraw it.

## PublishStatus

A status pill for admin content: Draft → Saving… → Saved → Scheduled → Published, or Failed to publish.

**Provide:** `state` (`draft` · `saving` · `saved` · `pending` · `published` · `failed`), optional `label`. Show only the states the existing system really has.

- It is a live region (`role="status"`), so changes are announced.
- `failed` always comes with an Alert explaining what failed and a retry.

## Select

A native select styled like TextField, with a chevron icon.

**Provide:** `label`, `options` (`[{value, label}]`), `placeholder` (an empty first option), `required`/`optional`, `hint`, `error`, native props.

- Use for 5–15 options; fewer than 5 → radio buttons; more than 15 → a searchable field.
- Keep the native element: it brings the platform picker on mobile and full keyboard support.

## Skeleton

Shimmering placeholder blocks shaped like the content that is loading.

**Provide:** `lines`, `media` (an image block on top), `label`.

- Show after 300ms of waiting, never for content already on the page. Reduced motion: no shimmer.
- Never on the payment step — use the Button's loading state there.

## StoryQuote

A rose storytelling slab with the tomato quote sticker, for one real, consented voice.

**Provide:** `quote` (≤ 40 words), `attribution`, `role`, `verified` (true only when the quote is real and consented — otherwise a placeholder badge shows).

- Never invent testimonials or beneficiary stories. No quote? Leave the component out.
- Never name or identify a beneficiary without explicit consent; first names or roles are often enough.

## TextField

Labelled input or textarea with hint, inline validation and an optional prefix (currency).

**Provide:** `label` (always visible — never placeholder-only), `required` or `optional` (written as a word, not an asterisk), `hint`, `error` (a sentence that says how to fix it), `success`, `prefix`, `multiline`, and any native input props (`type`, `autoComplete`, `inputMode`, `value`, `onChange`…).

**Lifecycle:** default (2px `color-border-strong`) → hover (ink) → focus (ink + `focus-ring`) → filled → invalid (3px `color-feedback-error` border, message with icon, `aria-invalid`, message linked by `aria-describedby`) → corrected (error clears on the next valid blur; optional success line) → submitted.

- Validate on blur and on submit, not on every keystroke. Keep everything the person typed after an error.
- On submit with errors, show an Alert (`tone="error"`) at the top listing each problem as a link to its field, and move focus to it.
- Inputs are 52px tall, 17px text (prevents mobile zoom), `radius-input`.

## Timeline

A vertical milestone list with slice-disc markers, for the origin story and yearly milestones.

**Provide:** `items` (`[{date, title, body, current, placeholder}]`) from S1P's documented history only.

- 3–8 items. Newest last on About (it's a story), newest first on Impact (it's a record) — pick one per page and say which in the heading.
- On scroll, items may rise in with `motion-stagger-standard`; the text is never hidden waiting for scroll.
