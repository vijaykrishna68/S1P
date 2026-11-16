# Implementation handoff

## Tokens

- `tokens.json` is the single source. Primitives are `palette-*` (and `illo-skin-*`); everything a component uses is a semantic `color-*` token aliased to a primitive per theme. Components reference semantic tokens; primitives appear directly only where a value must not change between themes (gold sticker fills, crust ink on gold, illustration colours).
- CSS custom properties keep the token names: `--color-action-primary`, `--space-6`, `--radius-card`, `--motion-duration-standard`, `--motion-ease-emphasized`, `--font-display`. Themes: `[data-theme="light"]` (default) and `[data-theme="dark"]`. Map them onto the project's existing styling system rather than renaming the codebase.
- Fluid type: tokens hold the desktop maximum; the `clamp()` in each style's usage note is the responsive rule.
- Grid: 12 / 8 / 4 columns at `bp-lg` / `bp-md` / below.

## Interaction lifecycles

| Element | Sequence | Visual | Keyboard | Screen reader | On failure |
| --- | --- | --- | --- | --- | --- |
| Primary contribute button | default → hover → focus → pressed → loading → success / error | lift + offset on hover; sink on press; spinner, width held; basil + check on success | Enter/Space; focus ring always visible | `aria-busy` while loading; result announced by the Alert, not the button | button returns to default; error Alert above the step; data kept |
| Amount selection | unselected → hover → focus → selected → error | gold sticker + check badge + ink border when selected | arrows move, Space selects (native radios) | fieldset legend names the group; error linked by `aria-describedby` | unselected chips get error borders; message below |
| Form field | default → focus → filled → invalid → corrected → submitted | ink border on focus; 3px error border + message when invalid | Tab order follows reading order | label, hint and error linked; `aria-invalid` | error summary Alert at top with links; focus moves to it; values kept |
| Gallery image | default → hover/focus → open → close | slight zoom on hover; ring on focus; Dialog lightbox | Enter opens; Esc closes; Previous/Next buttons; focus returns to tile | tile is "Open photo: [alt]"; dialog is labelled by the caption | lightbox shows Alert + retry if the full image fails |
| Admin publish | draft → saving → saved / failed → scheduled → published | PublishStatus pill; spinner while saving | buttons only, no hidden shortcuts | pill is `role="status"` | Failed pill + Alert with cause + Retry |
| Destructive admin action | trigger → confirm dialog → done / failed | destructive Dialog naming the item | focus trapped; Esc cancels | `alertdialog` | Alert; nothing deleted |

## Components

All live in `components/bundle.js` as `window.S1P.*`, styled by `components/bundle.css`, typed in `components/index.d.ts`, with a README of usage rules per component. The bundle is plain React 18 (no build step required); rebuild in the project's own stack if preferred, keeping class names or mapping them.

## Illustration assets

- Twelve approved scenes (S1P-ILL-001 to 012) are transparent PNG masters in the Illustrations group; ship the WebP `@1x`/`@2x` copies on the site and point `S1P.illustrationSources` at them.
- Still to commission when needed: an Impact header for each verified programme area, a social avatar built from the disc motif, and campaign stickers — generated with S1P-ILL-001 as the style reference and the cast as character reference.

## Accessibility checklist

Contrast pairs as noted on each token (AA in both themes); `focus-ring` on every interactive element; 44px targets; semantic headings in order; labels and error linking on every field; dialogs trap and return focus; status messages in live regions; alt text on meaningful scenes, decorative ones hidden; reduced-motion final frames; 200% zoom and 320px reflow without horizontal scroll.

## Technical notes

- Fonts: Sora and Manrope variable woff2, Latin subset only. Add the latin-ext subset if the rupee sign (₹) or other extended characters must render in the brand faces (they currently fall back to the system face).
- Animate transform and opacity only; IntersectionObserver for scroll triggers; no scroll listeners.
- Images: lazy-load gallery tiles, serve responsive sizes, keep the lightbox image separate from the thumbnail.
- The type-only wordmark is temporary; swap in the real logo asset when provided.

## Assumptions and open decisions

- **No project files were available.** This system was built from the brief alone: page list, donation flow, admin features, copy and figures are assumed and shown as `[placeholders]`.
- Currency shown as ₹ and number formatting as en-IN in previews — confirm S1P's currency and locale.
- Suggested amounts (250 / 500 / 1,000 / 2,500) are examples only.
- Headlines ("Give up one slice. Share a meal.", "Set one slice aside.", "Real days, real tables.") are proposed lines for S1P's review.
- Payment provider, receipt wording, recurring options and tax-receipt eligibility: unknown — keep whatever the existing flow supports.
- Existing logo: not reviewed — a logo refresh, if wanted, is a separate exploration.
- Pages assumed: Home, About, Impact, Gallery, FAQ, Contribute, Admin (Gallery, Impact figures, Contributions, Pages, Settings). Confirm against the real site.
- Dark theme is designed and contrast-checked; decide whether the public site ships it.
