# Claude Code prompt — S1P redesign: implement the S1P design system

Paste everything below the line into Claude Code, started in the repo root (`D:\S1P\project\S1P`).

---

You are implementing a complete visual redesign of the Sacrifice One Pizza (S1P) website in this repository. The redesign is already designed and approved. Your job is to apply it to the real codebase without changing what the site does. Work in phases, stop for my approval after planning, and keep every existing behaviour, data source, API contract and test intact.

## 1. What you are working with

**This repo (the source of truth for behaviour and content).**

- Vite 8 + React 19 + TypeScript + Tailwind CSS v4, a multi-page build. The entries are `index.html`, `about.html`, `gallery.html` and `admin.html`; there is no router.
- Vercel serverless functions live in `api/`. Drizzle and Postgres live in `db/`. Shared limits live in `shared/`. Tests run on Vitest, and CI is `.github/workflows/ci.yml`.
- `CLAUDE.md` is the project rulebook: design principles, donation-flow UX rules, architecture, decision log, performance, accessibility and phase status. `Docs/` holds the PRD, project context and the Phase 1–4D specs and audits.
- The current visual layer comes from Phases 4A–4D:
  - Outfit + Plus Jakarta Sans via `@fontsource`.
  - The `@theme` colours in `src/styles/index.css`.
  - `@phosphor-icons/react`.
  - The Phase 4C illustrations: `src/assets/illustrations/*`, `src/components/illustrations/*` and `art/phase4c/`.
  - The "Gathering Point" hero animation in `src/components/hero/`.
  - The Phase 4B motion values.

**The new design system (the source of truth for visuals): `design-system/`.**

- `tokens/tokens.json` is the canonical tokens. `tokens/tokens.css` is compiled from it: light and dark themes, spacing, radii, shadows, motion, layout, the type classes and `@font-face`.
- `fonts/` holds Sora (display) and Manrope (text) as variable woff2 files, with their OFL licences.
- `docs/brand-book.md` covers principles, voice, colour, type, layout, shape, surfaces, icons and accessibility.
- `docs/01-illustration.md`, `02-motion.md`, `03-pages-and-admin.md` and `04-handoff.md` cover the illustration system, motion system, page art direction, and the handoff: interaction lifecycles and open decisions.
- `docs/components.md` gives usage rules, states and do's and don'ts for every component and page composition.
- `reference/bundle.js` and `reference/bundle.css` are a working React reference implementation of every component. `reference/index.d.ts` holds its prop types, and `reference/previews/*.html` holds its component and page previews. Port the behaviour, states and styling; do not copy the code style or load the bundle at runtime.
- `assets/icons/*.svg` is the 26-icon interface set: 24px grid, 2px stroke, round caps. `assets/motifs/*.svg` holds the 8 brand motifs.
- `illustrations/*.webp` holds the 12 approved scenes, S1P-ILL-001 to 012, each at `@1x` and `@2x`, all transparent.

**Precedence when they disagree.** Real behaviour, data, copy and API contracts in this repo always win over anything the design-system docs assumed. Those docs were written before the repo was available, so they contain placeholders and assumptions that do not apply here. Examples: a card-payment contribution summary, receipt emails, `[000]` impact figures, sample amounts 250/500/1,000/2,500, proposed headlines like "Give up one slice. Share a meal.", and an assumed page list. Use the repo's real versions: the UPI QR + screenshot flow, `IMPACT_FIGURES`, `shared/donationLimits.ts` (including the encouraged ₹300 amount), the Phase 4D copy, the testimonials and FAQ data, and `aboutData.ts`. List every conflict you find in the plan.

## 2. Non-negotiable rules

1. **Don't change what the site does.**
   - Do not change API routes, request or response shapes, DB schema or migrations, `shared/*` limits, the donation reducers (`donationReducer`, `confirmationFormReducer`), `donationService`, the UPI URI/QR generation, or the upload handling and validation.
   - Do not change admin auth or permissions.
   - Restyle and restructure markup only.
2. **Keep content and copy.**
   - Keep the approved Phase 4D copy.
   - Never invent figures, testimonials, beneficiaries, partners or events. If a design needs content that doesn't exist, leave a clearly marked TODO and list it in your report; never ship a fabricated value.
3. **Tests.**
   - All existing tests must keep passing.
   - When markup changes break a selector, update the selector and keep the behavioural assertion.
   - Never delete or weaken a test to make it pass.
   - Add tests for new components and states.
4. **Accessibility.** Apply whichever is stricter of CLAUDE.md §8 and the design-system docs:
   - WCAG 2.2 AA.
   - The token contrast pairs exactly as their usage notes state.
   - The `focus-ring` on every interactive element.
   - 44px touch targets.
   - Labelled fields, with errors linked by `aria-describedby`.
   - Live regions for status.
   - Dialogs that trap and return focus.
   - Full `prefers-reduced-motion` support.
5. **Performance** follows CLAUDE.md §7.
   - No new runtime dependencies without asking me. Dev-only tooling is fine if you justify it.
   - Keep the public bundle no larger than today; measure before and after.
   - Animate transform and opacity only.
   - Lazy-load every illustration except the hero.
6. **Git.**
   - Work on one branch per phase, created from an up-to-date `main`.
   - Use small, focused commits in the existing conventional style (`feat:`, `fix:`, `style:`, `docs:`, `test:`).
   - Never add "Co-Authored-By: Claude" trailers or any other AI-attribution lines to commit messages or PR descriptions.
   - Do not push, merge or open PRs unless I ask.
7. **Deleting.** Ask before deleting anything outside the visual layer. Remove old visual code (fonts, theme colours, phosphor icons, Phase 4C art, the old hero animation) only once `grep` shows no remaining references, and list what you removed.
8. **Keep CLAUDE.md true.** Update it as you go: replace §3 with the new system, add Decision Log entries for each meaningful choice, and add Phase 5 to Phase Status. Leave the `Docs/PHASE4*` files as history.

## 3. Phase 0 — read and plan (no code changes)

Read, in full:

- `CLAUDE.md`
- `README.md`
- `Docs/PRD.md`, `Docs/PROJECT_CONTEXT.md` and `Docs/02UI_UX.md`
- `Docs/PHASE1_IA_PROPOSAL.md`, `PHASE2_ABOUT_SPEC.md` and `PHASE3_GALLERY.md`
- All the `Docs/PHASE4*` files
- Every file in `design-system/docs/`
- `design-system/reference/bundle.css` and `design-system/reference/index.d.ts`
- Every component under `src/`

Then write `Docs/PHASE5_REDESIGN_PLAN.md` containing:

1. **Inventory and mapping.** A table of every existing component, page and section, its design-system counterpart, and the action: restyle, replace, new or retire. Cover Header, Hero, SectionDivider, Mission, Impact/ImpactStat, DonationSection and its four steps, CopyUpiButton, ScreenshotUploader, FormField, Testimonials, FAQ, Footer, ClosingBand, TwoTrack, IllustrationSlot, Dialog, Button, TextLink, Container, the About components, the Gallery components and the admin pages.
2. **Token mapping.**
   - Map each old `@theme` colour, font, easing, spacing tier and Phase 4B duration to its new token.
   - Give the exact Tailwind v4 `@theme` block you will write.
   - Flag every old value with no clean equivalent.
3. **Illustration placement.**
   - Give the scene for every slot, confirming or adjusting the suggestions in §6.
   - List the old art and animations you will retire.
4. **Conflicts** between the design-system docs and the real repo, with what you will do about each.
5. **Open decisions** for me, each with your recommendation (§9).
6. **Phase and branch plan** with the files each phase touches.
7. **Risks** and how you'll verify each one.

**Stop here and wait for my approval before writing code.**

## 4. Phase 5A — foundations (branch `phase5a-foundations`)

- **Fonts:** add `Sora-Variable.woff2` and `Manrope-Variable.woff2`, self-hosted the same way the current fonts are, with `font-display: swap`. Include the OFL licence files. Remove `@fontsource/outfit` and `@fontsource/plus-jakarta-sans` only in the cleanup step, once nothing uses them.
- **Tokens:**
  - Bring `design-system/tokens/tokens.css` into `src/styles/` as a generated file.
  - Add a small `scripts/build-tokens.ts` (run with `tsx`) that regenerates it from `design-system/tokens/tokens.json`, so `tokens.json` stays the single source.
  - Keep the token names: `--color-action-primary`, `--space-6`, `--radius-card`, `--motion-duration-entrance`, and so on.
- **Tailwind v4:**
  - Expose the semantic tokens through `@theme inline`, so utilities resolve the CSS variables at runtime and follow the theme.
  - Cover: colours (canvas, surface, elevated, story, inverse, highlight, text primary/secondary/inverse/brand/on-primary, action primary/hover/pressed/secondary/disabled, the borders, and feedback colours with their soft variants); radii (ticket, input, chip, card, slab, pill); fonts (display, text, mono); shadows (offset, offset-sm, float, focus-ring); and easings (standard, exit, emphasized, spring).
  - Tailwind's default 4px spacing scale already matches `space-*`; use it.
  - Replace the old `@theme` colours once no code references them.
- **Themes:**
  - Light is `:root` / `[data-theme="light"]`; dark is `[data-theme="dark"]`.
  - Ship light only unless I approve dark (§9), but write every component so dark works purely through tokens.
- **Base layer:**
  - Body uses the canvas, `text-primary` and Manrope 500.
  - Add a global `:focus-visible` that applies `var(--focus-ring)`.
  - Add `.s1-inverse`, which switches the ring to gold on dark bands.
  - Add `sr-only`.
  - Add the fluid display sizes from each type token's usage note: `clamp()` for `display-hero`, `display-page`, `heading-1`, `heading-2` and `figure-xl`.
  - Use tabular numerals on figures.
- **Motion:**
  - Point `usePrefersReducedMotion`, `useScrollReveal` and `useCountUp` at the motion tokens: durations 80/140/220/360/560/900/1400ms, the four easings, staggers of 40/80/160ms and distances of 8/24/64px.
  - Retire the Phase 4B-only values.
  - Add a global reduced-motion rule: no travel or scaling, final states only, and the spinner keeps turning slowly.

## 5. Phase 5B — components (branch `phase5b-components`)

Port each component into the repo's own conventions: typed React 19 TSX, Tailwind plus token utilities, and colocated tests. Use `docs/components.md` and the lifecycle table in `docs/04-handoff.md` as the spec, and check `reference/bundle.css` for exact values.

- **Button:**
  - Variants: primary (tomato-600, the one contribution action per view), secondary, tertiary and destructive (admin only, always behind a Dialog).
  - Sizes 40, 48 and 56px; pill shaped.
  - Hover: lift 2px up-left, ink border and `shadow-offset-sm`. Pressed: sink 1px, `color-action-primary-pressed`, 80ms.
  - Loading: spinner, `aria-busy`, width held. Success: basil fill and check.
  - Also supports icon-only (requires a label) and `href`.
  - Update the existing `Button` and `TextLink` in place; keep their tests.
- **Icon:**
  - Inline SVG components generated from `design-system/assets/icons/*.svg`, using `currentColor` and `aria-hidden` unless labelled.
  - Replace every `@phosphor-icons/react` usage, then remove the dependency.
  - If a needed glyph is missing from the set, draw it in the same grid and stroke, or ask me.
- **Badge** (including the dashed `placeholder` tone for TODO content), **Alert** (success, warning, error and info, always with an icon and words; errors use `role="alert"`), and **Dialog**: restyle the existing one and keep its focus behaviour.
- **Form fields:**
  - Restyle `FormField` to the TextField spec: 52px tall, 17px text, the label always visible, "Required" and "Optional" written as words, a 3px error border, and the message with its icon linked by `aria-describedby`.
  - Add Select and Checkbox where the forms need them. Keep `confirmationFormReducer` validation exactly as it is.
- **AmountSelector:**
  - Restyle `AmountStep` as native radios.
  - The selected chip becomes a gold sticker: 3px ink border, `shadow-offset` and a check badge.
  - Keep the "Other amount" input.
  - Use the real amounts and rules from `shared/donationLimits.ts` and `DONATION_CONFIG`. ₹300 stays an encouraged amount, not a minimum (see the latest commit). Above-limit and contact messaging stays as it is.
- **Payment step (UPI):**
  - Put the QR on a warm-white card with an ink border.
  - Copy UPI ID uses the secondary Button with a copied state announced politely.
  - Keep the UPI deep link, payee details and every instruction from Phase 4D.
  - The calm, restrained treatment from `docs/03-pages-and-admin.md` applies to the whole contribution flow.
- **ScreenshotUploader:**
  - Restyle every state the hook exposes (idle, drag-over, selected, uploading with progress, success, error with retry) with Alert and Button.
  - Do not touch the upload logic or magic-byte validation.
- **ImpactStat:**
  - Restyle with the slice-disc corner mark.
  - Count up only exact values. `₹29L+` and `55+` are rounded or "+" values, so they render static, per the docs; confirm with `impactFigures.ts` and `useCountUp`.
  - Label, period and source stay visible, and the real value is in the DOM for screen readers.
- **Timeline:** About's `JourneyTimeline`, with slice-disc markers.
- **Accordion:** the FAQ on native `details`/`summary`, where the plus turns into a gold ×.
- **StoryQuote:** the existing verified testimonials only, on a rose slab with the tomato quote sticker. Keep the Testimonials transition approach in CLAUDE.md §5 unless it conflicts with reduced motion.
- **Gallery:**
  - GalleryGrid with every sixth tile a 2×2 feature and some tall tiles; two columns on mobile.
  - Each tile is a button labelled "Open photo: …", with a caption and date.
  - The lightbox is the Dialog with Previous and Next.
  - Keep `galleryApi` and pagination exactly as they are.
- **Feedback:** EmptyState, using illustrations 009, 010 and 011, and Skeleton tiles shown after 300ms, with no shimmer under reduced motion.
- **Header:** NavBar with the plain-type wordmark stand-in — "S1P" on a tomato pill plus "Sacrifice One Pizza" — and links with a gold hover underline and a tomato underline on the current page. Contribute is the only primary button. On mobile, a 44px menu button opens a sheet with `aria-expanded` and closes on Escape. **Footer** and **ClosingBand** become the inverse crust band.
- **Admin:** PublishStatus pills (only the states the system really has) and AdminTable: 14px, a sticky uppercase header, tabular numbers, and labelled icon row actions. Destructive actions go through a destructive Dialog.
- **Retire or fold in:** TwoTrack, IllustrationSlot, SectionDivider, `EchoMark`, `EightSlicesMark` and the Phase 4C illustration components, unless the plan shows a page still needs them restyled.

## 6. Phase 5C — illustrations (branch `phase5c-illustrations`)

- Copy `design-system/illustrations/*.webp` into `src/assets/illustrations/s1p/` so Vite fingerprints them.
- Build one `<Illustration name>` component:
  - `srcSet` for `@1x 1x, @2x 2x`, intrinsic `width` and `height`, and `decoding="async"`.
  - `loading="lazy"`, except `priority` (the hero only) gets eager loading and `fetchpriority="high"`.
  - Alt text from the table below, or `decorative`, which gives an empty alt.
  - A cream plate (`color-illustration-plate` with a `radius-slab` corner) by default, or `plate={false}` on light grounds. In dark theme the plate is always on, because the art's dark lines vanish on dark grounds.
  - A one-time entrance: an IntersectionObserver at 35% visibility, then rise 24px and fade over 560ms with `ease-emphasized`. It never replays on scroll-back, has no motion under reduced motion, and the image is fully visible if JavaScript fails.
  - The hero swaps to the square mobile scene below 900px via `<picture>`.
- Placement (suggested; confirm in the plan):

| Scene | Files | Where in this repo | Alt text |
| --- | --- | --- | --- |
| hero-shared-table | 001 (desktop), 002 (mobile) | `Hero` — replaces the Gathering Point animation; 5/7 split with the copy left | Four people around a large pizza with one slice missing; one passes that slice to another while a child cheers. |
| contribution-pass-it-on | 003 | `Mission` (copy left, art right) | One person hands a wrapped parcel to another; a dotted arrow arcs between them. |
| impact-many-hands | 004 | `Impact` beside the figures, or the `DonationSection` intro — pick one, not both. Keep it on its plate (its hill runs to the edges) | People build a staircase of colourful blocks while a plant grows from the top block. |
| people-cast | 005 | About — a "who's involved" strip, if About has that content | Eight people stand in a friendly row, including a child and a wheelchair user. |
| set-aside-slice | 006 | About `OriginStory` | A person sets one slice of pizza aside on its own plate in front of an empty chair. |
| welcome-to-the-table | 007 | Only if the site offers volunteering — otherwise unused | People at a shared table welcome a newcomer to join them. |
| success-celebrate | 008 | `SuccessStep`, only after the confirmation API returns success; admin first publish (optional) | A person celebrating with both arms raised in front of a golden sun. |
| empty-plate | 009 | Gallery empty state; admin empty lists | decorative |
| error-try-again | 010 | Gallery load error; admin failed upload | decorative |
| looking-closely | 011 | Only where a search or filter can return nothing (check the admin) | decorative |
| wandering-slice | 012 | A 404 page, only if I approve adding one (§9) | decorative |

- Use motifs from `design-system/assets/motifs/` sparingly: at most one per section, as dividers or stat marks, never on photos.
- Photographs and illustrations never share a frame.
- Retire `src/assets/illustrations/*.png`, `src/components/illustrations/*`, `art/phase4c/` and the Gathering Point CSS only after confirming nothing references them, and list them in your report.

## 7. Phase 5D — pages (branch `phase5d-pages`)

Compose each page from the new components following `docs/03-pages-and-admin.md` and the page previews in `reference/previews/` (HomepageDesktop, HomepageMobile, DonateFlow and AdminScreen). Keep the real section order and content.

- **Home** (`App.tsx`): Header → Hero → Mission → Impact → DonationSection → Testimonials → FAQ → Footer.
  - Alternate the bands: canvas, then story rose, then canvas, then surface. Never two tinted bands in a row.
  - Keep one primary button per viewport.
  - The hero headline and Contribute button must share the first screen at 390px.
- **Contribution flow** (Amount → Payment → Confirmation → Success):
  - The calmest part of the site: no confetti until success, and controls lead.
  - Keep the step indicator and every existing step, guard and error path.
  - Failure states get an error Alert at the top of the step, keep everything typed, and move focus to the alert.
  - On success, the heading receives focus and the wording says only what the API confirmed.
- **About:** OriginStory with 006, JourneyTimeline (newest first or last; keep the current order), TrustInfo, and the impact figures from the shared source.
- **Gallery:** the editorial grid with real captions and dates, plus loading, empty, error and pagination states. No overlays on photos.
- **Admin** (Login, Dashboard, SubmissionDetail, AdminGalleryPage):
  - The same tokens and components with the expression turned down: a surface sidebar or top bar, no hero art, no stickers, no scroll motion.
  - Use PublishStatus for submission and photo states, AdminTable for lists, and a destructive Dialog for deletes.
  - Show upload progress per file.
- **Responsive:** check 360, 390, 768, 1024 and 1280px. There must be no horizontal scroll, no clipped headlines, and no art covering controls.

## 8. Phase 5E — verify and clean up (branch `phase5e-qa`)

- Run `npx tsc -b`, `npm run lint`, `npm run format:check` and `npm test`, plus `npm run test:integration` if `DATABASE_URL` is set. Everything must pass, as CI requires.
- Run `npm run build` and compare bundle sizes per entry against `main`.
- Take screenshots of every page at 390, 768 and 1280px; in dark too, if approved. A dev-only Playwright script under `scripts/` is fine; mention it. Review the screenshots against the reference previews and fix what differs.
- **Keyboard pass** on every page: tab order, visible focus, the amount radios with arrow keys, dialogs, the mobile menu and the uploader.
- **Accessibility scan:** add `@axe-core/playwright` as a dev dependency if you want an automated check; ask first. Re-verify the contrast pairs in the token notes against what actually renders.
- **Reduced motion:** emulate `prefers-reduced-motion: reduce` and confirm there's no travel and that final states and real figures show immediately.
- **Lighthouse:** run it on Home, About and Gallery. Scores must be at least today's (record both).
- **Cleanup:** remove the dead fonts, colours, icon packages, art and CSS, and run `npm ls` to confirm the removed packages are gone.
- **Docs:** rewrite CLAUDE.md §3 for the new system, add Decision Log entries, update §7, §8 and §10 (Phase 5 status), and update the README content checklist with any TODO content.

## 9. Decisions to raise with me in the plan (with your recommendation)

1. Ship dark theme now, or light only? (Recommend light only for launch, with dark kept working via tokens.)
2. Add a 404 page as a fifth Vite entry with Vercel routing, using 012?
3. Does the site offer volunteering? If not, drop 007.
4. Headline copy: keep the Phase 4D copy (recommended) or adopt any design-system proposals?
5. Retire the Gathering Point hero animation entirely in favour of 001's one-time entrance?
6. Where 004 goes: Impact or DonationSection.
7. Confirm the font swap (Outfit + Plus Jakarta Sans → Sora + Manrope) and the icon swap (Phosphor → the S1P set).
8. Anything in the repo that contradicts the design system in a way you can't resolve.

## 10. How to report

At the end of each phase, give a short report covering:

- What changed, file by file in brief.
- What you verified, with the commands and results.
- Screenshots or their paths.
- Anything you couldn't do, or that needs my content or decision.
- The branch name and commit list.

Then stop and wait for my go-ahead before the next phase.
