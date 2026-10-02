# Architecture & Technical Decisions — Sacrifice One Pizza

This is a standalone, resume/interview-oriented decision record. It restates
the important technical decisions already logged in `CLAUDE.md`'s Decision
Log in a consistent, one-decision-per-entry format, and adds a few backend
decisions that are visible directly in the code but weren't given their own
entry there. `CLAUDE.md` remains the source of truth if the two ever
disagree — this document is a curated, differently-organized view of the
same reality, not a replacement.

Each entry distinguishes what was an actual documented/discussed decision
from what is a reasonable inference drawn from the repository's own
constraints. Where an entry is inference rather than a recorded historical
debate, it says so explicitly.

---

## Current Architecture at a Glance

```
Browser (donor)                      Browser (admin)
      │                                     │
      ▼                                     ▼
 index.html (Vite/React SPA)         admin.html (separate Vite entry)
      │                                     │
      ├─ direct PUT (presigned) ──► Vercel Blob (private store)
      │                                     │
      └────────────► /api/* (Vercel Serverless Functions, Node.js) ◄──┘
                              │
                              ▼
                     Neon Postgres (via pg + Drizzle ORM)
```

- **Frontend:** Vite + React 19 + TypeScript, two build entries (public
  donor SPA, admin SPA), Tailwind CSS v4, no router, no state library.
- **Backend:** Vercel Serverless Functions under `api/`, same repo/deploy
  origin as the frontend. Zod validation, Drizzle ORM, `pg` driver.
- **Database:** Neon Postgres, 4 tables (`donations`, `admin_users`,
  `admin_sessions`, `rate_limits`).
- **File storage:** Vercel Blob, private store, presigned direct-to-Blob
  browser uploads, server-side authenticated reads only.
- **Auth:** Single admin account, bcrypt + DB-backed opaque sessions
  (no JWT).
- **CI/CD:** GitHub Actions (typecheck → lint → format → migrate → unit →
  integration → build) against a real Postgres service container; deploy to
  Vercel on merge to `main`.

---

## Architecture

### Decision: Backend hosting model

**Choice:** Vercel Serverless Functions under `api/`, in the same repository
and deployment as the Vite frontend — not a separate service, not a
framework migration.

**Why:** The frontend (Vite + React, strict TS, Tailwind) was already built,
approved, and locked across Phases 1–4 before any backend existed
(`CLAUDE.md` Phase Status). `donationService.submitDonation()` was
deliberately designed as the one seam the rest of the app depends on
(`src/components/donation/donationService.ts`), so a real backend could be
dropped in later without touching any component or reducer above it. Vercel
Functions let that backend live in the same repo, deploy with the same
`vercel deploy`, and share the same origin as the frontend — no CORS
configuration, no second hosting target, no second CI/deploy pipeline to
keep in sync.

**Alternatives considered:**

- **Next.js migration** — not documented as an explicit historical debate in
  `CLAUDE.md`; this is a reasonable inference from the repository's own
  constraints, not a recorded discussion. Migrating would mean replacing an
  already-approved, already-designed Vite/React frontend and its build
  pipeline (two-entry `vite.config.ts`, Tailwind v4 via `@tailwindcss/vite`)
  to gain SSR/file-based routing this single-page site has no requirement
  for — it already has full static SEO/Open Graph metadata (`CLAUDE.md`
  Phase 4) without SSR.
- **A separate Express/Fastify server** — also not a recorded historical
  debate; inferred from the same constraint set. It would reintroduce a
  second deployment target and CORS between the frontend origin and the API
  origin, exactly what co-locating functions under `api/` in the same Vercel
  project avoids.

**Why they were not chosen:** Both would add real migration or
infrastructure cost (rewriting the frontend's build model, or standing up
and securing a second origin) without solving a problem this project
actually has. Vercel Functions gave the backend a working deploy path on day
one of Phase 5 with zero frontend changes.

**Current implementation:** `api/` contains route handlers
(`api/donations/index.ts`, `api/donations/[id].ts`, `api/uploads/screenshot.ts`,
`api/admin/*`) plus `api/_lib/` for shared business logic. `db/` and
`shared/` sit outside `src/` because they run under Node (via
`tsconfig.api.json`), not the browser (`tsconfig.app.json`), and `shared/`
specifically holds constants (`donationLimits.ts`, `screenshotLimits.ts`)
that both runtimes need but that can't live inside `src/components/donation/config.ts`
because that file reads `import.meta.env`, a Vite-only global that throws if
imported from Node.

### Decision: Frontend stays Vite/React, not converted for backend needs

**Choice:** The frontend's tech stack, build tool, and folder structure are
unchanged by the addition of a backend.

**Why:** The backend boundary (`donationService.submitDonation`) was
designed in Phase 2 specifically so this would be true — the mock
implementation and the real Postgres/Blob implementation have the identical
exported signature, and no component, reducer, or hook above that function
changed when the mock was replaced (`CLAUDE.md`'s backend-boundary note).

**Alternatives considered:** None recorded — this was the explicit design
goal of the original mock boundary, not a decision revisited once the
backend existed.

**Current implementation:** `src/` is untouched by backend concerns except
at the two files that call `fetch`/`uploadPresigned` directly:
`donationService.ts` (donor flow) and `src/admin/api.ts` (admin dashboard).

---

## Database

### Decision: Neon Postgres, not another managed Postgres or a NoSQL store

**Choice:** Neon Postgres as the database, connected directly (not through
Vercel's managed Neon integration).

**Why:** A relational schema fits the data well (donations, admin users,
sessions, and rate-limit counters are all naturally tabular with real
constraints between them), and Neon offers a serverless-friendly Postgres
with a pooled connection endpoint suited to Vercel's serverless functions.

**Alternatives considered:** The Vercel-managed Neon integration was
considered and explicitly rejected in favor of connecting directly (see
`.env.example` and `db/client.ts`, which read a plain `DATABASE_URL`).

**Why they were not chosen:** Not documented beyond the direct-connection
choice itself.

**Current implementation:** `db/client.ts` builds a `pg.Pool` from
`DATABASE_URL`, branching on `neon.tech` in the hostname to decide whether
to require TLS (Neon requires it; the local/CI Postgres service container
does not support it).

### Decision: Drizzle ORM + Drizzle Kit, not Prisma or raw `pg`

**Choice:** Drizzle ORM for the schema and queries, Drizzle Kit for SQL-file
migrations.

**Why:** The schema is four small tables — Prisma's binary query engine adds
real cold-start and bundle-size cost inside a Vercel serverless function for
no corresponding benefit at this scale. Raw `pg` with hand-written SQL was
also considered and rejected because it throws away type-safe queries and
migration tooling for no real savings at four tables.

**Alternatives considered:** Prisma; raw `pg` with hand-written SQL.

**Why they were not chosen:** Prisma — cold-start/bundle-size cost not
justified at this scale. Raw `pg` — loses type safety and migration tooling
for a schema small enough that Drizzle's overhead is negligible.

**Current implementation:** `db/schema.ts` defines all four tables with
Drizzle's `pgTable`; `drizzle.config.ts` + `npm run db:generate`/`db:migrate`
produce and apply SQL-file migrations, checked into the repo (used directly
by CI's "Apply database migrations" step, which doubles as a migration-drift
check against a real Postgres).

### Decision: `pg` (node-postgres) driver, not `@neondatabase/serverless`

**Choice:** `drizzle-orm/node-postgres` over a plain `pg.Pool`, not Neon's
own HTTP/edge driver.

**Why:** The HTTP driver is Neon-specific and holds no persistent connection
to wrap in a transaction — ruling out transaction-based test isolation as a
future option. Plain `pg` against Neon's pooled connection string is the
same code path locally, in CI (a plain Postgres service container), and in
production — one driver, not two to keep behaviorally in sync.

**Alternatives considered:** `@neondatabase/serverless` (Neon's HTTP/edge
driver).

**Why they were not chosen:** Neon-specific, and incompatible with running
identical code against CI's plain Postgres container.

**Current implementation:** `db/client.ts`, `new Pool({ connectionString, ssl, max: 5 })`,
cached on `global.__pgPool` so a warm serverless instance reuses the pool
across invocations instead of opening a fresh connection per request.

### Decision: Relational schema and indexes

**Choice:** Four tables — `donations`, `admin_users`, `admin_sessions`,
`rate_limits` — described in full in `Docs/PROJECT_CONTEXT.md`'s Database
section.

**Why (indexes specifically):**

- `donations_idempotency_key_key` (unique) — makes the idempotency guarantee
  a real database constraint, not just an application-level check, so a race
  between two concurrent requests with the same key can't both insert.
- `donations_created_at_idx` — serves the admin dashboard's default
  unfiltered "newest first" listing.
- `donations_status_created_at_idx` (composite, `status` then `created_at`)
  — serves the filtered listing (`WHERE status = ? ORDER BY created_at DESC`)
  from a single index scan; kept separate from the plain `created_at` index
  because a composite index with `status` as the leading column can't
  efficiently serve a query with no status predicate.
- `admin_users_email_key` (unique) — a real invariant (two admin accounts
  can't share an email), not just a lookup optimization.
- `admin_sessions_token_hash_key` (unique) — session lookup by token hash is
  the hot path on every authenticated request.
- `rate_limits` primary key is the composite `(key, window_start)` — this is
  what makes the atomic upsert possible (see rate limiting decision below).

**Current implementation:** `db/schema.ts`.

### Decision: Idempotency key as a client-generated UUID with a DB unique constraint

**Choice:** The frontend generates one UUID per confirmation-form submission
_attempt_ (not per HTTP request), sends it with the donation payload, and
the database enforces uniqueness on it.

**Why:** A donor's network retry or accidental double-click must not create
two donation rows. Generating the key once per attempt (in
`ConfirmationStep.tsx`, cached in a `useRef` so it survives re-renders but
not remounts) and reusing it across retries means the server can recognize
"this is the same attempt again" and return the original result instead of
creating a duplicate.

**Alternatives considered:** None recorded as historically debated — this
was the design from when the idempotency requirement was first identified.

**Current implementation:** `createDonation()` in `api/_lib/donations.ts`
checks for an existing row with the same `idempotencyKey` _before_ spending
a rate-limit slot or re-verifying the screenshot (a retry should be free),
and separately relies on the DB's unique constraint
(`onConflictDoNothing({ target: donations.idempotencyKey })`, with a
follow-up read if the insert loses the race) to handle two concurrent
requests with the same key arriving at the same time — the idempotency
guarantee holds even under a real race, not just in the common sequential
case.

### Decision: `amountPaid` stored as a whole-rupee integer

**Choice:** `integer`, not a float or paise-denominated integer.

**Why:** The donation UI has never collected sub-rupee amounts
(₹300–₹3000, no decimal input anywhere in the flow), so paise-level
precision would be a unit-conversion concern invented for a precision
requirement that doesn't exist.

**Current implementation:** `db/schema.ts`'s `donations.amountPaid`.

### Decision: Database-backed rate limiting (fixed window), not Redis

**Choice:** A Postgres table (`rate_limits`) with a fixed hourly window,
incremented via a single atomic upsert.

**Why:** This is a low-traffic donation form, and Postgres is already a hard
dependency — adding Redis/Upstash would be new infrastructure to secure,
pay for, and keep available, for a rate limiter whose precision this traffic
level doesn't need.

**Alternatives considered:** Redis/Upstash-backed rate limiting; a sliding
window or token-bucket algorithm.

**Why they were not chosen:** Redis — new infrastructure dependency not
justified at this traffic level. Sliding window/token bucket — more
implementation complexity for precision this app doesn't need; the accepted,
documented tradeoff is that a fixed window can in theory allow a burst
spanning two windows up to ~2x the stated limit, which was judged acceptable
given the generous thresholds (10/hour donations, 20/hour login attempts).

**Current implementation:** `api/_lib/rateLimit.ts`'s
`checkAndIncrementRateLimit(key, maxPerHour)` — a single
`INSERT ... ON CONFLICT (key, window_start) DO UPDATE SET count = count + 1 RETURNING count`,
so there's no separate check-then-write round trip to race against; Postgres
resolves concurrent increments for the same row itself. `key` is
purpose-prefixed (`donation:<ip>`, `login:<ip>`) so the donation and login
limiters never share a counter even for the same IP — this is why the
column was named `key` rather than `ip_address` (see the Authentication
section).

### Decision: Database-backed admin sessions, not stateless tokens

Covered in full under Authentication below (sessions vs. JWT).

---

## Authentication

### Decision: Single admin account model

**Choice:** Exactly one admin account, created/rotated by a one-off script
(`npm run db:seed-admin` → `db/seedAdmin.ts`), with no sign-up flow anywhere
in the app.

**Why:** The project has one operator reviewing donations. Building a
multi-admin user-management system (invites, roles, self-service password
reset) would be speculative complexity for a need that doesn't currently
exist.

**Alternatives considered:** A full admin user-management flow (sign-up,
invites, roles) — implicitly rejected by not being built; not a recorded
debate.

**Current implementation:** `admin_users` table with a unique email index;
`db/seedAdmin.ts` inserts or updates (via `onConflictDoUpdate` on email) a
single row, run manually with `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars on the
command line. Re-running it with the same email is how the admin password is
rotated — there's no in-app "change password" feature.

### Decision: bcrypt password hashing (`bcryptjs`, not native `bcrypt`)

**Choice:** `bcryptjs`, a pure-JavaScript bcrypt implementation, hashing at
cost factor 12.

**Why:** Chosen specifically to avoid cross-compiling a native module
(`bcrypt`'s C++ binding) between this project's Windows development machine
and Vercel's Linux serverless runtime — a real, concrete cross-platform
build problem, not a performance preference.

**Alternatives considered:** The native `bcrypt` npm package (compiled C++
binding).

**Why they were not chosen:** Native bindings compiled on Windows don't run
on Vercel's Linux functions without a cross-compile step; `bcryptjs` sidesteps
the problem entirely at the cost of being somewhat slower in pure JS, which
is immaterial for a single login endpoint.

**Current implementation:** `api/_lib/password.ts` — `hashPassword`/
`verifyPassword`, deliberately with no import of `db/client.ts` (which
throws at module load if `DATABASE_URL` isn't set), so these two functions
stay a true zero-dependency unit test (`password.test.ts`).

### Decision: Opaque, database-backed sessions — not JWT

**Choice:** A random 32-byte token, stored in an `httpOnly` cookie; the
server holds the authoritative session state in `admin_sessions`.

**Why:** A DB-backed session can be invalidated immediately and for real —
logout deletes the row, so a copied/leaked cookie value stops working the
instant that happens. A JWT's whole value proposition (stateless
verification, no DB round trip) is not a real advantage here: this app
already queries Postgres on every request regardless, and correctly
invalidating a JWT before its expiry requires either a short expiry with
refresh-token complexity or a server-side denylist — which is a database
lookup anyway, just a worse-shaped one than a direct session table.

**Alternatives considered:** JWT-based stateless sessions.

**Why they were not chosen:** Revocation. A leaked JWT (if issued with a
non-trivial expiry) stays valid until it expires unless a denylist is
maintained — which reintroduces the exact database dependency JWTs are
chosen to avoid, with more moving parts (signing keys, expiry/refresh logic)
than a plain session row.

**Current implementation:** `api/_lib/auth.ts`. `createSession(userId)`
generates the token, hashes it, and inserts an `admin_sessions` row with a
12-hour `expiresAt`. `getAdminIdentity(req)` reads the cookie, hashes it,
and joins `admin_sessions` → `admin_users` to confirm the session exists and
hasn't expired — the cookie's mere presence is never trusted on its own.
`requireAdmin(req, res)` wraps that and sends a 401 on failure, used by
every admin-only route.

### Decision: Only a SHA-256 hash of the session token is stored, never the raw token

**Choice:** `createHash('sha256').update(token).digest('hex')` before the
value ever reaches the database.

**Why:** Mirrors the reasoning behind hashing passwords — a database read
alone (e.g. a leaked backup or a compromised read replica) shouldn't be
enough to forge a valid session cookie. SHA-256, not bcrypt, is correct
here specifically because a session token is already a 32-byte
high-entropy random value (unlike a human-chosen password) — a fast
cryptographic hash provides the same "DB leak isn't enough" protection
without adding bcrypt's deliberate per-request latency to every
authenticated call.

**Current implementation:** `db/schema.ts`'s `adminSessions.tokenHash`
(unique-indexed); `api/_lib/auth.ts`'s `hashToken()`.

### Decision: Cookie configuration — `httpOnly`, `SameSite=Strict`, `Secure` in production

**Choice:** `admin_session=<token>; HttpOnly; Path=/; SameSite=Strict; Max-Age=43200[; Secure in production]`.

**Why:** `HttpOnly` prevents the token from being read by any injected or
third-party JavaScript (mitigates XSS-driven session theft). `SameSite=Strict`
prevents the cookie from being sent on cross-site requests, closing off CSRF
against the admin endpoints. `Secure` is conditional on `NODE_ENV === 'production'`
specifically because browsers reject `Secure` cookies over plain `http://`,
which local development uses.

**Current implementation:** `api/_lib/auth.ts`'s `setSessionCookie`/
`clearSessionCookie`.

### Decision: Real server-side logout (row deletion), not just clearing the cookie

**Choice:** `POST /api/admin/logout` deletes the corresponding
`admin_sessions` row, then clears the cookie.

**Why:** Clearing the cookie alone only stops that one browser from sending
it — a copied token would remain valid until its 12-hour expiry. Deleting
the row makes the session actually invalid everywhere, immediately.

**Current implementation:** `api/_lib/auth.ts`'s `invalidateSession`, called
from `api/admin/logout.ts`.

### Decision: Timing-safe login against email enumeration

**Choice:** A precomputed, valid-but-unmatchable bcrypt hash
(`DUMMY_PASSWORD_HASH`) is compared against whenever the submitted email
doesn't match any admin account, so bcrypt runs on every login attempt
regardless of whether the email exists.

**Why:** Without this, `verifyPassword` only runs when a real user is
found, making an "unknown email" response measurably faster than a "wrong
password for a real account" response — a timing side-channel that leaks
whether a given email has an admin account at all.

**Current implementation:** `api/admin/login.ts`.

### Decision: Login rate-limited separately from donation submissions

**Choice:** Both use the same `rate_limits` table and
`checkAndIncrementRateLimit` mechanism, but with different purpose-prefixed
keys (`login:<ip>` vs. `donation:<ip>`) and different thresholds (20/hour
vs. 10/hour).

**Why:** Reusing the mechanism avoided building a second rate-limiting
system for what's structurally the same problem; the column originally
named `ip_address` was generalized to `key` specifically so two unrelated
counters (a donor's submissions and an admin's login attempts) from the
same network address don't collide into one shared count.

**Current implementation:** `db/schema.ts`'s `rateLimits.key`;
`api/_lib/rateLimit.ts`'s `MAX_DONATIONS_PER_HOUR`/`MAX_LOGIN_ATTEMPTS_PER_HOUR`.

---

## File Storage

### Decision: Vercel Blob for screenshot storage, uploaded directly from the browser

**Choice:** `@vercel/blob`, with the browser uploading the screenshot
directly to Blob storage rather than through this app's own API route body.

**Why:** Vercel serverless functions cap request bodies well under the 8MB
this app allows for a screenshot. Routing the upload through
`/api/uploads/screenshot`'s own body would mean hitting that cap on
legitimate large screenshots. A direct-to-Blob client upload sidesteps the
limit entirely instead of raising it or hand-rolling multipart streaming.

**Alternatives considered:** Streaming the upload through the serverless
function's own body (rejected for the size-limit reason above); an
alternative object store — not recorded as considered, since Vercel Blob
was the natural fit given the rest of the stack is already on Vercel.

**Current implementation:** `src/components/donation/donationService.ts`
calls `uploadPresigned()` directly against `/api/uploads/screenshot`, which
issues a constrained, short-lived upload credential rather than handling the
bytes itself.

### Decision: Private Blob store with a presigned/Signed-URLs upload flow (OIDC), not the legacy `handleUpload` token flow

**Choice:** `issueSignedToken()` (server) + `uploadPresigned()`/
`handleUploadPresigned()` (client + server), authenticated via Vercel's OIDC
(`VERCEL_OIDC_TOKEN` + `BLOB_STORE_ID`), against a Blob store configured
`access: 'private'`.

**Why:** This project's Blob store connection provisions access via OIDC by
default and does not mint a `BLOB_READ_WRITE_TOKEN` for that path. The
legacy `handleUpload()`/`upload()` pattern requires that static token to
sign client upload tokens — it cannot use OIDC credentials at all — so it
stopped being viable without deliberately re-provisioning a token type
Vercel's own current setup flow doesn't produce by default. This was
confirmed by reading Vercel's current documentation directly and by
observing that `vercel env pull` added `VERCEL_OIDC_TOKEN` but no
read-write token after connecting the project's existing store.

**Alternatives considered:** The legacy `handleUpload()`/`upload()` client-token
flow with a public Blob store (this was the original Phase 5 implementation
before the migration).

**Why they were not chosen:** Two compounding problems, not one. First, the
legacy flow's client token payload never encoded an `access` level at all
(confirmed by reading the installed `@vercel/blob` SDK's own
`generateClientTokenFromReadWriteToken` source) — the server had no way to
bind or verify that the browser's upload actually used `private`, so a
"public store, unguessable-URL" posture was the honest description of what
that flow could actually enforce, not a real access control. Second, and
what actually forced the migration, `handleUpload()` cannot function at all
without a `BLOB_READ_WRITE_TOKEN`, which this project's real Vercel
connection doesn't provision. `uploadPresigned()`/`handleUploadPresigned()`
resolves both: it accepts OIDC credentials directly, and its `access` option
is a real, enforced part of the presigned-URL flow against a store that is
genuinely configured Private.

**Current implementation:** `api/uploads/screenshot.ts` (server side, issues
the signed token), `src/components/donation/donationService.ts` (client
side, `uploadPresigned(pathname, file, { access: 'private', handleUploadUrl })`).

### Decision: 8MB size limit, PNG/JPEG/WEBP content-type allowlist

**Choice:** `MAX_SCREENSHOT_BYTES = 8 * 1024 * 1024`,
`ALLOWED_SCREENSHOT_TYPES = ['image/png', 'image/jpeg', 'image/webp']`, both
enforced at the presigned-token level (`allowedContentTypes`,
`maximumSizeInBytes` passed to `issueSignedToken`) and re-checked server-side
after upload via magic-byte sniffing (see API/Security below).

**Current implementation:** `shared/screenshotLimits.ts` (the single source
of truth, imported by both the browser bundle for UX validation and the API
for the check that actually matters).

### Decision: Random Blob pathnames, never the donor's original filename

**Choice:** The client derives only a file extension from the upload's MIME
type and generates a random UUID for the storage path
(`donations/${crypto.randomUUID()}.${ext}`); the donor's original filename
never reaches Blob storage. `addRandomSuffix: true` is also set on the
signed token, adding a further server-side random suffix.

**Why:** A donor-controlled filename in the storage path is both a
path-planning surface and a minor information leak (a filename can reveal
the donor's device or app). Neither the frontend nor the backend has any
reason to preserve it.

**Current implementation:** `src/components/donation/donationService.ts`;
`api/uploads/screenshot.ts`'s `urlOptions.addRandomSuffix`.

### Decision: Authenticated, server-side-only private screenshot retrieval

**Choice:** A dedicated admin-only route, `GET /api/admin/donations/[id]/screenshot`,
that looks up the donation's Blob URL from the database itself (never from
anything the request supplies), fetches it via the SDK's `get(url, { access: 'private' })`,
and streams the bytes through the response — the raw Blob URL is never sent
to the browser at all.

**Why:** Once uploads moved to `access: 'private'`, `donation.screenshotUrl`
stopped being directly browser-fetchable, breaking the admin dashboard's
original direct `<img src>`/`<a href>` usage of it. The fix had to keep the
actual Blob URL and any Blob/OIDC credential server-side.

**Current implementation:** `api/admin/donations/[id]/screenshot.ts`. Gated
by the same `requireAdmin()` every other admin route uses — no new auth
mechanism. Response headers: `Content-Type` from the blob's real content
type, `Cache-Control: private, no-store` (this is a donor's proof-of-payment
image, never something a shared/public cache should hold, even though it's
already access-controlled). The frontend change was a one-line swap in
`SubmissionDetail.tsx` from `donation.screenshotUrl` to this route — an
`<img>`/top-level `<a>` request to a same-origin URL already carries the
admin's session cookie, so no extra client-side auth wiring was needed.

---

## API / Security

### Decision: Zod server-side validation, independent of client-side validation

**Choice:** Every mutating endpoint re-validates its input with a Zod schema
(`api/_lib/validation.ts`) — the same rules the frontend already enforces
for UX (`validateConfirmationForm` on the client), re-implemented
server-side rather than trusted from the client.

**Why:** The client's own validation exists purely for UX; it can never be
trusted, because anyone can `POST` directly to these endpoints, bypassing
the browser and its validation entirely.

**Current implementation:** `createDonationSchema`, `updateDonationStatusSchema`,
`listDonationsQuerySchema`, `loginSchema` in `api/_lib/validation.ts`.
`createDonationSchema` in particular re-checks the ₹300–3000 amount range
(imported from `shared/donationLimits.ts`, the same constant the client
uses) and that `screenshotUrl` is actually a `*.blob.vercel-storage.com` URL.

### Decision: Server-side, real image-signature ("magic byte") verification

**Choice:** After a screenshot is uploaded, the server reads only the
leading bytes of the Blob object and checks them against known PNG/JPEG/WEBP
byte signatures (`api/_lib/magicBytes.ts`'s `sniffImageType`) before a
donation row is ever created — not just trusting the `Content-Type` recorded
at upload time.

**Why:** A request crafted outside the browser can set `Content-Type` to
anything; only the actual file bytes are trustworthy. A file renamed to end
in `.png` doesn't pass this check unless its leading bytes are actually a
PNG/JPEG/WEBP signature.

**Current implementation:** `verifyScreenshotIsRealImage()` in
`api/_lib/donations.ts` calls the Blob SDK's `get(url, { access: 'private' })`
(not a raw `fetch()` — the store is private, so an unauthenticated fetch
would 401/403 on every real submission), reads the first 16 bytes via a
`ReadableStream` reader (enough to cover the WEBP signature, the longest
check), and cancels the stream rather than buffering the whole file. A
missing/inaccessible blob is treated as verification failure. This runs
_before_ the donation is inserted, and a failed check triggers cleanup of
the just-uploaded blob (below).

### Decision: Orphaned-blob cleanup on every rejection path

**Choice:** Whenever a request is rejected _after_ the screenshot has
already been uploaded to Blob (duplicate idempotency key pointing at a
different screenshot, rate-limited, failed image verification), the
just-uploaded blob is deleted via a best-effort `safeDeleteBlob()`.

**Why:** The upload and the donation-record creation are two separate steps
(direct-to-Blob upload, then a metadata `POST`) — a rejected or duplicate
request can leave a real screenshot in storage with nothing referencing it.
Cleanup is deliberately best-effort: a failed delete is logged, never thrown,
because an orphaned blob is a minor storage cost, never a reason to fail (or
further complicate) a request that's already being rejected for another
reason.

**Current implementation:** `safeDeleteBlob()` in `api/_lib/donations.ts`,
called from all three of `createDonation`'s rejection branches.

### Decision: Idempotency check ordered before rate limiting and before screenshot re-verification

**Choice:** `createDonation()`'s exact order: (1) idempotency check, (2) rate
limit, (3) screenshot content verification, (4) insert (with the same
idempotency race re-checked at the DB level).

**Why:** A retry of an already-accepted submission (network blip,
double-click) should be free — it should cost no rate-limit quota and
re-fetch/re-verify nothing. Only a genuinely new submission should pay for
the rate-limit check and the image verification.

**Current implementation:** `api/_lib/donations.ts`'s `createDonation`, with
this exact ordering documented in its own doc comment.

### Decision: Content Security Policy and security headers

**Choice:** `vercel.json` sets `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
and a CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://*.private.blob.vercel-storage.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`.
`/api/*` responses additionally get `Cache-Control: no-store`.

**Why:** `style-src 'unsafe-inline'` is included because inline styles are
genuinely used (`App.tsx`'s scroll sentinel, `FAQ.tsx`'s height transition)
— confirmed by grepping the codebase before writing the policy, not assumed.
`connect-src` allows only `*.private.blob.vercel-storage.com` because that's
the one cross-origin destination the app actually calls (the browser's
direct presigned `PUT` to Blob storage); `img-src` has no Blob entry at all,
because the admin dashboard reads screenshots through the same-origin
`/api/admin/donations/[id]/screenshot` route, not an `<img>` pointed
directly at a Blob URL — confirmed by grepping `src/` for any remaining
direct Blob-URL usage.

**Current implementation:** `vercel.json`. Only meaningfully testable
against a live/preview deployment — `vite dev`/`vite preview` don't apply
these headers.

### Decision: One consistent error response shape

**Choice:** Every error response is `{ error: { message: string } }`, sent
via a shared `sendError()` helper; internal details (stack traces, driver
error text) are logged server-side only and never included in the response.

**Current implementation:** `api/_lib/http.ts`.

---

## Testing

### Decision: Vitest, with `node` as the default test environment

**Choice:** Vitest for both unit and integration tests; the default test
environment is `node`, not `jsdom`. Component tests that actually touch the
DOM or browser APIs (`File`, `URL.createObjectURL`) opt into `jsdom`
per-file via a `// @vitest-environment jsdom` comment.

**Why:** Most of this project's tests are pure logic (reducers, validators)
or backend code with no DOM at all — paying jsdom's setup cost on every
file, including backend-only ones that never need it, would be wasted work.

**Current implementation:** `vite.config.ts`'s `test.environment: 'node'`.

### Decision: Backend integration tests in a fully separate Vitest config, not a merged `include` pattern

**Choice:** `vitest.integration.config.ts` is a standalone config, not
produced via Vitest's `mergeConfig` on top of the main config.

**Why:** The first attempt used `mergeConfig`, which concatenates
array-valued options like `exclude` rather than replacing them — overriding
`exclude: []` on top of the base config's own exclusion of
`*.integration.test.ts` left those files still excluded, so the
"integration" run found zero tests. A standalone config sidesteps this
entirely.

**Alternatives considered:** `mergeConfig` with an overridden `exclude`.

**Why they were not chosen:** Doesn't actually clear an array-valued option
from the base config — a real, discovered limitation of `mergeConfig`, not a
style preference.

**Current implementation:** `vitest.integration.config.ts`, run via
`npm run test:integration`, targeting only `**/*.integration.test.ts`.

### Decision: Real Neon/Postgres integration testing, with `TRUNCATE`-per-test isolation

**Choice:** Integration tests run against a real Postgres (a GitHub Actions
service container in CI; a real Neon branch or local Postgres when run
manually) and isolate tests via `db/testUtils.ts`'s `resetDatabase()`
(`TRUNCATE` on all four tables) in a `beforeEach`, not per-test transaction
rollback.

**Why:** Transaction-based rollback would require every business-logic
function to accept an injectable DB client instead of importing the shared
singleton from `db/client.ts` — a real signature change to every function,
for a benefit (marginally faster test cleanup) that doesn't matter at this
table count. `TRUNCATE` needed no changes to the code under test.

**Current implementation:** `db/testUtils.ts`.

### Decision: `fileParallelism: false` for integration tests

**Choice:** Integration test _files_ run sequentially, not concurrently, in
`vitest.integration.config.ts`.

**Why:** Vitest runs separate test files concurrently by default, each in
its own worker — but all integration test files share one physical
Postgres with no per-file isolation. A real CI run surfaced this directly:
`listDonations`' pagination and status-filter tests saw row counts that were
multiples of what each test itself inserted, and a rate-limit test never
reached its threshold, both consistent with another file's `TRUNCATE`/insert
landing mid-test. Root-caused to file-level concurrency, not to any test's
own logic — tests _within_ a single file were never the problem, since
Vitest already runs those sequentially by default.

**Current implementation:** `vitest.integration.config.ts`.

### Decision: Integration test timeout raised to 20s

**Choice:** `testTimeout: 20000` in `vitest.integration.config.ts`, above
Vitest's 5000ms default.

**Why:** CI's Postgres is a same-network service container, where the
default is plenty. Run locally against a real remote Neon branch, the
rate-limit tests' `MAX_DONATIONS_PER_HOUR`-iteration loop (each iteration
doing several sequential round trips: idempotency check, rate-limit upsert,
insert) adds up to more than 5 seconds of real network latency alone —
confirmed by timing the same loop against CI's Postgres (well under 5s)
versus a remote Neon connection (consistently 6–7s). This is a
test-infrastructure timeout increase, not a production behavior change —
`MAX_DONATIONS_PER_HOUR` and the rate limiter's own logic are untouched.

**Current implementation:** `vitest.integration.config.ts`'s doc comment and
`testTimeout` value.

### Decision: Password hashing kept in its own module, separate from session management

**Choice:** `api/_lib/password.ts` (pure bcrypt) is a separate file from
`api/_lib/auth.ts` (session lifecycle), even though both are "auth" logic.

**Why:** `auth.ts` imports `db/client.ts`, which throws at module load if
`DATABASE_URL` isn't set. Bundling the pure `hashPassword`/`verifyPassword`
functions into that file would mean even a test exercising only bcrypt
hashing couldn't import the module without a live database configured —
discovered while writing `password.test.ts` as what was meant to be a
zero-dependency unit test.

**Current implementation:** `api/_lib/password.ts`, `api/_lib/auth.ts`.

---

## Deployment

### Decision: Vercel, auto-detected Vite build plus `/api` functions

**Choice:** Deploy on Vercel, which auto-detects the Vite static build
(`vite build` → `dist/`) and deploys `api/*.ts` as serverless functions from
the same repository.

**Why:** Follows directly from the backend-hosting decision above — one
deploy target for both frontend and backend.

**Current implementation:** `npx vercel deploy --prod --project sacrifice-one-pizza`.
Project created explicitly via `vercel project add sacrifice-one-pizza`
after Vercel's auto-derived project name (from the working-directory path)
was rejected by its project-name validation — sidestepped rather than
debugged further, as a one-time setup detail not worth the time.

### Decision: GitHub Actions CI with a real Postgres service container

**Choice:** `.github/workflows/ci.yml` runs on every PR and on push to
`main`, against a `postgres:16` service container (not a mock, not Neon
branching).

**Why:** A service container needs no external credentials, is isolated per
run, and is destroyed automatically when the job ends — avoiding both the
complexity of provisioning a temporary Neon branch per run and the risk of
tests running against shared/persistent infrastructure.

**Current implementation:** Pipeline order: `npm ci` → typecheck (`tsc -b`)
→ lint → format check → `db:migrate` (doubles as a migration-drift check —
a migration that doesn't apply cleanly to a real Postgres fails here, before
ever reaching Neon) → unit tests → integration tests → build. Runs on
`pull_request` and `push` to `main`; there is no separate preview/production
branching logic in the workflow itself — Vercel's own Git integration
handles preview deployments per-PR and production deployment on `main`
merges independently of this workflow.

### Decision: `tsconfig.api.json` uses `nodenext` module resolution, not `bundler`

**Choice:** `api/`, `db/`, and `shared/` are type-checked under
`moduleResolution: "nodenext"`, requiring explicit `.js` extensions on every
relative import (`shared/screenshotLimits.js`, not `.ts` or extensionless).

**Why:** Originally set to `bundler` on the assumption that Vercel "bundles"
these functions, so extension-less imports would resolve fine. The first
real Vercel deployment failed with `TS2835` on every relative import under
`api/`, `db/`, and `shared/`. Root cause: this project's `package.json` has
`"type": "module"`, so Vercel compiles/runs `/api/*.ts` as genuine Node ESM,
which — unlike a bundler — does not infer extensions on relative specifiers
at all. `tsc -b` and CI never caught this beforehand because `tsc -b` was
itself using the same too-lenient `bundler` setting, internally consistent
with its own wrong assumption rather than with Vercel's actual runtime
behavior.

**Alternatives considered:** Keeping `bundler` resolution.

**Why they were not chosen:** Verifiably wrong for this runtime — the first
production deployment failed because of it, a concrete, reproduced failure
rather than a style preference.

**Current implementation:** `tsconfig.api.json`; every relative import
across 19 files under `api/`, `db/`, `shared/` carries an explicit `.js`
extension (the extension refers to the eventual compiled output, the
standard Node ESM/TypeScript convention, and still resolves correctly to
the `.ts` source during type-checking).

---

## Admin Frontend Architecture

### Decision: Separate `admin.html` Vite entry, not a route inside the public SPA

**Choice:** `admin.html` mounts `src/admin/`'s `AdminApp` into `#admin-root`,
built as its own bundle via `vite.config.ts`'s
`build.rollupOptions.input: { main, admin }` multi-page configuration.

**Why:** The donor-facing public bundle should never download admin code,
and vice versa — a route added inside the existing single-page app would
mean both bundles ship together regardless of which page a visitor loads.

**Current implementation:** `admin.html`, `src/admin/main.tsx`. Verified,
not assumed: `main.js` plus the shared chunk together total 374.01 kB,
matching the pre-admin-split single-bundle size (374.23 kB) almost exactly
— the admin-specific chunk (~11 kB) is only ever downloaded by someone who
actually visits `/admin.html`, confirmed by comparing real build output
byte counts.

### Decision: No router introduced for the admin app

**Choice:** `AdminApp` owns two `useState` values — one for auth-check
status, one for which of exactly two views (`dashboard`, `detail`) is
showing — and that's the entire "routing" mechanism.

**Why:** With exactly two internal views and zero deep-linking requirement
(no need to bookmark or share a link to a specific submission), a router
dependency would add a real abstraction for a problem two `useState` calls
already solve completely.

**Current implementation:** `src/admin/AdminApp.tsx`.

### Decision: Admin dashboard reuses existing shared components, not a duplicate design system

**Choice:** `Button` and `FormField` from `src/components/ui`/`donation` are
reused by the admin frontend rather than reimplemented.

**Why:** Both were already generic enough not to be donation-flow-specific,
so building admin-only equivalents would have been pure duplication.

**Current implementation:** Imports in `src/admin/*.tsx`.

### Decision: Admin `GET`/`PATCH` on donations reuse the existing donation route files and `requireAdmin` guard

**Choice:** `api/donations/index.ts`'s `GET` branch and the new
`api/donations/[id].ts` back the dashboard's list and detail/status-update
needs, both gated by the same `requireAdmin()` built for the login/session
system — no new auth mechanism, no new middleware pattern.

**Current implementation:** `api/donations/index.ts`, `api/donations/[id].ts`,
`api/_lib/auth.ts`'s `requireAdmin`.
