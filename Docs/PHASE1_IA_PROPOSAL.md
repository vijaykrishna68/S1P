# Phase 1 — Information Architecture Proposal

Status: **Draft — pending your approval before Phase 2 begins.** No code, routes,
components, packages, or visual changes have been made. This document is the
output of Phase 1 only.

Source material: `s1p glance.pdf` ("SACRIFICE 1 PIZZA WELFARE TRUST — GLANCE: 2025",
provided by the user, extracted via `pdftotext -layout`). Codebase baseline: current
`main` branch as surveyed below. Existing docs consulted: `Docs/PRD.md`,
`Docs/02UI_UX.md`, `Docs/DECISIONS.md`, `Docs/PROJECT_CONTEXT.md`, `CLAUDE.md`.

---

## A. Current IA (as it exists today)

**Public site — single page, no router.** `package.json` has no routing
dependency; `src/main.tsx` mounts one `<App />`; `src/App.tsx` stacks every
section inside one `<main>`. "Navigation" is same-page anchor scrolling:

```
/  (index.html)
  Header (sticky, IntersectionObserver-driven surface)
  #top
  Hero            — H1, primary CTA → #donate, secondary → #mission
  #mission        Mission ("Why One Pizza Matters")
  #impact         Impact (4 count-up stats — currently placeholder figures)
  #donate         DonationSection (amount → payment → confirmation → success)
  #testimonials   Testimonials (editorial crossfade)
  #faq            FAQ (accordion, 4 items)
  Footer
```

Header nav links: `Why It Matters (#mission)`, `Impact (#impact)`, `FAQ (#faq)`,
plus a persistent `Donate One Pizza` CTA. Footer nav: `About (#mission)`,
`Impact (#impact)`, `Donate (#donate)`, `FAQ (#faq)` — **note "About" already
exists as a label today but points at Mission; there is no dedicated About
content.** Footer social links are `href="#"` placeholders.

**Admin — separate Vite entry, no router.** `admin.html` → `src/admin/main.tsx`
→ `AdminApp.tsx`, which owns `view: {name:'dashboard'} | {name:'detail', id}`
as plain `useState`, no URL state, no persistent admin nav bar (just two views
swapped by callback props):

```
admin.html
  LoginPage        (auth === 'loggedOut')
  DashboardPage     (view.name === 'dashboard') — list, filters, pagination, summary tiles
  SubmissionDetail   (view.name === 'detail') — record + screenshot + status actions
```

**Backend relevant to a future Gallery:** `db/schema.ts` has four tables
(`donations`, `admin_users`, `admin_sessions`, `rate_limits`) — no media/gallery
table exists. The one existing file-upload path
(`api/uploads/screenshot.ts` → Vercel Blob, OIDC presigned, magic-byte
verified, `access: 'private'`, read back only through the admin-gated
streaming route `api/admin/donations/[id]/screenshot.ts`) is built entirely
around **private, single-owner, admin-only-readable** images. Nothing today
serves a **public** image from Blob storage — that's a new access pattern.

**Content architecture:** every section's copy lives in a small colocated
`*Data.ts`/`config.ts` file next to its component (`testimonialsData.ts`,
`faqData.ts`, `donation/config.ts`; Impact's stats are inline). This is the
established convention a new About/Gallery data file should follow.

**Docs baseline:** `Docs/PROJECT_CONTEXT.md` (§12–13) is the closest thing to
a standing production-readiness audit — it already documents current known
limitations (placeholder content, unverified prod Blob/Neon credentials, no
CAPTCHA, single admin account). Nothing in `Docs/PRD.md` or `Docs/02UI_UX.md`
currently specifies an About or Gallery page — both are net-new scope.

---

## B. Proposed IA

```
Public:
  /            Home            (existing SPA, content adjusted — see C)
  /about       About           (new)
  /gallery     Gallery         (new)
  /#donate     Donate          (stays a homepage anchor, not a separate route)

Admin:
  /admin.html  Login / Dashboard / Submission Detail   (existing, unchanged)
               + Gallery management (new third view)
```

**Recommendation: extend the site as two new Vite multi-page entries
(`about.html`, `gallery.html`), not a client-side router.** This directly
reuses the pattern already built and validated for `admin.html`
(`vite.config.ts`'s `build.rollupOptions.input`), which the project's own
`Docs/DECISIONS.md` already justifies as deliberately router-free. Concretely:

- Each new page gets its own tiny `main.tsx` mounting a page-level component
  that imports the _existing_ `Header`, `Footer`, `Container`, `Button`,
  `TextLink` — nothing new to build there.
- **Zero new dependencies** — consistent with the project's stated bias
  (`CLAUDE.md` §2, `Docs/DECISIONS.md`) against adding a library (`react-router`
  here) before a concrete need exists. Neither About nor Gallery need
  client-side transitions, nested routes, or query-param state — a full page
  load between Home/About/Gallery is an acceptable, honest tradeoff for a
  donation-first site where speed-to-first-paint on the homepage matters most.
- Cost: this needs reworking `Header`/`Footer`'s nav-link arrays from bare
  anchors (`#mission`) to root-relative ones (`/#impact`, `/#donate`) so
  links work correctly from a non-home page. Small, one-time, and only needs
  doing once — Gallery (Phase 3) then reuses the same infrastructure for free.
  **Final decision (post-implementation): no Vercel rewrite was added.**
  This section originally floated a `/about` → `about.html` clean-URL
  rewrite as a possible cost; that was decided against — the canonical
  public URLs are the direct `.html` paths (`/about.html`, `/gallery.html`),
  matching `admin.html`'s own existing precedent exactly, with zero changes
  to `vercel.json`.
- **Alternative considered:** `react-router`. More conventional for a growing
  multi-page site, gives real client-side transitions and back/forward without
  full reloads. Rejected as the default recommendation only because it's a new
  dependency this project has explicitly avoided elsewhere for weaker reasons,
  and nothing in About or Gallery's actual requirements needs it. **Flagging
  this as an explicit approval point (§K) rather than deciding it unilaterally
  — it's a real architectural fork, not a cosmetic choice.**

---

## C. Homepage content structure

Preserve the existing section order and donation-first flow — the PDF content
augments, it doesn't restructure:

```
Header (nav: About · Gallery · Impact · FAQ · [Donate One Pizza])
Hero                    — unchanged
Mission (#mission)      — unchanged copy, + one new TextLink: "Read our full story →" → /about
Impact (#impact)        — same 4-stat layout, but swap in REAL figures now available:
                            ₹29L+ disbursed · 55+ students supported (UKG–MBBS) ·
                            [existing 2 placeholder stats stay placeholder until confirmed]
Donate (#donate)        — unchanged
Testimonials            — unchanged
FAQ                     — unchanged (registration answer stays as-is; Phase 4)
Footer                  — nav fixed: About(/about) · Gallery(/gallery) · Impact(/#impact) ·
                            FAQ(/#faq) · Donate(/#donate)
```

No new homepage section is proposed. The single highest-value, lowest-risk
change is replacing 2 of Impact's 4 placeholder numbers with real, sourced
ones — this turns a known "Known Limitations" item
(`Docs/PROJECT_CONTEXT.md`: "impact figures are placeholders") into real
content without adding any new UI. The journey/history/timeline material
belongs on About only (see E) — putting it on the homepage would be exactly
the "annual-report" overload the brief warns against.

---

## D. About page structure

| #   | Section                                         | Purpose                                                                 | Source                                                                | Treatment                                                                                                                                                                                                                                                   |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Intro / Trust identity**                      | Establish who S1P is and that it's a real, registered trust, fast       | Org full name, Reg No. 316/2016, mission one-liner                    | Short, narrative. Reuses hero's visual language (e.g. `EchoMark`-style motif), not a new asset.                                                                                                                                                             |
| 2   | **Origin story — "The Story Behind One Pizza"** | Emotional hook; explains the name and ties directly to the donation ask | The "8 slices of pizza" story                                         | Narrative, rewritten in the site's own editorial voice — the PDF version is a dialogue script, not web copy; condense to the core beats (maid's ₹500 festival bonus, the 8 real needs it covered, the realization) rather than reproducing the full script. |
| 3   | **Why Education**                               | Bridges the story to the actual mission                                 | "Education is the most powerful weapon..." quote + mission statement  | Short. **Note:** this quote is widely attributed to Nelson Mandela, not S1P's own words — use as a general epigraph with that understanding, or drop it (see §K).                                                                                           |
| 4   | **Our Journey**                                 | Credibility: shows sustained operation since ~2016, not a one-off       | Yearly/cumulative disbursement + active-member trend, 2015–2025       | Simplified timeline, not a reproduced chart — see §E, and note the open data-confirmation question.                                                                                                                                                         |
| 5   | **Impact at a Glance**                          | Concrete, current numbers                                               | ₹29L+ cumulative disbursed, 55+ students (UKG–MBBS), Reg No. 316/2016 | Metric-driven, minimal — same visual language as homepage Impact stats, reused not reinvented.                                                                                                                                                              |
| 6   | **Trust & Transparency**                        | Donor confidence                                                        | Registration, contact (s1pwtrust@gmail.com), registered address       | Plain, honest. **Must not claim 80G or any tax-deductibility** — the source material lists 80G as a 2025 _aim_, not a status (see §G). If mentioned at all: "working toward formal certifications," never "certified."                                      |
| 7   | **CTA**                                         | Convert the visit into a donation                                       | —                                                                     | Reuses the existing `Button`/donate-CTA pattern exactly — no new CTA design.                                                                                                                                                                                |

This is a narrative-led page with metric accents, not a data dashboard —
consistent with the brand's "editorial rather than componentized" direction
(`CLAUDE.md` §3).

---

## E. Journey / History representation

The PDF includes two bar charts (yearly disbursement 2015–2025, cumulative
disbursement 2015–2025) and one line/bar chart (active member count,
2020 Dec–2025 Dec). **Caveat that matters:** these were extracted via
`pdftotext -layout`, which preserves rough position but not guaranteed
per-bar alignment — I can read the chart's _shape_ confidently (steady growth,
plateauing member count around 58–59 in recent years, cumulative disbursement
approaching ₹29–30L by 2025) but I am **not fully confident in every exact
per-year number** the extraction produced. Per the project's explicit
"never invent numbers" rule, I have not treated those as reliable enough to
hand off as final copy — see the approval question in §K.

**Recommendation:** a simple, hand-rolled milestone timeline (SVG/CSS, no
charting library — consistent with the hero's own no-dependency motion
approach), anchored on 3–4 confidently-sourced points rather than all 11
years:

```
2016  Trust registered (Reg No. 316/2016)
2020  [member count — pending confirmation]
2023–24  Growing base of supporters, disbursements rising
2025  58 active members · 55+ students supported · ₹29L+ disbursed cumulative
```

If the user confirms the exact per-year figures, a small supplementary
hand-rolled SVG sparkline (cumulative disbursement growth) can sit alongside
the timeline — still no charting dependency, same technique already proven
for the hero. **Do not reproduce the PDF's own bar-chart graphics** (explicit
instruction) — a web-native, brand-consistent presentation either way.

---

## F. Gallery IA

**Public experience** (`/gallery`):

- Responsive grid (matches the 8px spacing system, ~1200px max content width),
  each tile opens a lightbox/modal on click — pure component state, no routing
  needed inside the page for v1.
- **Empty state:** warm, honest copy ("Photos from our journey are on their
  way") — never a broken-looking blank grid, since real photos don't exist yet
  at launch.
- **Loading state:** fixed-aspect skeleton tiles, not a spinner — matches the
  project's existing "premium, not generic" bar.
- **Error state:** inline retry message if the image list fails to fetch.
- **Placeholder strategy:** brand-toned abstract placeholder tiles (cream/red,
  reusing existing design tokens, maybe a small icon), _not_ fake stock
  "charity" photography — this is the exact same principle already applied to
  Mission's `EchoMark` (`CLAUDE.md` Decision Log: "no fake photorealism when a
  real asset doesn't exist yet"). Do not design the grid's aspect ratios or
  layout around placeholder dimensions specifically — keep it generic enough
  that real photos drop in later without a rebuild.

**Admin experience** (new third `AdminApp` view):

- `AdminApp.tsx` currently has no persistent admin nav bar (just
  Dashboard ⇄ Detail via callback props) — adding a third top-level view
  (Gallery) means a small, genuinely new piece: a minimal admin nav/tab bar.
  Worth calling out now since it's a real (if small) addition to existing
  admin architecture, not free.
- **Upload flow:** select image(s) → client preview → presigned upload to
  Blob, reusing the exact pattern from `api/uploads/screenshot.ts`
  (`handleUploadPresigned`, magic-byte verification) but with **`access:
'public'`** this time (a genuinely new access mode for this project) and a
  `gallery/` pathname prefix → on success, insert a row into a new
  `gallery_images` table via an admin-only API route.
- **Delete flow:** delete button on each admin tile → confirmation dialog
  (irreversible) → API call removes the DB row and the Blob object.
- Backend specifics (schema, routes) are **not implemented in Phase 1** — the
  above is the target shape for Phase 3 planning only.

---

## G. Content prioritization

**1. Definitely useful for the website:**

- Org name "Sacrifice 1 Pizza Welfare Trust", Registration No. 316/2016,
  registered address, contact email (all already public on the org's own
  letterhead)
- The origin story (8 slices of pizza) — rewritten, not reproduced verbatim
- Mission: educational support for underprivileged students
- ₹29 Lakhs+ cumulative disbursement
- 55+ student beneficiaries, "UKG to MBBS" range
- Founding context (~2016, from the registration number)
- General, aggregate growth narrative ("a growing community of supporters")

**2. Potentially useful — needs your confirmation before use:**

- Exact yearly/cumulative disbursement figures per year, 2015–2025 (extraction
  confidence issue, see §E)
- Exact active-member counts per year, 2020–2025 (same issue)
- "Cat and non-Cat supporters" — the PDF states this distinction explicitly
  but never defines "Cat" in the material provided; I'm not going to guess
  what it means. Either clarify it or approve omitting the split and using a
  single aggregate supporter figure/narrative instead.

**3. Better left out of the website entirely:**

- **Individual student names + class/course** (ArunSai, Ajay, Chitra, Harini,
  Ram Kumar, Bishnu D, Sanjana, Himasree, Sahana) — minors' data, matches your
  explicit instruction.
- **Individual new-member/supporter names** (Ganesh Mudada, Balajie V,
  Krishnakumar, Srinivas N, Venkatesh, Rajiv P, Nediyon C) — personal data
  with no consent context provided.
- **The "S1P Trust – Fund Request form" template**, especially its Aadhar
  Number field — this is an internal intake process document with a
  government-ID field; no part of it belongs anywhere near the public site.
- **The granular 2025 financial ledger** (opening balance, ITR filing fees,
  etc.) — too operational/detailed for donor-facing marketing copy; better
  suited to a future downloadable "transparency report" (already on the PRD's
  own future-roadmap list) than the About page itself.
- **80G certification as an achieved status** — the source material lists it
  under "AIM IN 2025," i.e. not yet achieved. Must never be presented as
  current fact on the site; matches your explicit caution.

---

## H. Navigation recommendation

```
Header (primary nav):  About  ·  Gallery  ·  Impact  ·  FAQ   [Donate One Pizza →]
Footer (secondary nav): About · Gallery · Impact · FAQ · Donate
```

- **About:** yes, primary nav — it's now the fuller "why" of the org and a
  natural pre-donation trust stop.
- **"Why It Matters" (Mission's old nav label):** proposed to be **dropped
  from top-level nav** once About exists (About absorbs that role more fully)
  — the Mission _section_ itself stays on the homepage unchanged, just no
  longer separately billed in the header. This keeps the nav at the same
  length it is today (3 items + CTA → 4 items + CTA, About replacing "Why It
  Matters").
- **Gallery:** genuinely open question, not a clear-cut yes — see §K. Default
  recommendation is yes (matches your own proposed structure and keeps nav
  honest/complete), but worth deciding explicitly given it launches with
  placeholder content only.
- **Donate** stays a homepage anchor (`/#donate`), not a nav _page_ — the CTA
  button already serves that role site-wide and shouldn't change.

---

## I. Content/design principles (carried forward, not new)

- Keep the existing visual identity exactly — cream background, one red
  accent, Outfit/Plus Jakarta Sans, 8px spacing, transform/opacity-only motion.
  New pages should read as continuations of the same site, not a bolt-on.
- No new dependencies for About (pure content) or Gallery's public UI (grid +
  lightbox are both achievable with existing patterns).
- No invented milestones, dates, numbers, or claims — every new factual
  statement traces to the PDF or is explicitly flagged as pending
  confirmation in this document.
- No generic NGO-template patterns (donor walls, giant stat dashboards,
  stock "charity" photography, testimonial carousels beyond what already
  exists) — the brief for both new pages is closer to "one more well-written
  chapter of the existing site" than "add a nonprofit's standard page set."
- Individual privacy (students, new members) is a hard boundary, not a style
  choice — see §G.

---

## J. Implementation phasing

Your proposed sequencing holds up technically; two scope clarifications:

```
Phase 1 — Information Architecture              ← this document
Phase 2 — About page
            + public multi-page infrastructure (Vite entries, Vercel rewrites,
              root-relative nav links) — built once here, reused by Phase 3
            + the two homepage touches from §C (TextLink to About, real
              Impact figures)
Phase 3 — Gallery
            + public grid/lightbox UI (placeholder images)
            + admin upload/delete backend (new table + routes)
            — open question: ship both together, or split 3a (public UI only)
              then 3b (admin CRUD)? See §K.
Phase 4 — Existing production fixes + FAQ registration answer → "Yes"
Phase 5 — Final production UX pass
```

Rationale for folding the multi-page infrastructure into Phase 2 rather than
its own phase: About is the first page to actually need it, and doing it once
there means Phase 3 adds a third Vite entry to an already-proven pattern
instead of re-deriving it.

---

## K. Open questions / decisions needed before Phase 2

1. **Exact yearly/cumulative disbursement and member-count numbers** — my
   text extraction of the PDF's charts wasn't fully reliable for per-year
   precision. Please confirm the real numbers (or approve using only the
   aggregate 2025 headline stats + a qualitative growth narrative instead of
   a numbers-heavy timeline).
2. **"Cat and non-Cat supporters"** — please clarify what this means, or
   approve leaving it out and using a single aggregate supporter framing.
3. **Multi-page architecture: new Vite entries vs. `react-router`.**
   Recommendation is Vite entries (zero new dependencies, matches the
   `admin.html` precedent) — please confirm or override.
4. **Gallery in primary header nav from day one**, while it only has
   placeholder images — or footer/homepage-only until real photos exist?
5. **Phase 3 scope split** — Gallery public UI + admin backend together, or
   staged (3a public-only, 3b admin CRUD)?
6. **Publishing the registered address** in About/Footer — it's already on
   the org's own public letterhead, so I'd default to yes, but flagging since
   it's a physical address.
7. **The "Education is the most powerful weapon..." quote** — use as a
   general epigraph (commonly attributed to Nelson Mandela, not S1P's own
   words), or drop it to avoid attribution ambiguity?

---

## Summary

1. **Sitemap:** `/` (Home, unchanged flow) · `/about` (new) · `/gallery` (new)
   · `/#donate` (stays an anchor) — admin unchanged plus a new Gallery
   management view.
2. **Homepage:** unchanged section order; swap 2 Impact placeholder stats for
   real PDF figures; add one "Read our full story →" link from Mission to
   About. No new section.
3. **About:** Intro/Trust identity → Origin story → Why Education → Our
   Journey (timeline, pending number confirmation) → Impact at a Glance →
   Trust & Transparency (no 80G claim) → CTA.
4. **Gallery:** public grid + lightbox with real empty/loading/error states
   and brand-toned (not fake-photo) placeholders; admin gets a new
   upload/delete view backed by a new `gallery_images` table + public-access
   Blob uploads — backend built in Phase 3, not now.
5. **Use from the PDF:** org identity/registration/contact, origin story,
   mission, ₹29L+ disbursed, 55+ students (UKG–MBBS), founding context,
   aggregate supporter growth.
6. **Do not use publicly:** individual student names, individual new-member
   names, the Fund Request form (Aadhar field), the granular 2025 ledger,
   "Cat/non-Cat" split (until clarified), 80G as an achieved status.
7. **Needs your approval before Phase 2:** the 7 items in §K above.
