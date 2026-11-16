# Phase 5 — Redesign plan (Phase 0 output)

Status: **draft for approval. No code has been changed.** This applies the `design-system/` visual system to the existing site without changing behaviour, data or API contracts.

Reading basis: `CLAUDE.md`, all `design-system/docs/*`, `tokens.css`, `index.d.ts`, `README.md` and `Docs/PHASE5` prompt, plus every component under `src/` that this plan maps (Header, Hero, Mission, Impact/ImpactStat, DonationSection and its steps, ui/*, Footer, FAQ, Testimonials data, About, Gallery, Admin, `styles/index.css`, `vite.config.ts`, `vercel.json`, `package.json`).

> Not yet read in full: the long `Docs/PHASE4*` audits (~480 KB), `PRD.md`, `PROJECT_CONTEXT.md`, `02UI_UX.md`, `bundle.css` line-by-line, and some component bodies (Testimonials, Mission, JourneyTimeline, TrustInfo, OriginStory, Admin pages, ScreenshotUploader). I read the parts the mapping depends on. I will read the rest at the start of 5A/5B for the files each phase touches, and amend this plan if anything changes. Say so if you want the full read done before approval.

---

## 1. Inventory and mapping

| Existing                                                                             | Design-system counterpart                                                              | Action                                                                                                                            |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `ui/Button` (red-deep pill, `busy`)                                                  | Button (primary/secondary/tertiary/destructive, sm/md/lg, loading, success, icon-only) | **Restyle in place**, keep `busy` as the alias of `loading`, keep anchor/`href` form and tests                                    |
| `ui/TextLink`                                                                        | tertiary Button / text link with gold underline                                        | **Restyle in place**                                                                                                              |
| `ui/Container`                                                                       | `layout-max` 1240 + margins                                                            | **Restyle** (1200 → 1240, `px-4 md:px-8`)                                                                                         |
| `ui/Dialog` (native `<dialog>`)                                                      | Dialog (+ destructive `alertdialog`, `wide`)                                           | **Restyle**; keep native `showModal` focus behaviour; add `tone`, visible title, `actions` slot, `wide`                           |
| `ui/TwoTrack`, `IllustrationSlot`                                                    | 5/7 asymmetric splits + `Illustration`                                                 | **Retire** (replaced by grid utilities and `<Illustration>`)                                                                      |
| `ui/SectionDivider`                                                                  | band alternation + motifs                                                              | **Retire**; use `motif-*` sparingly (max 1 per section)                                                                           |
| `ui/ClosingBand`                                                                     | inverse crust band                                                                     | **Replace** with new `ClosingBand` on `color-background-inverse`, `s1-inverse`                                                    |
| `ui/useScrollReveal`, `usePrefersReducedMotion`, `useAutoFocus`                      | motion tokens, entrances                                                               | **Keep**, re-point to motion tokens; `useAutoFocus` unchanged                                                                     |
| `navigation/Header`                                                                  | NavBar (wordmark stand-in, 44px menu, sheet)                                           | **Restyle + restructure markup**; keep IntersectionObserver sentinel, `aria-current`, Escape/focus-return, outside-click, `inert` |
| `hero/Hero` + `GatheringPoint` + css                                                 | HeroSection + Illustration 001/002                                                     | **Replace** (Gathering Point retired, pending decision 5)                                                                         |
| `mission/Mission` + `EchoMark`                                                       | story band + 003 `contribution-pass-it-on`                                             | **Restyle**; EchoMark retired                                                                                                     |
| `impact/Impact` + `ImpactStat` + `useCountUp`                                        | ImpactStat (slice-disc mark)                                                           | **Restyle**; keep hook and tests' behavioural assertions                                                                          |
| `donation/DonationSection`                                                           | Contribute composition (calm)                                                          | **Restyle**; reducers untouched                                                                                                   |
| `steps/AmountStep`                                                                   | AmountSelector                                                                         | **Restyle, see conflict C1** (no preset amounts exist)                                                                            |
| `steps/PaymentStep` + `upiUri` + QR                                                  | Payment composition (QR on warm-white card)                                            | **Restyle**; QR/URI untouched                                                                                                     |
| `steps/ConfirmationStep` + `FormField`                                               | TextField, Alert, Checkbox (if needed)                                                 | **Restyle**; `FormField` becomes TextField-spec; validation untouched                                                             |
| `ScreenshotUploader`                                                                 | uploader built from Alert + Button                                                     | **Restyle** all hook states; logic untouched                                                                                      |
| `CopyUpiButton`                                                                      | secondary Button + polite live region                                                  | **Restyle** (keep layout-stable label swap)                                                                                       |
| `steps/SuccessStep`                                                                  | success composition + 008                                                              | **Restyle**; 008 shown only after existing success state                                                                          |
| `testimonials/Testimonials`                                                          | StoryQuote on rose slab                                                                | **Restyle**; keep crossfade state machine, autoplay rules, pause control, data (4 real quotes)                                    |
| `faq/FAQ`                                                                            | Accordion on native `details`                                                          | **Replace** markup (see risk R4); keep 4 real items                                                                               |
| `layout/Footer`                                                                      | inverse crust band                                                                     | **Restyle**                                                                                                                       |
| About: `AboutPage`, `OriginStory`, `JourneyTimeline`, `TrustInfo`, `EightSlicesMark` | Timeline, StoryQuote?, 006, people-cast                                                | **Restyle**; Timeline replaces JourneyTimeline markers; keep the chart data; `EightSlicesMark` retired or folded into Timeline    |
| Gallery: `GalleryPage`, `GalleryGrid`, `GalleryTile`                                 | GalleryGrid, EmptyState, Skeleton, Alert                                               | **Restyle + restructure** (feature/tall tiles, Previous/Next, states)                                                             |
| Admin: `LoginPage`, `DashboardPage`, `SubmissionDetail`, `AdminGalleryPage`          | AdminTable, Badge/PublishStatus, destructive Dialog, Alert                             | **Restyle**; no permission/API change                                                                                             |
| `@phosphor-icons/react` (11 files, 16 glyphs)                                        | Icon (26 svgs)                                                                         | **Replace**, see icon gaps below                                                                                                  |
| —                                                                                    | Badge, Alert, Select, Checkbox, EmptyState, Skeleton, Illustration, Icon, Wordmark     | **New**                                                                                                                           |
| —                                                                                    | ContributionSummary                                                                    | **Do not add** (see C2)                                                                                                           |

**Icon gaps.** Used by the repo: ArrowRight, Check, CircleNotch (spinner), Copy, Heart, InstagramLogo, LinkedinLogo, XLogo, List, Pause, Play, Plus, Trash, UploadSimple, WarningCircle, X. The set has arrow-right, check, heart, menu, plus, trash, upload, close, alert-circle. **Missing: copy, pause, play, spinner, three social-brand logos.** Plan: draw `copy`, `pause`, `play` and a spinner in the same 24px / 2px-stroke grid (reviewed by you). Social logos are brand marks, not functional icons; the Footer social links are `href="#"` placeholders today, so I propose keeping them as three small hand-drawn glyphs _or_ dropping them until real profiles exist. Needs your decision (§5, item 9).

---

## 2. Token mapping

### Colours

| Old `@theme`                                 | New                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| `cream #fff8f2`                              | `--color-background-canvas` (mozzarella `#FCF7EB`)                            |
| `cream-soft #fdede3`                         | `--color-background-surface` (`#F6EDDA`)                                      |
| `charcoal #1d1d1f`                           | `--color-text-primary` (crust-900 `#34251F`)                                  |
| `charcoal-muted #6b6b6b`                     | `--color-text-secondary` (earth-600 `#6B5D52`)                                |
| `red #e63946`                                | `--color-brand-primary` (tomato-500), shapes/display only                     |
| `red-deep #c92c3a` (button fill, error text) | `--color-action-primary` (tomato-600) / `--color-feedback-error` (tomato-700) |
| `red-darkest #9f232e`                        | `--color-action-primary-pressed` (tomato-800)                                 |
| `green #2ecc71` (fills only)                 | `--color-feedback-success-soft` / retire                                      |
| `green-deep #2d7a4d`, `green-tint`           | `--color-feedback-success` (basil-600), `-soft` (basil-100)                   |
| `yellow #f2b632`, `yellow-tint`              | `--color-brand-highlight` (gold-400), `--color-background-highlight`          |

**No clean equivalent:** the Phase 4A testimonials _yellow band_ (replaced by the rose story band, so Testimonials changes ground) and the old `rgba` red hover shadow (replaced by `shadow-offset-sm`).

### Fonts

`--font-display` Outfit → **Sora**; `--font-body` Plus Jakarta Sans → **`--font-text` Manrope**. Add `--font-mono` for admin ids. Gap: the brand book says the rupee sign (₹) falls back to the system font because the supplied woff2 files are **Latin-only**. ₹ is on every donation screen, so this is visible. Options in §5, item 10.

### Motion

| Old (Phase 4B)            | New                                                                               |
| ------------------------- | --------------------------------------------------------------------------------- |
| `--duration-fast` 150     | `--motion-duration-micro` 140                                                     |
| `--duration-base` 200     | `--motion-duration-standard` 220                                                  |
| `--duration-medium` 300   | `--motion-duration-emphasized` 360 (dialog/menu/steps)                            |
| `--duration-slow` 500     | `--motion-duration-entrance` 560                                                  |
| `--duration-count` 1100   | **no token**: keep as a local constant in `useCountUp` (docs specify 1.1 s). Flag |
| press feedback 150        | `--motion-duration-instant` 80                                                    |
| `--ease-out-expo`         | `--motion-ease-emphasized`                                                        |
| `--ease-state`            | `--motion-ease-standard`                                                          |
| `--ease-exit`             | `--motion-ease-exit`                                                              |
| (none)                    | `--motion-ease-spring` for chip/check pops                                        |
| `--shift-sm/md/lg` 4/8/12 | `--motion-distance-sm/md` 8/24 (+ lg 64)                                          |
| stagger 60 / 80           | `--motion-stagger-standard` 80 (`tight` 40, `loose` 160)                          |

Reveal travel grows from 12 px to 24 px, which is the documented value.

### Spacing, radius, shadows, focus

- Spacing: Tailwind's 4 px scale equals `--space-*`. The Phase 4A `pad-tight/standard/breathing` utilities map to `space-16` (mobile) / `space-24` (desktop) section rhythm; they are retired once pages migrate. Flag: those three tiers had per-side variants used across About/Gallery, so each use needs a human choice in 5D.
- Radii: `ticket 6 · input 10 · chip 14 · card 20 · slab 36 · pill 999`. Old `rounded-xl/2xl/full` map by meaning, not by size.
- Focus: old `outline 2px red` → `box-shadow: var(--focus-ring)` globally, plus `.s1-inverse`.
- Shadows: `shadow-offset`, `shadow-offset-sm`, `shadow-float`.

### Exact Tailwind v4 `@theme` block (5A)

```css
@import 'tailwindcss';
@import './tokens.css'; /* generated from design-system/tokens/tokens.json */

@theme inline {
  --color-canvas: var(--color-background-canvas);
  --color-surface: var(--color-background-surface);
  --color-elevated: var(--color-background-elevated);
  --color-story: var(--color-background-story);
  --color-inverse: var(--color-background-inverse);
  --color-highlight: var(--color-brand-highlight);
  --color-highlight-soft: var(--color-background-highlight);

  --color-ink: var(--color-text-primary);
  --color-ink-2: var(--color-text-secondary);
  --color-ink-inverse: var(--color-text-inverse);
  --color-ink-brand: var(--color-text-brand);
  --color-ink-on-primary: var(--color-text-on-primary);

  --color-action: var(--color-action-primary);
  --color-action-hover: var(--color-action-primary-hover);
  --color-action-pressed: var(--color-action-primary-pressed);
  --color-action-2: var(--color-action-secondary);
  --color-action-2-hover: var(--color-action-secondary-hover);
  --color-action-off: var(--color-action-disabled);

  --color-line: var(--color-border-subtle);
  --color-line-strong: var(--color-border-strong);
  --color-line-ink: var(--color-border-ink);

  --color-success: var(--color-feedback-success);
  --color-success-soft: var(--color-feedback-success-soft);
  --color-warning: var(--color-feedback-warning);
  --color-warning-soft: var(--color-feedback-warning-soft);
  --color-error: var(--color-feedback-error);
  --color-error-soft: var(--color-feedback-error-soft);
  --color-info: var(--color-feedback-information);
  --color-info-soft: var(--color-feedback-information-soft);
  --color-plate: var(--color-illustration-plate);

  --radius-ticket: var(--radius-ticket);
  --radius-input: var(--radius-input);
  --radius-chip: var(--radius-chip);
  --radius-card: var(--radius-card);
  --radius-slab: var(--radius-slab);

  --font-display: var(--font-display);
  --font-text: var(--font-text);
  --font-mono: var(--font-mono);

  --shadow-offset: var(--shadow-offset);
  --shadow-offset-sm: var(--shadow-offset-sm);
  --shadow-float: var(--shadow-float);
  --shadow-focus: var(--focus-ring);

  --ease-standard: var(--motion-ease-standard);
  --ease-exit: var(--motion-ease-exit);
  --ease-emphasized: var(--motion-ease-emphasized);
  --ease-spring: var(--motion-ease-spring);
}
```

Two details to resolve while writing 5A rather than guess now: (a) a self-referencing `--radius-card: var(--radius-card)` inside `@theme inline` is a cycle, so I will either prefix the generated variables (e.g. `--s1-radius-card`) or let `build-tokens.ts` emit an alias layer; (b) `tokens.css` carries `@font-face` with `../fonts/…` paths and Vite must resolve them from `src/styles/`, so the generator rewrites that URL. Utility names such as `bg-canvas`, `text-ink`, `bg-action`, `rounded-card`, `shadow-offset`, `ease-spring` come out of this.

---

## 3. Illustration placement

| Slot (this repo)       | Scene                                                                                                                                       | Notes                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Home `Hero`            | **001** desktop / **002** below 900 px                                                                                                      | `priority`; replaces Gathering Point                                                                                                   |
| Home `Mission`         | **003**                                                                                                                                     | copy left, art right, on the rose band                                                                                                 |
| Home: 004              | **DonationSection intro** (recommended; decision 6)                                                                                         | The flow is the "how you can help" beat; Impact has only two stats, so there is little for the art to sit beside. Keep it on its plate |
| About hero             | none (title + lead)                                                                                                                         | EchoMark retired                                                                                                                       |
| About `OriginStory`    | **006**                                                                                                                                     | the "set one slice aside" story matches the real origin copy                                                                           |
| About "who's involved" | **005** only if you can name who the people are                                                                                             | there is no such content today (Trust list has no people); recommend **not used**                                                      |
| 007 welcome            | **Unused**                                                                                                                                  | the site does not offer volunteering (decision 3)                                                                                      |
| `SuccessStep`          | **008**                                                                                                                                     | rendered only once the existing success step shows (after the API confirms)                                                            |
| Gallery empty          | **009**                                                                                                                                     | decorative                                                                                                                             |
| Gallery load error     | **010**                                                                                                                                     | decorative, with Alert + retry                                                                                                         |
| Admin empty lists      | **009**                                                                                                                                     | static                                                                                                                                 |
| Admin failed upload    | **010**                                                                                                                                     | static                                                                                                                                 |
| 011 looking-closely    | **Unused**: no search/filter in the repo. Dashboard has a status filter that can return zero rows, so I'd use 011 there (compact) — confirm |                                                                                                                                        |
| 012 wandering-slice    | **Unused** unless you approve a 404 page (decision 2)                                                                                       |                                                                                                                                        |

**Retiring:** `src/assets/illustrations/*.png` (3), `src/components/illustrations/*` (TrustSeal, ViewfinderMark, WedgeOnNotebook, DecorativeImage, illustrationTokens, test), `art/phase4c/`, `mission/EchoMark`, `about/EightSlicesMark`, `hero/GatheringPoint.tsx`, `gatheringPoint.css`, `hero.css`, `ui/IllustrationSlot`, `ui/TwoTrack`, `ui/SectionDivider`. Each removed only after `grep` shows no references.

The existing `TrustSeal` on About's Trust section has no counterpart in the new system. Recommendation: replace it with a motif (`motif-disc`) or nothing.

---

## 4. Conflicts between the design-system docs and this repo

| #      | Design-system assumption                                                                         | Reality here                                                                                                                                                                                                                 | Resolution                                                                                                                                                                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **C1** | AmountSelector: preset amount chips as native radios (250/500/1,000/2,500)                       | There are **no preset amounts**. CLAUDE.md §4 and the Decision Log: amounts are user-entered, never preset buttons (a deliberate override of the PRD). `AmountStep` is one numeric field, ₹1–₹3000, with ₹300 as encouraged. | **Do not invent chips.** Restyle `AmountStep` as a TextField with ₹ prefix. Adopt the _selected-state sticker look_ only if you want ₹300 as an optional one-tap chip. That is a product change, not a visual one, so I ask (decision 11). Default: no chips |
| C2     | ContributionSummary (card payment recap, receipt email)                                          | The flow is UPI QR + screenshot + manual review; nothing is charged by the site                                                                                                                                              | Not built. The Payment step already shows amount/UPI ID; restyle those                                                                                                                                                                                       |
| C3     | "Contribute ₹1,000" final button naming the amount, `lock` icon, "Processing your contribution…" | Real labels are "Continue to Payment", "I've Paid" etc. (Phase 4D copy)                                                                                                                                                      | Keep Phase 4D copy; do not rename buttons                                                                                                                                                                                                                    |
| C4     | Hero headline "Give up one slice. Share a meal.", eyebrow, secondary "See our impact"            | Real: "Skip One Pizza. Feed a Future." + "Donate One Pizza" / "See How It Helps"                                                                                                                                             | Keep real copy (decision 4). Brand book wants _sentence case_, real copy uses Title Case ("Donate One Pizza", "Questions You Might Have"); keep as approved copy, flag only                                                                                  |
| C5     | `[000]` placeholder stats, period and source on every ImpactStat                                 | Two real figures: `₹29L+` (rounded) and `55+`, label only; no period or source                                                                                                                                               | Render static (neither is exact). Fill _period_ from the label ("since 2015") and **no invented source**; About's own yearly data (`aboutData.ts`) has the exact ₹29.87L and its source note                                                                 |
| C6     | Count-up on exact values                                                                         | Both home figures are rounded/"+"                                                                                                                                                                                            | Per docs: static. This **changes behaviour** (they count up today). Needs your OK (decision 12); `ImpactStat.test.tsx` has count-up assertions and would be rewritten, so I'd keep `useCountUp` for About's exact figures if any are added                   |
| C7     | Illustrations are "PNG" in docs                                                                  | Provided files are **WebP** @1x/@2x                                                                                                                                                                                          | Use WebP; CSP `img-src 'self' data:` already allows it                                                                                                                                                                                                       |
| C8     | Pages assumed: Home, About, Impact, Gallery, FAQ, Contribute, Admin                              | Real: Home (with in-page Impact/Donate/FAQ), About, Gallery, Admin; **no Impact page, no FAQ page, no Contribute page**                                                                                                      | Compose Home from the six beats; Impact/FAQ stay sections                                                                                                                                                                                                    |
| C9     | Gallery items have `date`, caption, alt                                                          | API returns `caption` (nullable) and `createdAt`; there is no separate alt                                                                                                                                                   | Date from `createdAt`; alt = caption, else a generic "Gallery photo". Tile label "Open photo: …" uses the same. No schema change                                                                                                                             |
| C10    | PublishStatus: draft/saving/saved/scheduled/published/failed                                     | Donations: `pending / reviewed / rejected`. Gallery images have no publish state (live on create)                                                                                                                            | Use **Badge** tones for review status (pending=warning, reviewed=success, rejected=error). Use PublishStatus-style pill only for upload progress (saving/saved/failed)                                                                                       |
| C11    | Admin sidebar with five sections                                                                 | Admin has two views (dashboard, detail) plus gallery page, with no router                                                                                                                                                    | Keep the real structure; a simple top bar, no new sections                                                                                                                                                                                                   |
| C12    | Dark theme designed                                                                              | CLAUDE.md has no dark requirement                                                                                                                                                                                            | Light only (decision 1); ship tokens for both                                                                                                                                                                                                                |
| C13    | Brand voice: sentence case, no exclamation marks                                                 | Existing copy has Title Case headings and "Copied ✓"                                                                                                                                                                         | Keep approved copy; new system messages follow brand voice                                                                                                                                                                                                   |
| C14    | Real photos never share a frame with illustration                                                | Gallery page currently has `ViewfinderMark` hero art                                                                                                                                                                         | Retired; hero art removed from Gallery                                                                                                                                                                                                                       |
| C15    | Impact: "newest first on Impact", "newest last on About"                                         | About's Journey order is chronological                                                                                                                                                                                       | Keep current order (the prompt says keep it)                                                                                                                                                                                                                 |
| C16    | `CLAUDE.md` says React 18; `package.json` has React **19.2**                                     | Doc is stale                                                                                                                                                                                                                 | Fix in CLAUDE.md §2 during 5E; the reference bundle is React 18 but I port rather than load it                                                                                                                                                               |
| C17    | docs: ticket-style "Required"/"Optional" words on fields                                         | Existing labels carry neither                                                                                                                                                                                                | Add words in field labels; tests that match label text via regex need checking (R2)                                                                                                                                                                          |
| C18    | Wordmark stand-in "S1P on tomato pill + Sacrifice One Pizza"                                     | Header currently has a text/brand lockup (reviewed in Header) and a real favicon/OG image made earlier                                                                                                                       | Use the stand-in only if no logo is supplied; **you must confirm there is no real logo** (decision 13)                                                                                                                                                       |

---

## 5. Open decisions (with my recommendation)

1. **Dark theme** — light only at launch; tokens keep dark working. _Recommend: light only._
2. **404 page** — adds a fifth Vite entry and a `vercel.json` rewrite. _Recommend: not now; it is outside "don't change what the site does"._ 012 stays unused.
3. **Volunteering** — not offered anywhere. _Recommend: drop 007._
4. **Headlines** — _Recommend: keep Phase 4D copy everywhere._
5. **Retire Gathering Point** — CLAUDE.md §3 says the hero animation is "locked" and the signature idea of the site. Replacing it needs your explicit sign-off. _Recommend: yes, retire, in favour of 001's one-time entrance, and record it in the Decision Log._
6. **Scene 004** — _Recommend: DonationSection intro_ (reasoning in §3).
7. **Font and icon swap** — Outfit/Plus Jakarta → Sora/Manrope; Phosphor → S1P set. _Recommend: yes._ This also drops two `@fontsource` packages and Phosphor from the bundle.
8. **Anything unresolved** — see C1, C6, C18.
9. **Missing glyphs** (copy, pause, play, spinner, social logos) — _Recommend: I draw copy/pause/play/spinner; drop the three social links until real profiles exist_ (they are `href="#"` dead links today).
10. **₹ in brand fonts** — supplied woff2 are Latin only. Options: (a) accept system-font ₹ (works, slight mismatch); (b) you provide Latin-Extended/Currency-Symbols subsets; (c) subset from the OFL sources myself (dev-time tooling, OFL permits it). _Recommend (c), as ₹ appears on every amount._
11. **₹300 quick-pick chip** — _Recommend: no_, keep the single field (C1). If you want it, it is an additive, optional chip that fills the same input.
12. **Impact count-up** — C6. _Recommend: follow the design docs (static rounded values)_ — or keep counting if you prefer behaviour parity. Your call; it is the one place where the design system and the current behaviour disagree on motion.
13. **Logo** — is there an official S1P logo to use instead of the stand-in?

---

## 6. Phase and branch plan

All branches from an up-to-date `main`. Small conventional commits, no AI attribution trailers (note: the session-level attribution reminder asks for a `Co-Authored-By` line; your rule 6 in the prompt forbids it and I will follow your rule). No push/merge/PR without your word.

| Phase | Branch                  | Touches                                                                                                                                                                                                                                                                                                                            |
| ----- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5A    | `phase5a-foundations`   | `src/styles/index.css`, new `src/styles/tokens.css` (generated), `src/assets/fonts/*` (+OFL), `scripts/build-tokens.ts`, `package.json` (script only), `usePrefersReducedMotion`, `useScrollReveal`, `useCountUp` constants, `CLAUDE.md` §3 draft. Old fonts/colours stay until cleanup                                            |
| 5B    | `phase5b-components`    | `ui/*` (Button, TextLink, Container, Dialog, new Icon/Badge/Alert/Select/Checkbox/Wordmark/EmptyState/Skeleton), `donation/FormField`, `AmountStep`, `PaymentStep`, `CopyUpiButton`, `ScreenshotUploader`, `ImpactStat`, `Testimonials`, `FAQ`, `Header`, `Footer`, `ClosingBand`, `gallery/*`, admin table/pills, colocated tests |
| 5C    | `phase5c-illustrations` | `src/assets/illustrations/s1p/*.webp`, `components/ui/Illustration.tsx` + test, scene alt-text table, motifs as needed                                                                                                                                                                                                             |
| 5D    | `phase5d-pages`         | `App.tsx`, Hero, Mission, Impact, DonationSection + steps layout, About, Gallery, Admin pages, responsive passes                                                                                                                                                                                                                   |
| 5E    | `phase5e-qa`            | tests, `scripts/` screenshot tool, cleanup removals, `CLAUDE.md` (§2, §3, §6, §7, §8, §10), README checklist                                                                                                                                                                                                                       |

Each phase ends with a report and stops for your go-ahead.

---

## 7. Risks and verification

| #   | Risk                                                                                                                                            | Verification                                                                                                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Tailwind `@theme inline` with self-named variables creates cycles; wrong theme resolution                                                       | Build + a token page rendering every utility in light and dark; read computed styles                                                                                        |
| R2  | Markup changes break test selectors (e.g. FAQ `aria-expanded` buttons, Header menu, ImpactStat count-up, illustrations test, donationCopy test) | Run `npm test` after each component; update selectors only, keep assertions; count tests before/after                                                                       |
| R3  | Bundle growth (new icons, fonts)                                                                                                                | Compare per-entry sizes against `main`; the swap drops two fontsource packages and Phosphor; inline SVG icons are tree-shaken; fonts: 2 variable woff2 vs. six static files |
| R4  | FAQ on native `details`: the current inert/animated-height behaviour and `FAQ.test.tsx` assert `aria-expanded` button semantics                 | The brief asks for `details/summary`; I'll keep one-open-at-a-time only if the test requires it, and re-test open/close, keyboard and find-in-page                          |
| R5  | Focus/a11y regressions: step heading focus, first-invalid-field focus, menu Escape return, uploader sr-only input                               | Keep the existing regression tests; manual keyboard pass; `axe` only with your approval                                                                                     |
| R6  | Contrast of new tokens on real grounds                                                                                                          | Compute WCAG ratios from rendered colours for each pair used; check tomato-500 never carries small white text                                                               |
| R7  | LCP: replacing an SVG hero with a ~100–200 KB WebP                                                                                              | `priority` + `fetchpriority=high`, `srcset`, explicit width/height, compare Lighthouse before/after (record both)                                                           |
| R8  | CSP: images/fonts are same-origin; no inline `<script>`; `style-src 'unsafe-inline'` already present                                            | Check the console on the preview build; confirm no CSP violations                                                                                                           |
| R9  | `tokens.css` generation drift                                                                                                                   | `build-tokens.ts` plus a CI check that regenerating is a no-op (`git diff --exit-code`)                                                                                     |
| R10 | Reduced motion regressions (Testimonials, count-up, spinner exemption)                                                                          | Emulate `prefers-reduced-motion: reduce`; keep the `motion-pending` exemption for spinners and skeletons                                                                    |
| R11 | Integration tests depend on DB; can't run here without `DATABASE_URL`                                                                           | Mark "not run" in reports if so; the redesign touches no API code                                                                                                           |
| R12 | Phase 4D copy tests (`donationCopy.test.tsx`) pin wording                                                                                       | Do not edit copy; keep these as the guard                                                                                                                                   |
| R13 | Attribution rule conflict                                                                                                                       | Follow the prompt's rule 6 (no AI trailers)                                                                                                                                 |

---

## 8. What I need from you before 5A

Decisions 5, 9, 10, 11, 12 and 13 above. The rest I will proceed on with the stated recommendations.
