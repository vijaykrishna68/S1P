# Project Context — Sacrifice One Pizza

Detailed technical reference for future AI assistance and deep interview
preparation. This document goes beyond `README.md`: it is meant to let an
engineer or AI reading only this file understand the project's purpose,
architecture, data flow, security model, frontend, backend, testing, and
deployment without reconstructing it from the code. `CLAUDE.md` remains the
canonical, most-frequently-updated engineering context file for this repo;
this document is a narrower, interview/AI-context-oriented distillation of
the same reality, cross-checked directly against the code as of the commits
listed in `CLAUDE.md`'s Phase 10 entry.

---

## 1. Project Identity

**What it is:** Sacrifice One Pizza is a single-page charity donation
website with a real backend. A donor picks an amount (₹300–₹3000), pays via
UPI (India's bank-linked real-time payment system) using a client-generated
QR code or a UPI ID, uploads a screenshot of that payment as proof, and
submits a confirmation form. An admin later reviews submissions through a
separate authenticated dashboard and marks each one reviewed or rejected.

**Why it exists:** Built primarily as a portfolio piece to demonstrate
production-quality full-stack engineering — a hand-rolled signature
animation, a real multi-step donation UX with an explicit state
architecture, a real Postgres/Blob backend with idempotency and rate
limiting, and accessibility/security work verified by testing rather than
assumed.

**Problem it solves:** A UPI-based donation flow with no payment-gateway
integration has an honest version and a dishonest one. The dishonest
version implies the site verifies a bank transfer it has no access to. This
project builds the honest version: show the donor exactly how to pay, let
them pay in their own UPI app, and collect proof of payment as a screenshot
— reviewed by a human admin, not "verified" by the software.

**Intended users:** Donors (the public, no account required) and exactly
one admin/operator (authenticated, reviews submissions).

**Current scope:** A working donation-submission-and-review system with a
production deployment. Not yet exercised end-to-end against the live Neon
database and Blob store with real credentials (see §12 Known Limitations)
— CI has verified all backend logic against a real, ephemeral Postgres, but
that is a different Postgres from the production Neon project.

**What this is explicitly NOT:**
- **Not a payment processor or payment gateway.** No transaction is
  initiated, executed, or verified by this system. The donor pays entirely
  within their own UPI app; this site never touches money.
- **Not a system that automatically verifies payment.** The uploaded
  screenshot is the donor's claim, reviewed by a human. "Verification" in
  this codebase always means human admin review via the dashboard, never
  an automated check of a bank transaction.
- **Not a multi-tenant or multi-campaign system.** One donation type, one
  currency (₹), one UPI-based flow, one admin account.
- **Not internationalized.** ₹ and Indian UPI conventions are hardcoded
  assumptions throughout.

---

## 2. User Flows

### Donor flow

```
landing page
  → donation amount (AmountStep — live-validated, ₹300–₹3000)
      → above ₹3000: shown a "call us" message with a tel: link instead
  → payment instructions (PaymentStep — QR code + UPI ID + copy button)
  → "I've Paid" (advances outer step, no backend call yet)
  → confirmation form (ConfirmationStep):
      → screenshot upload (ScreenshotUploader / useScreenshotUpload)
      → full name, address, amount paid (re-validated independently)
      → submit
  → client-side validation (validateConfirmationForm)
      → invalid: focus moves to first invalid field, errors shown inline
  → submission (donationService.submitDonation):
      1. direct browser upload to private Vercel Blob (presigned URL)
      2. POST /api/donations with the resulting Blob URL + form data
  → server-side validation, idempotency check, rate limit, magic-byte
    image verification, insert (see §4 Backend)
  → success (SuccessStep — quiet confirmation, no confetti; "Back to Home"
    or "Share the Mission")
```

**Important edge cases actually handled:**
- **Amount above ₹3000:** the amount field shows a `tel:` link to a
  placeholder phone number instead of letting the donor proceed — no
  backend involvement, purely a frontend branch in `AmountStep`.
- **Double-click / network retry on final submit:** the confirmation form
  disables re-submission while `submission === 'submitting'`
  (`ConfirmationStep.tsx`), and the idempotency key (generated once per
  attempt) means even a retry that reaches the server twice is absorbed as
  a no-op, not a duplicate donation (see §6 Security).
- **Submission failure:** `SUBMIT_FAILED` never clears the form's `values`
  — the donor's typed data and selected screenshot survive an error, so
  they can just press submit again rather than re-entering everything.
- **Replacing an already-selected screenshot:** the previous object URL is
  revoked immediately and synchronously (not inside the upload's delayed
  callback) — see §8's historical-bug entry for why this mattered.
- **Screenshot fails client-side type/size checks:** rejected before any
  network activity, with an inline error (`useScreenshotUpload`'s `invalid`
  state) — the 8MB/PNG-JPEG-WEBP limits are shared constants
  (`shared/screenshotLimits.ts`) also enforced server-side.

### Admin flow

```
admin login (LoginPage, /admin.html)
  → POST /api/admin/login (email + password, bcrypt-verified)
  → session created (DB row in admin_sessions) + httpOnly cookie set
  → dashboard (DashboardPage):
      → summary tiles (total submissions, total ₹ donated, pending count)
        — always computed across ALL donations, independent of the active
        filter
      → status filter (all / pending / reviewed / rejected)
      → paginated table (20 per page)
  → select a donation → submission detail (SubmissionDetail):
      → full record (name, address, amount, submitted date, status)
      → payment screenshot, fetched through the authenticated
        /api/admin/donations/[id]/screenshot route (never the raw,
        private Blob URL)
      → status change: pending → reviewed | rejected, or reset back to
        pending from either
  → logout (POST /api/admin/logout — deletes the session row server-side,
    then clears the cookie)
```

**Important edge cases actually handled:**
- **Session expiry:** every admin route calls `getAdminIdentity`/`requireAdmin`,
  which checks the session row's `expiresAt` against the current time on
  every request — an expired session is treated identically to no session
  (401), not trusted just because the cookie is present.
- **Unauthenticated access to any `/api/admin/*` or admin-gated
  `/api/donations*` route:** 401 with `{ error: { message: "Authentication
  required." } }`, uniform across every admin route via the shared
  `requireAdmin` guard.
- **Donation not found (bad id in the URL):** `GET`/`PATCH /api/donations/[id]`
  and the screenshot route all return 404, not a 500 or an empty success.
- **A donation with no screenshot URL:** the screenshot route returns 404
  rather than attempting a Blob fetch that would fail anyway (defensive,
  since every current donation is created with a screenshot required, but
  the schema's `screenshotUrl` doesn't itself forbid this at the type
  level in every code path).

---

## 3. Frontend

### Stack and structure

Vite + React 19 + TypeScript (strict mode), Tailwind CSS v4 via
`@tailwindcss/vite`. Two build entries: `index.html` (public donor SPA) and
`admin.html` (admin SPA), configured in `vite.config.ts`'s
`build.rollupOptions.input`. No router (neither app needs one — the public
site is a single scrolling page with in-page section anchors, and the admin
app has exactly two views managed by local `useState`). No global state
library, no UI component library, no animation library.

```
src/
  components/
    layout/      Footer
    navigation/   Header (scroll-aware surface via IntersectionObserver,
                  mobile menu with Escape-to-close + focus return)
    hero/         Hero section + GatheringPoint (the signature SVG/CSS
                  animation)
    mission/      "Why One Pizza Matters" + EchoMark (static SVG, reuses
                  the hero's own visual motif instead of stock photography)
    impact/       Impact stats + useCountUp (the app's one deliberate
                  continuous-JS-animation exception — see §3's Animations)
    donation/     The donation flow (detailed below)
      steps/      AmountStep, PaymentStep, ConfirmationStep, SuccessStep
    testimonials/ Editorial crossfade (hand-rolled phase state machine)
    faq/          Accordion
    ui/           Button, Container, TextLink, useScrollReveal, useAutoFocus
  admin/          Second entry point — see below
  styles/         Tailwind entry, design tokens (CSS custom properties),
                  hero.css (keyframes), shared .reveal/.step-enter utilities
  App.tsx         Composes every public section in page order
  main.tsx        Public entry point
```

### State management: three purpose-scoped machines, not one big reducer

The donation flow is the most complex part of the frontend, and it is
deliberately three small, independent pieces rather than one large reducer
or a pile of booleans:

1. **`donationReducer`** (`src/components/donation/donationReducer.ts`) —
   owns which of 4 screens is showing (`amount → payment → confirmation →
   success`). 4 actions (`AMOUNT_CONFIRMED`, `PAYMENT_CONFIRMED`,
   `SUBMISSION_SUCCEEDED`, `RESTART`), changes a handful of times per
   donation, owned by `DonationSection`.
2. **`confirmationFormReducer`** (`.../confirmationFormReducer.ts`) — owns
   the confirmation form's field values, per-field validation errors, and
   submission status (`idle → submitting → error`, success bubbles up to
   the outer flow via a callback). 4 actions (`FIELD_CHANGED`,
   `VALIDATION_FAILED`, `SUBMIT_STARTED`, `SUBMIT_FAILED`), changes on
   every keystroke, owned by `ConfirmationStep`. `validateConfirmationForm`
   is a pure function, independently testable, returning a `FormErrors`
   object — synchronous, since nothing in this form's validation is async.
3. **`useScreenshotUpload`** — a third, independent state machine for the
   screenshot's own lifecycle: `empty → uploading → uploaded`, with
   `invalid`/`error` side branches. Doesn't map onto either of the above,
   so it isn't folded into either reducer.

They're split because they change for different reasons at different
rates — merging the form reducer into the step reducer would mean every
keystroke re-evaluates step-transition logic that has nothing to do with
typing; only 1 of the 4 outer steps (`confirmation`) has any field state at
all. `ConfirmationStep` composes all three (the form reducer, the upload
hook, and a callback to advance the outer reducer) without any of them
knowing about the others' internals.

### Form handling and validation

`validateConfirmationForm(values, uploadState)` checks name/address
non-empty, amount within ₹300–3000 (imported from `shared/donationLimits.ts`
— the same constant the server re-validates against), and the upload
state's status (rejecting `uploading`/`invalid`/`error`/`empty`). On a
failed submit, focus moves to the first invalid field in a fixed priority
order (`fullName → address → amountPaid → screenshot`) via
`document.getElementById(...).focus()`, because `aria-describedby` alone
associates an error with its field but never announces anything until that
field is actually focused. Editing a field clears only that field's own
error (`FIELD_CHANGED` only touches `errors[field]`), so fixing one mistake
never hides a still-real error on another field. Errors don't reappear
until the next submit attempt — deliberately not revalidated on every
keystroke, since that tends to read as the form scolding the user
mid-sentence.

### Screenshot preview/upload behavior

`useScreenshotUpload` models "uploading" as **local file processing**, not
a network call — a preview URL (`URL.createObjectURL`) is generated after a
short, honest 500ms synthetic delay purely so the state is perceivable
instead of an instant flash (disclosed in the hook's own comment, not left
to look like a fake "upload succeeded" claim). The actual network transfer
happens exactly once, when the whole form submits, via
`donationService.submitDonation`'s direct-to-Blob upload. Object URLs are
revoked (`URL.revokeObjectURL`) on replace, on remove, and on unmount while
one is still held — tracked via a `ref` (not state) so revocation can
happen inside effect cleanup without triggering a render. See §8 for a real
bug found and fixed in this exact area.

### Accessibility work (implemented, not just planned)

- Every donation-flow step focuses its own `<h2>` on mount
  (`useAutoFocus`, `tabIndex={-1}`) — fixes focus silently dropping to
  `<body>` when the clicked button that advanced the step disappears from
  the DOM.
- Failed confirmation-form submission focuses the first invalid field (see
  Form handling above).
- Closing the mobile menu via Escape returns focus to its toggle button.
- Testimonial navigation uses plain `<button>`s with `aria-current`, not
  `role="tab"`/`"tablist"` (which would imply arrow-key roving focus that
  isn't implemented).
- 44×44px minimum touch targets on every donation-flow button, the
  screenshot uploader's controls, FAQ accordion triggers, and testimonial
  dots (a 44px button wraps each dot's small visual pill).
- `--color-red-deep` (≈5.1:1 contrast on cream), not the brand
  `--color-red` (≈3.96:1), used for all readable error text — the original
  red is kept for icons/borders, which only need 3:1.
- QR code has real `role="img"` + `aria-label` alt text; the UPI ID is also
  shown as separate, selectable plain text next to it.

### Responsive behavior

Verified at 375/768/1024/1440px with no overflow (`CLAUDE.md` Phase 3).
Tailwind utility breakpoints throughout; no separate mobile-only components.

### Animations

The hero's "Gathering Point" + "Absorbed Facet" animation is the site's
only continuous ambient motion — see `CLAUDE.md` §3 for the full mechanism
and its debugging history (summarized in §8 below). Every other animation
is triggered by a discrete user action (hover, focus, scroll-into-view via
`useScrollReveal`, form state, step transition) and runs once or on demand.
Two deliberate, documented exceptions to "CSS transform/opacity only": (1)
`useCountUp`'s single finite `requestAnimationFrame` count-up (~1.1s,
cleaned up on completion/unmount) for the Impact section's four numbers,
and (2) the FAQ accordion's `grid-template-rows` transition, the one
layout-triggering CSS property used anywhere, because it is the only
known-good CSS technique for animating to an unknown `auto` height and is
scoped to one small subtree. All scroll-driven behavior uses
`IntersectionObserver`, never a `scroll` event listener.

### Performance considerations

No `backdrop-filter`, no continuous `box-shadow` animation, no particle
system/canvas anywhere. Only the font weights with an actual audited use
are self-hosted (Outfit 500/600/700, Plus Jakarta Sans 400/500/600).
Lighthouse results are in §11.

### CSP

Enforced via `vercel.json` (see `Docs/DECISIONS.md`'s API/Security section
for the exact policy and reasoning). Only meaningfully testable against a
live/preview deployment, since `vite dev`/`vite preview` don't apply these
headers.

### Admin frontend entry and public/admin bundle separation

`admin.html` mounts `src/admin/`'s `AdminApp` into `#admin-root`, built as
a genuinely separate bundle via Vite's multi-page `build.rollupOptions.input`.
`AdminApp` owns two pieces of `useState`: auth-check status (`checking` /
`loggedOut` / `loggedIn`) and which of two views is showing (`dashboard` /
`detail`) — no router. `src/admin/api.ts` centralizes every `fetch` call to
`/api/admin/*` and `/api/donations*`, throwing a typed `ApiError` (with the
HTTP status) on any non-2xx response. Verified by comparing actual built
output sizes: the public bundle (`main` + shared chunk) is unaffected by
the admin app's existence (374.01 kB vs. a pre-split 374.23 kB baseline);
the admin-specific chunk (~11 kB) is only downloaded by someone who visits
`/admin.html`.

---

## 4. Backend

### Vercel Function structure

```
api/
  donations/
    index.ts            POST (public, rate-limited) — create a donation
                         GET  (admin-only) — paginated, status-filterable
                         list + summary
    [id].ts              GET (admin-only) — donation detail
                         PATCH (admin-only) — status transition
  uploads/
    screenshot.ts         POST — issues a constrained, OIDC-authenticated
                         Vercel Blob presigned upload token
  admin/
    login.ts               POST — bcrypt-verify + create session
    logout.ts               POST — delete session row + clear cookie
    me.ts                    GET — current admin identity or 401
    donations/[id]/
      screenshot.ts         GET — admin-only, streams the private
                         screenshot server-side
  _lib/
    validation.ts           Zod schemas (server-side re-validation)
    donations.ts             createDonation / listDonations /
                         getDonationById / updateDonationStatus /
                         getDonationSummary
    auth.ts                    Session lifecycle + requireAdmin guard
    password.ts                bcrypt hash/verify (no db import)
    rateLimit.ts                Postgres fixed-window counter
    magicBytes.ts                Image signature sniffing
    http.ts                       sendError/sendJson/methodNotAllowed/
                         getClientIp
```

`api/_lib/` is never treated as a route (Vercel's underscore-prefix
convention) — this is also why `adminScreenshotRoute.integration.test.ts`
was moved there from beside the route file it tests (see §8's historical
bug on a test file being deployed as a real function).

### Endpoint table

| Method | Endpoint | Purpose | Auth | Important behavior |
|---|---|---|---|---|
| `POST` | `/api/donations` | Create a donation | Public, rate-limited (10/hr per IP) | Idempotency-key check before rate limit/image verification; server-side magic-byte screenshot check; orphaned-blob cleanup on every rejection path; `201` on new, `200` on idempotent replay |
| `GET` | `/api/donations` | List donations (paginated, status-filterable) + always-unfiltered summary tiles | Admin (`requireAdmin`) | `page`/`pageSize`/`status` via Zod query schema; summary is computed across all donations regardless of the active filter |
| `GET` | `/api/donations/[id]` | Donation detail | Admin | 404 if not found |
| `PATCH` | `/api/donations/[id]` | Update donation status (`pending`/`reviewed`/`rejected`) | Admin | 404 if not found; Zod-validated status enum |
| `POST` | `/api/uploads/screenshot` | Issue a presigned Vercel Blob upload token | Public (no session required — needed before the donor has submitted anything) | Constrained to `image/png`/`jpeg`/`webp`, 8MB max, `access: 'private'`, random-suffixed pathname; OIDC-authenticated via `issueSignedToken` |
| `POST` | `/api/admin/login` | Admin login | Public, rate-limited (20/hr per IP) | Timing-safe against email enumeration (dummy bcrypt hash compared for unknown emails); sets `httpOnly`/`SameSite=Strict` session cookie |
| `POST` | `/api/admin/logout` | Admin logout | Session cookie (no `requireAdmin` gate — safe to call even with an already-invalid/missing session) | Deletes the session row server-side, then clears the cookie |
| `GET` | `/api/admin/me` | Current admin identity | Admin | Used by `AdminApp` on mount to decide login vs. dashboard |
| `GET` | `/api/admin/donations/[id]/screenshot` | Stream a donation's private screenshot | Admin | Blob URL resolved server-side from the DB row only, never from request input; `Cache-Control: private, no-store`; streams bytes, never returns the underlying Blob URL |

### Request/response behavior and error handling

Every route follows the same shape: parse/validate input with Zod (400 on
failure, first Zod issue's message returned), perform the operation inside
a `try/catch` (500 with a generic, safe message on unexpected failure —
internal error detail is `console.error`-logged server-side only, never
returned to the client), and a consistent `{ error: { message } }` body via
`sendError`/`sendJson`/`methodNotAllowed` (`api/_lib/http.ts`). Unsupported
HTTP methods get a 405 with an `Allow` header listing the supported
methods.

### Donation creation flow (`createDonation`)

See `Docs/DECISIONS.md`'s "Idempotency key checked before the rate limiter"
entry for the full reasoning. In order:
1. Look up an existing row by `idempotencyKey`. If found, it's a retry —
   clean up the just-uploaded blob if it differs from the original (a donor
   who retries after re-selecting a different screenshot shouldn't leave
   the new one orphaned), and return the original donation (`duplicate`
   outcome, `200`).
2. Atomically check-and-increment the `donation:<ip>` rate-limit counter.
   Over the limit → delete the uploaded blob, return `rate_limited` (`429`).
3. Verify the screenshot's real bytes are a recognized image format (not
   just the declared MIME type). Fails → delete the blob, return
   `invalid_screenshot` (`400`).
4. Insert, with `onConflictDoNothing` on the idempotency-key unique index
   as a second line of defense against a genuine race (two requests with
   the same key arriving concurrently, both passing step 1). If the insert
   loses that race, re-read the winning row, clean up this request's blob,
   and return it as `duplicate`.

### Blob lifecycle and cleanup

Upload happens client-side, directly to Blob, before the donation `POST` is
ever sent. Every rejection path in `createDonation` (duplicate with a
different screenshot, rate-limited, invalid image) triggers
`safeDeleteBlob()` — a best-effort delete that logs and swallows its own
failure rather than compounding the original rejection with a second error.

### Admin APIs, authentication, and authorization

Covered in full in `Docs/DECISIONS.md`'s Authentication section. In
summary: `requireAdmin(req, res)` is the single gate every admin-only route
calls; it reads the session cookie, hashes it, looks up the corresponding
`admin_sessions` row joined to `admin_users`, and checks `expiresAt`
against the current time — the cookie's mere presence is never trusted on
its own.

---

## 5. Database

### Schema (as implemented in `db/schema.ts`)

**`donations`**
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid`, PK, default random | |
| `full_name` | `text`, not null | |
| `address` | `text`, not null | |
| `amount_paid` | `integer`, not null | Whole rupees — no paise, no float |
| `screenshot_url` | `text`, not null | Vercel Blob URL |
| `status` | enum (`pending`/`reviewed`/`rejected`), not null, default `pending` | |
| `idempotency_key` | `uuid`, not null, **unique** | One per submission attempt, not per HTTP request |
| `ip_address` | `text`, nullable | From `x-forwarded-for` |
| `created_at` / `updated_at` | `timestamptz`, not null, default now | |

Indexes: `donations_idempotency_key_key` (unique — the real idempotency
guarantee, not just an app-level check), `donations_created_at_idx`
(unfiltered admin listing), `donations_status_created_at_idx` (composite,
`status` then `created_at` — the filtered listing's exact query shape).

**`admin_users`**
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid`, PK | |
| `email` | `text`, not null, **unique** | |
| `password_hash` | `text`, not null | bcrypt, cost 12 |
| `created_at` | `timestamptz`, default now | |

**`admin_sessions`**
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid`, PK | |
| `user_id` | `uuid`, not null, FK → `admin_users.id`, `ON DELETE CASCADE` | |
| `token_hash` | `text`, not null, **unique** | SHA-256 of the raw token — raw token never stored |
| `expires_at` | `timestamptz`, not null | 12 hours from creation |
| `created_at` | `timestamptz`, default now | |

**`rate_limits`**
| Column | Type | Notes |
|---|---|---|
| `key` | `text` | Purpose-prefixed (`donation:<ip>`, `login:<ip>`) |
| `window_start` | `timestamptz` | Current hour, truncated |
| `count` | `integer`, default 0 | |

Composite primary key `(key, window_start)` — this is what makes the atomic
upsert (`INSERT ... ON CONFLICT (key, window_start) DO UPDATE SET count = count + 1`)
possible with no separate check-then-write race.

**Relationships:** `admin_sessions.user_id → admin_users.id` is the only
foreign key in the schema. `donations` and `rate_limits` are standalone —
no relationship between a donation and a rate-limit row (the counter is
keyed by IP, not by donation).

### Important query patterns

- **Admin list, unfiltered:** `ORDER BY created_at DESC LIMIT ? OFFSET ?`
  — served by `donations_created_at_idx`.
- **Admin list, filtered:** `WHERE status = ? ORDER BY created_at DESC
  LIMIT ? OFFSET ?` — served by the composite `donations_status_created_at_idx`
  in a single index scan.
- **Summary tiles:** a single aggregate query
  (`count(*)`, `sum(amount_paid)`, `count(*) filter (where status = 'pending')`)
  over the whole table, deliberately not filtered by the dashboard's active
  status filter.
- **Rate-limit check:** the one atomic upsert described above, returning
  the post-increment `count` in the same statement.
- **Session verification:** `admin_sessions` inner-joined to `admin_users`
  on `user_id`, filtered by `token_hash`, checked against `expires_at` —
  one query per authenticated request.

---

## 6. Authentication / Security

### Complete security model, in implementation terms

**Password storage:** `bcryptjs` (pure JS, cost 12) — never a native
binding, to avoid a Windows-dev/Linux-runtime cross-compile problem.
**Protects against:** a leaked `admin_users` table (e.g. a DB backup) not
directly yielding usable passwords; bcrypt's slow-by-design hashing also
raises the cost of an offline brute-force attempt against a stolen hash.

**Sessions:** Opaque random 32-byte tokens, stored client-side only as an
`httpOnly` cookie; server-side state is the authoritative source of truth
in `admin_sessions`. **Protects against:** XSS-driven token theft
(`httpOnly` — no JS on the page, injected or otherwise, can read the
cookie) and CSRF against admin endpoints (`SameSite=Strict` — the cookie is
never sent on a cross-site request). Does **not** protect against a
man-in-the-middle on an unencrypted connection in development (`Secure` is
only set when `NODE_ENV === 'production'`, since browsers reject `Secure`
cookies over plain `http://`).

**Session token hashing:** Only a SHA-256 hash of the token is stored.
**Protects against:** a leaked database (backup, replica) alone being
sufficient to forge a valid session — an attacker would need the raw
token, which only ever exists in the admin's own cookie jar and in the
one HTTP response that set it.

**Logout:** Deletes the `admin_sessions` row server-side, then clears the
cookie. **Protects against:** a copied/leaked cookie value remaining
usable after the legitimate admin has logged out — clearing the cookie
alone would not achieve this.

**Authorization boundary:** every admin-only route calls `requireAdmin`,
which re-verifies the session against the database on every single
request — there is no cached "already checked" shortcut and no route that
trusts the cookie's mere presence.

**Client vs. server validation trust boundary:** the frontend's own
validation (`validateConfirmationForm`) exists purely for UX — instant
feedback, no round trip. The server (`api/_lib/validation.ts`'s Zod
schemas) re-implements every one of those same rules independently and is
the only validation that actually matters, because any HTTP client (not
just this app's own browser bundle) can call these endpoints directly.

**Rate limiting:** Postgres-backed fixed-window counters, 10/hour for
donation submissions and 20/hour for login attempts, keyed by
purpose-prefixed IP (`donation:<ip>` / `login:<ip>`). **Protects against:**
scripted/repeated abuse of either endpoint from a single network address.
**Does not protect against:** a distributed attacker rotating IPs, or a
sophisticated attacker operating well under the generous threshold — this
is a documented, accepted low-traffic-app tradeoff, not a claim of strong
abuse resistance. There is no CAPTCHA or bot-challenge anywhere in the
system.

**Idempotency:** a client-generated UUID per submission attempt, enforced
unique at the database level. **Protects against:** duplicate donation
rows from network retries or double-clicks — this is a UX/data-integrity
mechanism, not a security control, though it does incidentally prevent a
trivial "resubmit the same request repeatedly" pattern from creating
unbounded rows (the rate limiter is the actual defense against that).

**Private Blob access:** screenshots live in a Blob store configured
`access: 'private'`; the raw Blob URL is never returned to any browser —
donors never see it (they only ever `PUT` to a presigned upload URL), and
admins retrieve the image only through the authenticated
`/api/admin/donations/[id]/screenshot` proxy route. **Protects against:** a
guessed or leaked Blob URL being independently viewable — even the exact
URL, on its own, is not enough without the OIDC credentials this server
holds server-side.

**Image content verification:** server-side magic-byte sniffing of the
actual uploaded bytes, independent of the declared `Content-Type`.
**Protects against:** a non-image file (or a file with a spoofed
`Content-Type`) being accepted as a donation's screenshot — the check
inspects real leading bytes against known PNG/JPEG/WEBP signatures.

**CSP / security headers:** `X-Content-Type-Options: nosniff` (protects
against MIME-sniffing-based content-type confusion attacks),
`X-Frame-Options: DENY` (protects against clickjacking via iframe
embedding), `Referrer-Policy: strict-origin-when-cross-origin` (limits
referrer leakage to other origins), and a CSP restricting script/style/
connect/img sources to `'self'` plus the one genuinely-used Blob origin.
`/api/*` additionally sends `Cache-Control: no-store`, so API responses are
never cached by an intermediate or browser cache.

### What this security model does NOT claim

- It does not verify that a real UPI payment occurred — see §1.
- It is not resistant to a well-resourced, distributed attacker; the rate
  limiter is a low-traffic-app-appropriate deterrent, not a hardened
  defense.
- There is no email verification, 2FA, or password-reset flow for the
  admin account — rotating the password requires re-running
  `db:seed-admin` with database/deploy access.

---

## 7. File / Storage Architecture

```
Browser
  → POST /api/uploads/screenshot          (issues a presigned upload token,
                                            OIDC-authenticated server-side,
                                            constrained to type/size)
  → direct PUT to the presigned URL       (browser → Vercel Blob directly;
                                            never passes through this app's
                                            own function body)
  → private Vercel Blob                    (access: 'private', random
                                            pathname + random suffix)
  → POST /api/donations                    (metadata + the resulting Blob
                                            URL, server re-verifies the
                                            blob's real bytes via
                                            magic-byte sniffing before
                                            inserting a donation row)
  → Blob reference stored in Neon          (donations.screenshot_url —
                                            just the URL string; Neon never
                                            holds the image bytes)
  → authenticated server retrieval         (admin dashboard only, via
                                            GET /api/admin/donations/[id]/screenshot,
                                            which resolves the URL from the
                                            DB row and streams the bytes;
                                            the raw Blob URL is never sent
                                            to any browser)
```

**Why screenshots are private:** a payment screenshot is a donor's
personal proof-of-payment document — potentially containing partial account
details depending on what their UPI app's confirmation screen shows. There
is no legitimate reason for it to be publicly fetchable by anyone with the
URL, so the store is configured `access: 'private'` and every read path
(both the server-side magic-byte verification and the admin dashboard's
viewing) goes through OIDC-authenticated SDK calls, never a public URL.

---

## 8. Testing

### Test categories and what each covers

**Frontend unit/component tests** (Vitest, `node` environment by default,
`jsdom` opt-in per file) — currently **30 tests passing across 5 files**
(verified by running `npx vitest run` directly against this repository):
- `api/_lib/password.test.ts` — bcrypt hash/verify round-trip, zero
  database dependency (see §Backend/password module decision).
- `src/components/donation/confirmationFormReducer.test.ts` — every
  validation branch and every reducer action.
- `src/components/donation/donationReducer.test.ts` — every step
  transition.
- `src/components/donation/useScreenshotUpload.test.ts` — full upload
  lifecycle, including a regression test asserting `URL.revokeObjectURL`
  is called on replace (protects against the historical bug in §9).
- `src/components/donation/steps/ConfirmationStep.test.tsx` — including a
  regression test for the failed-validation-focus fix (submits an
  incomplete form, asserts focus lands on the first invalid field).

**Backend integration tests** (Vitest, separate `vitest.integration.config.ts`,
run only via `npm run test:integration`, requiring a real `DATABASE_URL`)
— **28 test cases across 4 files** (counted directly from the current
repository's test files):
- `api/_lib/donations.integration.test.ts` (9 cases) — `createDonation`:
  creation, real-image-signature rejection, idempotency no-op, the DB-level
  unique constraint under a race, rate-limit enforcement.
- `api/_lib/donationsAdmin.integration.test.ts` (8 cases) — `listDonations`
  pagination/status filtering, `getDonationById` not-found handling,
  `updateDonationStatus`, `getDonationSummary` aggregation.
- `api/_lib/auth.integration.test.ts` (6 cases) — session creation,
  expiry, invalidation.
- `api/_lib/adminScreenshotRoute.integration.test.ts` (5 cases) — the
  authenticated screenshot retrieval route.

Per `CLAUDE.md`'s Phase 10 entry, these were confirmed passing against a
real Postgres via GitHub Actions CI (not just "fails for the expected
reason" as in earlier phases) — this session did not re-run them locally,
since no `DATABASE_URL` is configured in this environment; the count above
is a direct count of test cases in the current files, not a re-verified
pass/fail result from this session.

### Integration test environment

A real Postgres is required — either a GitHub Actions `postgres:16` service
container (CI) or a real Neon branch / local Postgres (manual runs). Test
isolation is `TRUNCATE`-per-test (`db/testUtils.ts`), which is only safe
because `fileParallelism: false` forces integration test files to run
sequentially (see `Docs/DECISIONS.md` for the concurrency bug this fixed).
`testTimeout: 20000` accommodates real network latency to a remote Neon
branch specifically (CI's own service container is well within the
original 5000ms default).

### Important tests and the bugs they protect against

- `useScreenshotUpload.test.ts`'s revoke-on-replace assertion — protects
  against the object-URL leak described in §9.
- `ConfirmationStep.test.tsx`'s focus-after-failed-submit assertion —
  protects against the focus-management regression class described in §9
  and `Docs/DECISIONS.md`.
- `donations.integration.test.ts`'s idempotency/unique-constraint cases —
  protect against duplicate donation rows under retry or a genuine race.
- `donations.integration.test.ts`'s rate-limit case — protects against the
  donation endpoint accepting unlimited submissions from one IP.

---

## 9. Important Historical Bugs / Lessons

Each entry: **Problem → Root cause → Fix → Lesson.**

### Vercel NodeNext/ESM import-extension mismatch

**Problem:** The first real Vercel deployment failed to build, with
`TS2835` errors on every relative import under `api/`, `db/`, and
`shared/`. **Root cause:** `tsconfig.api.json` used `moduleResolution:
"bundler"` on the assumption that Vercel "bundles" these functions. In
reality, this project's `package.json` sets `"type": "module"`, so Vercel
compiles/runs `/api/*.ts` as genuine Node ESM — which, unlike a bundler,
does not infer file extensions on relative import specifiers at all. `tsc
-b` and CI had never caught this because they used the same too-lenient
`bundler` setting, internally consistent with its own wrong assumption
rather than with Vercel's actual runtime. **Fix:** switched to
`moduleResolution: "nodenext"` and added explicit `.js` extensions to every
relative import across 19 files (55/56 import lines). **Lesson:** "passes
CI" and "deploys cleanly" were checking two different things without
either side knowing it — a local/CI type-check config that doesn't model
the real deployment runtime can pass while the real deploy fails for a
reason CI structurally cannot see.

### Private Blob token/OIDC mismatch

**Problem:** The original screenshot-upload implementation used the legacy
`handleUpload()`/`upload()` client-token flow against a public Blob store.
**Root cause:** Vercel's dashboard "Connect to Project" flow now
provisions Blob access via OIDC (`VERCEL_OIDC_TOKEN` + `BLOB_STORE_ID`) by
default and does not mint a `BLOB_READ_WRITE_TOKEN` for that path — but
`handleUpload()` requires that static token to sign client tokens and
cannot use OIDC credentials at all. Separately, reading the installed
`@vercel/blob` SDK's own source showed the legacy flow's client token never
even encoded an `access` level, so the server had no way to bind or verify
that an upload was actually private. **Fix:** migrated to
`issueSignedToken()` + `uploadPresigned()`/`handleUploadPresigned()` (the
Signed URLs flow), which accepts OIDC credentials directly and whose
`access` option is a real, enforced part of the presigned-URL flow, with
the store genuinely configured `access: 'private'`. **Lesson:** confirming
a claimed security property ("this is private") requires checking that the
mechanism actually enforces it — reading the SDK's own source to see what
the client token payload contained was what actually exposed the gap; the
original "public store, unguessable URL" description of the pre-migration
state was an honest downgrade of a claim that didn't hold up, not the
originally intended design.

### Private screenshot read-path

**Problem:** Once uploads switched to `access: 'private'`, the admin
dashboard's `SubmissionDetail.tsx` broke — its direct `<img src={donation.screenshotUrl}>`
usage stopped working, because that URL was no longer directly
browser-fetchable. **Root cause:** a direct architectural consequence of
the OIDC/private-store migration above; the frontend's read path hadn't
been updated to match. **Fix:** added `GET /api/admin/donations/[id]/screenshot`,
an admin-gated route that resolves the donation's Blob URL from the
database itself (never from request input), fetches it server-side via the
SDK's `get(url, { access: 'private' })`, and streams the bytes through the
response — the raw Blob URL never reaches the browser. `SubmissionDetail.tsx`
changed by one line (pointing its `<img>`/`<a>` at the new route instead of
`donation.screenshotUrl`), needing no new client-side auth wiring since a
same-origin request already carries the admin's session cookie. **Lesson:**
tightening a data-access boundary on the storage side has a real,
predictable frontend consequence — the fix belongs on the server (resolve
the URL from trusted state, stream the bytes) rather than weakening the
storage access level back down to make the old frontend code keep working.

### Server-side magic-byte verification using an unauthenticated fetch

**Problem:** After the store became private, the server-side screenshot
verification step (checking real image bytes via `fetch()` against the
Blob URL and a `Range` header) would have started failing on every real
submission. **Root cause:** an unauthenticated `fetch()` against a private
Blob URL returns 401/403, not the file's bytes — the same access-level
change that broke the admin `<img>` tag also broke this server-side check,
just less visibly (it would silently reject every real donation as having
an "invalid screenshot," not raise an obvious deploy-time error). **Fix:**
replaced the raw `fetch()` with the Blob SDK's own `get(url, { access:
'private' })`, which resolves the same OIDC credentials the upload route
already uses, and reads only the leading bytes needed for signature
sniffing (16 bytes, matching the longest — WEBP — signature check) via the
stream reader, cancelling the rest rather than buffering a full 8MB file.
**Lesson:** a single access-level change can break more than one call site
that reads the same resource — this bug was caught by reasoning through
every remaining direct-fetch/URL usage after the migration, not just the
one that was visibly broken in the browser.

### Test file accidentally deployed as a Vercel function

**Problem:** A real Vercel deployment's build manifest showed
`adminScreenshotRoute.integration.test.ts` (Vitest's test file for the
admin screenshot route) built and deployed as its own serverless function.
**Root cause:** the test file lived directly beside
`api/admin/donations/[id]/screenshot.ts`, inside a normal (non-underscore)
folder under `api/` — Vercel treats every file under `api/` as a route
candidate except inside `_`-prefixed folders, and a `.test.ts` file is no
exception to that convention. **Fix:** moved the test into `api/_lib/`,
the one location already proven excluded from routing (where every other
`_lib` module and its tests already live). **Lesson:** Vercel's
file-system routing convention applies to every file under `api/`
regardless of intent or extension — a test file's location has to respect
the same `_`-prefix rule as production route files, confirmed here by
reading an actual deployment's build manifest rather than assuming the
`.test.ts` extension would be excluded.

### Integration tests timing out / failing against real infrastructure (two related issues)

**Problem 1 (file-level race):** the first real CI run found 3 of 20
integration tests failing with row counts that were multiples of what each
test itself inserted, and a rate-limit test that never reached its
threshold. **Root cause:** Vitest runs test files concurrently by default,
each in its own worker; all the integration test files shared one physical
Postgres with no per-file isolation, so one file's `TRUNCATE`/inserts could
land mid-test in another file. **Fix:** `fileParallelism: false` in
`vitest.integration.config.ts`, forcing all integration files to run
sequentially — tests *within* a file were never the problem, since Vitest
already serializes those. **Lesson:** "tests pass locally, one file at a
time" and "tests pass in a full concurrent run" are different claims;
concurrency bugs in test infrastructure look exactly like flaky
application bugs (multiplied row counts, a counter that "never" reaches
its threshold) until traced to the runner's own execution model.

**Problem 2 (remote-Neon timeout):** run manually against a real Neon
branch rather than CI's local service container, the rate-limit tests'
multi-iteration loop (each iteration making several sequential DB round
trips) exceeded Vitest's default 5000ms test timeout. **Root cause:** real
network latency to a remote Neon branch (measured 6–7s for the same loop
that runs well under 5s against CI's same-network Postgres container) — a
test-infrastructure limitation, not application slowness. **Fix:**
`testTimeout: 20000` in `vitest.integration.config.ts`, scoped to the
integration config only (unit tests keep the default). **Lesson:** a
timeout tuned against one Postgres (CI's local container) doesn't
necessarily hold against another (a real remote branch) — the fix is
sized to the actual measured difference, not an arbitrary "just make it
bigger" bump, and is explicitly documented as a test-infrastructure
accommodation so it isn't later mistaken for a production rate-limit
change.

### `useScreenshotUpload`'s replace-file object-URL leak

**Problem:** Replacing an already-selected screenshot never revoked the
previous preview's object URL, leaking browser memory on repeated
replacement. **Root cause:** the delayed `setTimeout` callback's own
`setState((prev) => ...)` check for `prev.status === 'uploaded'` could
never actually see that state, because the synchronous `setState({status:
'uploading'})` call right before the timeout had already overwritten it by
the time the timeout fired. **Fix:** revoke the previous preview URL
synchronously, immediately when a new file is selected — before
transitioning to `'uploading'` — rather than inside the delayed callback's
state updater. **Lesson:** found by a test asserting the revoke call was
made, not by reading the code — the bug was a timing/ordering mistake
invisible from a static read of the `setState` updater's logic in
isolation.

---

## 10. CI/CD

**GitHub Actions** (`.github/workflows/ci.yml`), triggered on every pull
request and on push to `main`, against a real `postgres:16` service
container (not a mock, not a persistent shared database):

```
checkout → setup-node(24) → npm ci
  → typecheck (tsc -b)
  → lint (eslint)
  → format check (prettier --check)
  → apply database migrations (npm run db:migrate — also a migration-drift
    check: a migration that doesn't apply cleanly to a real Postgres fails
    here, before it ever reaches Neon)
  → unit tests (npm test)
  → integration tests (npm run test:integration)
  → build (npm run build)
```

`DATABASE_URL` for the job points at the local service container
(`postgres://postgres:postgres@localhost:5432/s1p_test`); `db/client.ts`
skips requiring TLS for this connection specifically because it isn't a
`neon.tech` hostname.

**Deployment:** Vercel, connected to the GitHub repository. The CI
workflow itself does not perform any deployment — Vercel's own Git
integration handles preview deployments per pull request and production
deployment on merges to `main`, independently of the GitHub Actions
workflow. Manual redeploys use `npx vercel deploy --prod --project
sacrifice-one-pizza`.

---

## 11. Performance

Measured against the production build via `vite preview` (not the dev
server), desktop and mobile Lighthouse runs, as recorded in `CLAUDE.md`'s
Phase 9 entry:

**Before fixes:**
| Category | Desktop | Mobile |
|---|---|---|
| Performance | 100 | 95 |
| Accessibility | 96 | — |
| Best Practices | 100 | — |
| SEO | 92 | — |

Two specific, real findings (not simulated/invented): (1) no
`public/robots.txt` existed, so Lighthouse tried parsing `index.html`'s own
markup as robots directives (53 "syntax not understood" errors); (2) the
primary CTA button's white text on the original brand red (`#E63946`)
measured 4.17:1 contrast — under the 4.5:1 WCAG AA minimum for normal text
— in three places (header, hero, donation form), plus a freshly-introduced
instance in Phase 8's admin dashboard filter buttons, caught by grepping
for `bg-red` usage across the whole codebase rather than assuming Phase 8's
own code was clean.

**After fixes, re-measured (not assumed):** Accessibility 100, SEO 100.
Fix for (2): CTA buttons' resting fill changed to `--color-red-deep`
(already a cataloged brand color, ≈5.1:1), with a new
`--color-red-darkest` (`#9f232e`) added for hover/active — surfaced to the
user as a real design-system decision (it changes the primary CTA's
site-wide default color) rather than changed unilaterally.

**Explicitly not chased further:** mobile's Performance 95 (2.4s FCP/LCP
under Lighthouse's simulated network/CPU throttling, 0ms TBT, 0.016 CLS) —
no specific fixable cause was identified, and the instruction for that
phase was evidence-driven optimization, not optimization for its own sake.

**Bundle size** (from `README.md`, current as of the backend/admin phases):
main JS bundle + shared chunk ≈374 KB raw / ≈112 KB gzip; CSS ≈52 KB raw /
≈15 KB gzip. The admin-specific chunk adds only ≈11 KB on top of the same
shared bundle, confirmed by comparing actual build output byte counts
rather than assumed from the multi-page config alone (see §3's admin
bundle-separation note).

**These are measured results, not current-session goals** — they reflect
the state recorded after Phase 9's fixes and have not been re-run in this
documentation session.

---

## 12. Production Verification

Per `CLAUDE.md`'s Phase Status entries, the following has been verified,
and the following has explicitly **not**:

**Verified directly against the live deployment** (`https://sacrifice-one-pizza.vercel.app`,
Phase 4): fresh page load with a clean console and all-200 network
requests; canonical/OG/favicon metadata; the full donor flow end-to-end,
including the Phase 3 focus-management fixes; a 375px mobile viewport
reload with no horizontal overflow.

**Verified against a real Postgres, but not the production Neon project**
(CI, Phase 10): every integration test (session creation/expiry/invalidation,
donation creation/idempotency/rate-limiting, admin listing/filtering/
pagination/summary, the authenticated screenshot route) passes against a
real, ephemeral `postgres:16` service container. This proves the SQL and
auth logic are correct against real Postgres semantics — it does not prove
the deployed app works against the actual production Neon database and
Vercel Blob store with real credentials, which is a materially different
claim.

**Not yet verified against production infrastructure** (see §13 Known
Limitations): a real presigned upload against the production Blob store; a
real `POST /api/donations` against the production Neon database; a
confirmed 403/401 on a direct, unauthenticated attempt to fetch a private
Blob URL in production; admin login/authenticated screenshot retrieval/
status update/logout exercised against production; the admin dashboard UI
itself has only been browser-tested against a backend that wasn't running
(`vite dev` doesn't execute `/api/*`).

This document does not claim any of the "not yet verified" items above have
happened — they remain open work, tracked in §13.

---

## 13. Known Limitations

Current and genuine, cross-checked against `CLAUDE.md` §12:

- **The deployed app has never been exercised end-to-end against the real
  Neon project and Vercel Blob store with real credentials.** CI's
  Postgres is an ephemeral per-run service container, not production. See
  §12.
- **No payment verification of any kind.** Nothing about this system
  verifies a UPI transaction happened; the uploaded screenshot is the
  donor's claim, reviewed by a human admin once that review happens. This
  is a donation submission and verification (human-review) system, never a
  payment-processing system.
- **No CAPTCHA or bot-challenge** on either the donation or login endpoint
  — the Postgres rate limiter is the only abuse mitigation currently in
  place.
- **Placeholder content still in place:** UPI ID and phone number (both
  overridable via `VITE_UPI_ID`/`VITE_PHONE_NUMBER`), 2 of 3 testimonials,
  social media links (`Footer.tsx`), and the impact figures are all
  placeholder values from the product spec, not real data.
- **No portfolio screenshots captured** of the live deployment.
- **Single supported locale/currency** — ₹ and Indian UPI conventions are
  hardcoded throughout; no internationalization.
- **Single admin account, no self-service password reset** — rotating the
  password requires re-running `db:seed-admin` with deploy/database
  access.

**Resolved, not current limitations** (listed here only to avoid being
mistaken for open issues): the earlier public-Blob-store screenshot
exposure, the admin dashboard's broken direct `<img>` read path, and the
un-authenticated-fetch magic-byte verification bug are all fixed — see §9.

---

## 14. Reading This Document Alongside the Codebase

Every claim above was checked directly against the files it references as
of the commits ending in `4f67b4d` (`fix: move admin screenshot integration
test out of api/ routing`) on `main`. If a future change touches any of
`api/`, `db/schema.ts`, `vercel.json`, `.github/workflows/ci.yml`, or the
donation/admin frontend state machines, re-verify the relevant section here
against the actual code rather than trusting this snapshot — per this
project's own stated practice (`CLAUDE.md`), documentation is kept current
in the same commit as the change it describes, but a document is still a
snapshot, not a live view.
