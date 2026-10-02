# Interview Preparation — Sacrifice One Pizza

Resume/interview-oriented Q&A grounded in this project's actual
implementation. Every answer is checked against the code as it exists in
this repository, not idealized or generic. Where a question asks about
something the project doesn't implement, the answer says so explicitly and
describes what would be required, rather than pretending it exists — see
`Docs/PROJECT_CONTEXT.md` §12 (System Design section) for the explicit
"current architecture" vs. "how I would evolve it" split, which is applied
consistently throughout.

Practice tip: read the "Short answer" out loud first, then be able to
expand into the "Deep answer" unprompted. The "Evidence in S1P" line is
what makes each answer concrete instead of generic — cite it by name if
asked "where in the code."

---

# Backend

### Q: Walk me through the backend architecture.

**Short answer**

Vercel Serverless Functions under `api/`, in the same repo and deploy as
the Vite frontend, talking to Neon Postgres through Drizzle ORM and to
Vercel Blob for private file storage. Business logic lives in `api/_lib/`,
imported by thin route handlers.

**Deep answer**

Routes are one file per endpoint (`api/donations/index.ts`,
`api/donations/[id].ts`, `api/uploads/screenshot.ts`, `api/admin/login.ts`,
etc.). Each route handler does three things and nothing more: parse/validate
the request with a Zod schema, call into `api/_lib/` for the actual
business logic, and map the result to an HTTP response through shared
helpers (`sendError`/`sendJson`/`methodNotAllowed` in `api/_lib/http.ts`).
`api/_lib/` holds the real logic — `donations.ts` (create/list/get/update),
`auth.ts` (session lifecycle), `password.ts` (bcrypt), `rateLimit.ts`
(Postgres fixed-window counter), `magicBytes.ts` (image signature
sniffing), `validation.ts` (Zod schemas). This split exists partly for
testability: integration tests import `api/_lib/donations.ts` functions
directly rather than making HTTP requests against route handlers.
`db/client.ts` holds one cached `pg.Pool`, reused across warm serverless
invocations. `shared/` holds constants (donation amount range, screenshot
limits) that both the browser bundle and the Node backend need — it can't
live inside the frontend's own config file because that file reads
`import.meta.env`, which doesn't exist under Node.

**Evidence in S1P**

`api/` route/`_lib` split; `db/client.ts`'s `global.__pgPool` caching;
`shared/donationLimits.ts`, `shared/screenshotLimits.ts`.

---

### Q: Why Vercel Serverless Functions instead of a separate backend service?

**Short answer**

Same repo, same deploy, same origin as the frontend — no CORS to configure,
no second hosting target or CI/deploy pipeline to keep in sync.

**Deep answer**

The frontend (Vite + React, strict TypeScript, Tailwind) was already built
and locked before any backend existed — the donation flow's backend
boundary (`donationService.submitDonation()`) was deliberately designed as
a single function with a stable signature so a real backend could be
dropped in later without touching any component above it. When the backend
was actually built, Vercel Functions let it live in `api/` in the same
repository, deploy with the same `vercel deploy` command, and share the
same origin as the frontend automatically — a donor's browser calling
`/api/donations` is a same-origin request, no CORS headers needed. A
separate Express/Fastify service, or a Next.js migration, would each solve
a problem this project doesn't have (this single-page site has no
SSR/routing requirement — its SEO/Open Graph metadata is already fully
static) while adding a real cost: either standing up and securing a second
origin, or rewriting an already-approved frontend build pipeline. I'll be
direct that this specific comparison (Vercel Functions vs. Next.js vs.
Express) wasn't a historically recorded debate in this project — it's the
practical reasoning that explains why the actual choice makes sense given
the constraints, not a discussion the project's own history documents
happening.

**Evidence in S1P**

`api/` co-located with `src/`; `vercel.json`; `Docs/DECISIONS.md`'s
"Backend hosting model" entry (which flags this same distinction).

---

### Q: Why PostgreSQL/Neon specifically?

**Short answer**

The data is genuinely relational (donations, admin accounts, sessions, and
rate-limit counters have real constraints and one real foreign key between
them), and Neon gives a serverless-friendly Postgres with a pooled
connection endpoint suited to Vercel's short-lived function invocations.

**Deep answer**

Four tables, one foreign key (`admin_sessions.user_id → admin_users.id`,
`ON DELETE CASCADE`), and several uniqueness/composite-index constraints
that matter for correctness, not just performance (the idempotency-key
unique index is what actually prevents a duplicate donation under a race —
see the idempotency question below). A document store would have made
those constraints application-level checks instead of database guarantees.
The project connects to Neon directly (not through Vercel's managed Neon
integration) via a plain `DATABASE_URL`, using the standard `pg` driver
rather than Neon's HTTP/edge driver — deliberately, so the exact same code
path runs locally, in CI (a plain `postgres:16` service container), and in
production against Neon, with TLS toggled based on whether the connection
string's hostname contains `neon.tech`.

**Evidence in S1P**

`db/schema.ts`; `db/client.ts`'s `requiresSsl` branch;
`Docs/DECISIONS.md`'s "pg driver, not @neondatabase/serverless" entry.

---

### Q: Why Drizzle ORM instead of Prisma or raw SQL?

**Short answer**

Four small tables didn't justify Prisma's binary query-engine cold-start
and bundle-size cost inside a serverless function, and raw `pg` would throw
away type safety and migration tooling for a schema this small.

**Deep answer**

Prisma's query engine is a separate compiled binary that has to be bundled
and started on every cold serverless invocation — real cost for a schema
of four tables with no complex relational queries. Drizzle compiles to
plain SQL with TypeScript types generated from the schema definition, and
its migrations are readable SQL files checked into the repo
(`drizzle-kit generate`/`migrate`), which CI applies as an actual
migration-drift check (a migration that doesn't cleanly apply to a real
Postgres fails the build before ever touching Neon). Raw `pg` with
hand-written SQL was the other option considered and rejected because it
gives up type-safe queries and any migration tooling for savings that don't
matter at four tables.

**Evidence in S1P**

`db/schema.ts` (Drizzle `pgTable` definitions); `drizzle.config.ts`;
`npm run db:generate`/`db:migrate` in `package.json`; the CI step "Apply
database migrations."

---

### Q: Explain the donation creation flow end to end.

**Short answer**

Browser uploads the screenshot directly to private Blob storage via a
presigned URL, then `POST`s the donation metadata plus the resulting Blob
URL; the server checks idempotency, rate limit, and the screenshot's real
image bytes, in that specific order, before inserting.

**Deep answer**

1. **Client:** `donationService.submitDonation()` calls `uploadPresigned()`
   against `/api/uploads/screenshot`, which the server backs with
   `issueSignedToken()` — a constrained (type/size-limited), OIDC-authenticated
   credential. The browser then `PUT`s the file directly to Vercel Blob;
   the file bytes never pass through this app's own function body (Vercel
   functions cap request bodies well under the 8MB this app allows for a
   screenshot).
2. **Client:** once the upload resolves, the client `POST`s
   `/api/donations` with `{ fullName, address, amountPaid, screenshotUrl,
idempotencyKey }` — the idempotency key was generated once, client-side,
   when the confirmation form was first submitted (not per HTTP request),
   cached in a `useRef` so a retry reuses the same value.
3. **Server (`api/donations/index.ts` → `createDonation` in
   `api/_lib/donations.ts`):**
   - Zod-validates the body (`createDonationSchema`) — re-checks the
     ₹300–3000 range, that `screenshotUrl` is actually a
     `*.blob.vercel-storage.com` URL, that the idempotency key is a valid
     UUID.
   - Checks for an existing row with that idempotency key first, before
     spending a rate-limit slot or re-verifying the screenshot — a retry of
     an already-accepted submission should be free.
   - If new: atomically checks-and-increments the `donation:<ip>`
     rate-limit counter (10/hour).
   - If still allowed: fetches the just-uploaded blob server-side (via the
     Blob SDK's authenticated `get()`, not a raw `fetch()`, since the store
     is private) and checks its real leading bytes against known
     PNG/JPEG/WEBP signatures — not the declared `Content-Type`.
   - Inserts the row, with `onConflictDoNothing` on the idempotency-key
     unique index as a second line of defense against a genuine
     concurrent-request race.
   - Every rejection path after the blob was already uploaded triggers a
     best-effort delete of that blob, so a rejected/duplicate request
     doesn't leave an orphaned file in storage.
4. **Response:** `201` for a genuinely new donation, `200` for an
   idempotent replay (same result, not an error), `429` for rate-limited,
   `400` for an invalid image or failed validation.

**Evidence in S1P**

`api/_lib/donations.ts`'s `createDonation`; `donationService.ts`;
`ConfirmationStep.tsx`'s `idempotencyKeyRef`.

---

### Q: How does idempotency work, and why is the idempotency key unique?

**Short answer**

The client generates one UUID per submission _attempt_ (not per HTTP
request), sends it with every retry of that same attempt, and the database
enforces uniqueness on it — so a duplicate key means "this exact attempt
already happened," and the server returns the original result instead of
inserting a second row.

**Deep answer**

The key is generated in `ConfirmationStep.tsx` the first time the donor
presses submit (`idempotencyKeyRef.current ??= crypto.randomUUID()`), and
cached in a `useRef` — a `ref`, not state, specifically because it needs to
survive re-renders during the submission but must not itself trigger one.
If that submission fails and the donor presses submit again, the _same_
key is reused, not a new one. Server-side, `donations.idempotency_key` has
a unique index (`donations_idempotency_key_key`), so the guarantee is a
real database constraint, not just an application-level "check first" that
a race could defeat. `createDonation` checks for an existing row with that
key as its very first step (before the rate limiter or the image check),
and separately relies on the unique index at insert time
(`onConflictDoNothing`) to correctly handle the case where two requests
with the same key arrive concurrently and both pass the initial check — in
that race, one insert wins, the other reads back the winning row and
cleans up its own now-redundant uploaded blob.

**Evidence in S1P**

`db/schema.ts`'s `donations_idempotency_key_key` unique index;
`api/_lib/donations.ts`'s `createDonation`; `ConfirmationStep.tsx`.

---

### Q: How does rate limiting work, and why Postgres instead of Redis?

**Short answer**

A fixed-window counter in a Postgres table, incremented via a single
atomic upsert; Redis wasn't introduced because Postgres was already a hard
dependency and this is a low-traffic donation form, not a system under real
load.

**Deep answer**

`rate_limits` has a composite primary key of `(key, window_start)`, where
`window_start` is the current wall-clock hour truncated to `:00:00`. Every
request for a given key in the same clock hour maps to the same row.
`checkAndIncrementRateLimit(key, maxPerHour)` does one statement:
`INSERT ... ON CONFLICT (key, window_start) DO UPDATE SET count = count + 1
RETURNING count` — Postgres resolves concurrent increments for the same
row itself, so there's no separate "read the count, decide, then write"
round trip that two simultaneous requests could race through. `key` is
purpose-prefixed (`donation:<ip>`, `login:<ip>`) so the donation and login
limiters, and different IPs, never collide. The known tradeoff of a fixed
window (a burst spanning the boundary between two windows could in theory
allow up to ~2x the stated limit) is accepted and documented, not
overlooked — Redis/a sliding window/a token bucket would all solve that
imprecision at a complexity cost this traffic level doesn't need.

**Evidence in S1P**

`db/schema.ts`'s `rateLimits` table; `api/_lib/rateLimit.ts`.

---

### Q: How does admin authentication work?

**Short answer**

Email/password login verified with bcrypt, issuing an opaque random session
token stored server-side (hashed) in a `admin_sessions` table and
client-side as an `httpOnly` cookie; every admin route re-verifies that
session against the database on every request.

**Deep answer**

`POST /api/admin/login` looks up the account by email, compares the
submitted password against its bcrypt hash with `bcryptjs` (cost 12) — or,
if no account matches that email, compares against a precomputed dummy
hash instead, so the response takes roughly the same time either way and
doesn't leak whether an email has an account (timing-safe against
enumeration). On success, `createSession(userId)` generates a random
32-byte token, stores only its SHA-256 hash in `admin_sessions` along with
a 12-hour expiry, and the raw token is set as an `httpOnly`,
`SameSite=Strict` (and `Secure` in production) cookie. Every subsequent
admin-only route calls `requireAdmin(req, res)`, which reads that cookie,
hashes it, and joins `admin_sessions` → `admin_users` to confirm the
session both exists and hasn't expired — the cookie's mere presence is
never trusted on its own, so a forged or stale cookie is rejected every
time, not just at login.

**Evidence in S1P**

`api/admin/login.ts`; `api/_lib/auth.ts`'s `createSession`/`getAdminIdentity`/
`requireAdmin`.

---

### Q: Why sessions instead of JWT?

**Short answer**

Real, immediate revocation. Logging out deletes the session row, so a
copied cookie stops working instantly — a JWT's whole "no DB lookup"
advantage doesn't actually apply here, since this app already queries
Postgres on every request regardless.

**Deep answer**

A JWT's usual selling point is stateless verification — no database round
trip needed to check validity. That advantage doesn't materialize for this
app: `requireAdmin` already does a database query on every authenticated
request either way (to enforce real revocation), so a JWT would add
complexity (signing keys, expiry/refresh logic) without removing the DB
dependency it's normally chosen to avoid. And a JWT's actual weak point —
that a leaked token stays valid until it expires unless you maintain a
server-side denylist — would reintroduce exactly the "check state in the
database" step this project already does directly and more simply with a
session table. Given that a DB lookup was going to happen regardless, a
plain session row with a hashed token is the more direct design.

**Evidence in S1P**

`api/_lib/auth.ts`; `Docs/DECISIONS.md`'s "Opaque, database-backed sessions
— not JWT" entry.

---

### Q: How are session tokens stored securely?

**Short answer**

Only a SHA-256 hash of the token is ever written to the database — the raw
token exists only in the admin's own browser cookie and the one response
that set it.

**Deep answer**

This mirrors password hashing's core idea (a database leak alone
shouldn't be enough to authenticate as someone) but with a different
algorithm for a different threat model: passwords are low-entropy,
human-chosen secrets, so bcrypt's deliberate slowness matters (it raises
the cost of offline brute-forcing a stolen hash). A session token is
already a 32-byte cryptographically random value — there's no brute-force
risk to slow down, so hashing it with bcrypt would just add needless
latency to every single authenticated request for no security benefit.
SHA-256 gives the same "a DB read alone isn't enough" protection at
effectively zero cost.

**Evidence in S1P**

`api/_lib/auth.ts`'s `hashToken`; `db/schema.ts`'s `adminSessions.tokenHash`
doc comment, which states this reasoning directly.

---

### Q: What happens during logout?

**Short answer**

The server deletes the session's database row, then clears the cookie —
real invalidation, not just telling the browser to forget the cookie.

**Deep answer**

`POST /api/admin/logout` calls `invalidateSession(req)`, which reads the
current session cookie, hashes it, and `DELETE`s the matching
`admin_sessions` row — then separately clears the cookie by setting it with
`Max-Age=0`. If only the cookie were cleared, a copy of the old token value
(if somehow captured beforehand) would remain valid server-side until its
12-hour expiry; deleting the row makes it actually invalid, immediately,
for every future request that presents it. The admin-side `AdminApp.tsx`
also logs out client-side even if the network call itself fails — the
reasoning being that the server-side session simply outliving its cookie
until natural expiry is not a reason to strand the admin on a broken page.

**Evidence in S1P**

`api/admin/logout.ts`; `api/_lib/auth.ts`'s `invalidateSession`;
`AdminApp.tsx`'s `handleLogout`.

---

### Q: How does password hashing work?

**Short answer**

`bcryptjs` at cost factor 12 — a pure-JavaScript bcrypt implementation,
chosen deliberately over the native `bcrypt` package to avoid a
cross-compile mismatch between Windows development and Vercel's Linux
runtime.

**Deep answer**

`hashPassword`/`verifyPassword` in `api/_lib/password.ts` wrap
`bcrypt.hash(password, 12)`/`bcrypt.compare()`. This module is deliberately
separate from `auth.ts` even though both are "auth" code, because `auth.ts`
imports `db/client.ts`, which throws at module load time if `DATABASE_URL`
isn't set — bundling password hashing into that file would mean a test
exercising only bcrypt (`password.test.ts`) couldn't import the module
without a live database configured. The native `bcrypt` package (a
compiled C++ addon) was avoided specifically because a binary built on this
project's Windows dev machine wouldn't run on Vercel's Linux serverless
functions without a cross-compile step — `bcryptjs` sidesteps that
entirely at the cost of being somewhat slower in pure JS, which doesn't
matter for a single login endpoint.

**Evidence in S1P**

`api/_lib/password.ts`; `package.json`'s `bcryptjs` dependency;
`api/_lib/password.test.ts`.

---

### Q: How is screenshot validation performed, and why magic-byte validation instead of trusting MIME type?

**Short answer**

The server reads the actual leading bytes of the uploaded file and checks
them against known PNG/JPEG/WEBP signatures, because a request crafted
outside the browser can set `Content-Type` to anything it wants.

**Deep answer**

Client-side, `useScreenshotUpload` checks the browser's reported
`file.type` and `file.size` against `shared/screenshotLimits.ts`'s
constants — but that check exists purely for UX and can be trivially
bypassed by anyone calling the API directly. Server-side,
`verifyScreenshotIsRealImage()` in `api/_lib/donations.ts` fetches the
uploaded blob (via the Blob SDK's authenticated `get()`, since the store is
private — an unauthenticated `fetch()` would 401/403), reads only the first
16 bytes via the stream reader (enough to cover the longest check, WEBP's
non-contiguous "RIFF"..."WEBP" signature), and cancels the rest of the
stream rather than buffering a full 8MB file just to check a handful of
bytes. `magicBytes.ts`'s `sniffImageType()` does the actual byte
comparison against the PNG, JPEG, and WEBP signatures. A file renamed to
`.png` with fabricated `Content-Type: image/png` still fails this check
unless its real leading bytes match a genuine image signature.

**Evidence in S1P**

`api/_lib/magicBytes.ts`; `api/_lib/donations.ts`'s
`verifyScreenshotIsRealImage`/`readLeadingBytes`.

---

### Q: How does private Blob storage work, and how does presigned upload work?

**Short answer**

Screenshots live in a Vercel Blob store configured `access: 'private'`; the
browser uploads directly to Blob using a short-lived, OIDC-authenticated
presigned URL issued by the server — the file bytes never pass through this
app's own function body, and the raw Blob URL is never given to a
donor's or admin's browser afterward.

**Deep answer**

`POST /api/uploads/screenshot` calls `issueSignedToken()` (server-side,
authenticated via `VERCEL_OIDC_TOKEN` + `BLOB_STORE_ID` — no long-lived
`BLOB_READ_WRITE_TOKEN` involved), constrained to `allowedContentTypes`
(PNG/JPEG/WEBP) and `maximumSizeInBytes` (8MB), wrapped in
`handleUploadPresigned()`. The client's `uploadPresigned()` call then `PUT`s
the file directly to Blob storage using that token, passing
`access: 'private'` to match the store's real configuration. This is the
Vercel "Signed URLs" flow — chosen specifically because this project's Blob
store connection provisions access via OIDC by default and doesn't mint a
static read-write token, and the older `handleUpload()`/`upload()` pattern
requires that static token and can't use OIDC credentials at all (see the
historical-bug entry in `Docs/PROJECT_CONTEXT.md` §9 for the full story of
that migration, including a real gap in the old flow: its client tokens
never encoded an `access` level at all, so the server couldn't actually
verify what access level an upload used). Reading the file back later — for
server-side magic-byte verification, or for an admin viewing it — requires
the same OIDC credentials this server already holds; a raw, unauthenticated
fetch of the Blob URL returns 401/403.

**Evidence in S1P**

`api/uploads/screenshot.ts`; `donationService.ts`'s `uploadPresigned` call.

---

### Q: Why is screenshot retrieval server-side, not a direct Blob URL?

**Short answer**

Because the store is private, `donation.screenshotUrl` isn't directly
browser-fetchable at all — the admin dashboard has to go through an
authenticated server route that resolves the URL from the database and
streams the bytes through the response.

**Deep answer**

`GET /api/admin/donations/[id]/screenshot` is gated by the same
`requireAdmin()` every other admin route uses. It takes only a donation
`id` from the request — the Blob URL it actually fetches always comes from
that donation's own database row, never from anything the request itself
supplies, so there's no way to ask this route for an unrelated blob. It
calls the Blob SDK's `get(url, { access: 'private' })` server-side (the
same OIDC-authenticated call the upload route and magic-byte verification
already use) and pipes the response stream directly to the client
(`Readable.fromWeb(result.stream).pipe(res)`) — the underlying Blob URL or
any credential is never included in the response. It also sets
`Cache-Control: private, no-store`, since this is a donor's proof-of-payment
image and shouldn't sit in any shared/intermediate cache even though it's
already access-controlled. `SubmissionDetail.tsx`'s `<img>`/`<a>` point at
this route instead of the raw Blob URL — no extra client-side auth wiring
was needed, since a same-origin `<img>` request already carries the
admin's session cookie automatically.

**Evidence in S1P**

`api/admin/donations/[id]/screenshot.ts`; `SubmissionDetail.tsx`.

---

### Q: What happens if Blob upload succeeds but the DB insertion fails or is rejected?

**Short answer**

Every rejection path in `createDonation` that runs after a blob has already
been uploaded triggers a best-effort delete of that blob, so a rejected
request doesn't leave an orphaned file.

**Deep answer**

Three of `createDonation`'s outcomes happen after the client has already
uploaded a screenshot: `duplicate` (with a different screenshot than the
original request — the new upload is now redundant), `rate_limited`, and
`invalid_screenshot`. Each calls `safeDeleteBlob(url)`, which wraps the
Blob SDK's `del()` in a try/catch that only logs on failure — deliberately
best-effort, not something that can itself fail the response. The
reasoning: an orphaned blob left behind by a failed delete is a minor,
bounded storage cost; it is never worth compounding an already-rejected
request with a second error just because cleanup of the first one didn't
fully succeed. This is a documented gap, not a silent one — an unexpected
`del()` failure is still `console.error`-logged for visibility.

**Evidence in S1P**

`api/_lib/donations.ts`'s `safeDeleteBlob` and its three call sites inside
`createDonation`.

---

### Q: What happens if the same donation is submitted twice? What happens if two requests arrive concurrently?

**Short answer**

Both are handled by the idempotency key: a sequential retry finds the
existing row and returns it unchanged (`200`, not a new donation); a true
concurrent race is resolved by the database's own unique-index conflict
handling, not by application logic guessing who "won."

**Deep answer**

Sequential case (network retry, double-click, "I'll press submit again"):
`createDonation`'s very first step is a `SELECT` for an existing row with
the same idempotency key. If found, that row is returned as-is
(`outcome: 'duplicate'`) — no second insert, no error. Concurrent case (two
requests with the same key reach the server at nearly the same instant,
both pass that initial `SELECT` before either has inserted): both proceed
to the `INSERT ... ON CONFLICT (idempotency_key) DO NOTHING ... RETURNING`.
Postgres itself resolves the conflict — exactly one of the two inserts
actually succeeds and returns a row; the other's `RETURNING` comes back
empty, at which point that request re-reads the row the other one just
created, cleans up its own now-redundant blob upload, and returns it as a
`duplicate` too. Either way, exactly one donation row exists for that
idempotency key, guaranteed by the database's unique index rather than by
any assumption about request ordering or in-process locking (which
wouldn't hold across multiple serverless function instances anyway).

**Evidence in S1P**

`api/_lib/donations.ts`'s `createDonation`, specifically the
`onConflictDoNothing` branch and its fallback re-read.

---

### Q: What indexes exist and why?

**Short answer**

A unique index on the idempotency key (the actual duplicate-prevention
mechanism), a plain `created_at` index for the default admin listing, a
composite `(status, created_at)` index for the filtered listing, unique
indexes on admin email and session token hash, and a composite primary key
on the rate-limit table that doubles as its atomic-upsert target.

**Deep answer**

- `donations_idempotency_key_key` (unique) — not a performance index, a
  correctness constraint; it's what actually prevents two rows from
  existing for the same submission attempt even under a race.
- `donations_created_at_idx` — serves the admin dashboard's default,
  unfiltered "newest first" listing (`ORDER BY created_at DESC LIMIT ?`).
- `donations_status_created_at_idx`, composite with `status` as the leading
  column — serves the _filtered_ listing (`WHERE status = ? ORDER BY
created_at DESC`) from a single index scan. Kept as a separate index from
  the plain `created_at` one deliberately: a composite index with `status`
  leading can't efficiently serve a query with no `status` predicate at
  all, so one index can't cover both query shapes.
- `admin_users_email_key` (unique) — a real invariant (two admin accounts
  can't share an email), not just a lookup speed-up.
- `admin_sessions_token_hash_key` (unique) — the hot-path lookup on every
  single authenticated request.
- `rate_limits`' composite primary key `(key, window_start)` — this _is_
  the mechanism that makes the atomic
  `INSERT ... ON CONFLICT (key, window_start) DO UPDATE` upsert possible.

**Evidence in S1P**

`db/schema.ts`.

---

### Q: How are errors handled?

**Short answer**

One consistent response shape (`{ error: { message } }`) across every
route; internal error detail is logged server-side only and never returned
to the client.

**Deep answer**

`api/_lib/http.ts`'s `sendError(res, status, message)` is the single call
site every route uses to send an error — `message` is always a safe,
human-readable string the caller chose deliberately, never a raw caught
exception's `.message` or stack trace. Every route wraps its actual
operation in a `try/catch`; on an unexpected failure it `console.error`s
the real error (visible in Vercel's function logs, not the response) and
sends a generic `500` with a safe message like "We couldn't submit your
confirmation. Please try again." Validation failures (Zod) are the one case
where the client _does_ get a specific message — the first Zod issue's own
message, which is written to be donor/admin-readable already (e.g. "Amount
must be at least ₹300."). Unsupported HTTP methods get a `405` with an
`Allow` header listing what is supported.

**Evidence in S1P**

`api/_lib/http.ts`; the `try/catch` + `sendError` pattern repeated in every
route file under `api/`.

---

### Q: What would you change if traffic increased significantly?

**Short answer**

The fixed-window rate limiter and the per-request session-table lookup
would be the first two things I'd revisit — I'd move rate limiting to
something like Redis/Upstash for sliding-window precision under real
concurrency, and consider caching hot session lookups, before touching
anything else.

**Deep answer**

This is explicitly a "how I would evolve it" answer, not a description of
anything currently built — see the System Design section below for the
full current-vs-future framing. In rough priority order: (1) the
Postgres-backed rate limiter's fixed-window imprecision (up to ~2x burst
across a window boundary) becomes a real concern at real traffic, and a
Redis/Upstash-backed sliding window or token bucket would fix it without
adding load to the primary database; (2) every authenticated admin request
currently does a session-table join — fine at one admin, worth caching or
moving to a faster store if there were many concurrent admins; (3) the
single `pg.Pool` (`max: 5`) is tuned for a low-traffic app and would need
its pool size, and likely a read-replica split for the admin dashboard's
read-heavy listing queries, revisited under real load; (4) image processing
(currently just signature-sniffing, no resizing/transcoding) would move to
a background job/queue rather than happening inline in the request path if
screenshots got large or numerous enough to matter.

**Evidence in S1P**

`db/client.ts`'s `max: 5` pool size; `api/_lib/rateLimit.ts`'s documented
fixed-window tradeoff (this is a documented _current_ limitation, not
something already fixed).

---

# System Design

> **Framing used throughout this section:** every answer first states what
> S1P actually does today, then separately what I'd change to evolve it.
> The two are never blended — a future idea is never described as if it's
> already implemented.

### Q: Design S1P from scratch. What are the major components?

**Short answer**

Three components: a static frontend (donor SPA + admin SPA), a set of
stateless serverless API functions, and two pieces of shared state
(Postgres for structured data, Blob storage for files) — exactly what this
project actually has.

**Deep answer**

**Current S1P architecture:** a donor-facing SPA and an admin SPA (two
separate Vite build entries, same origin), a set of stateless Vercel
Functions handling validation/business logic/auth, a relational database
holding four tables (donations, admin accounts, sessions, rate-limit
counters), and private object storage for screenshot files. The frontend
never talks to the database directly; every write and every piece of
protected data flows through the API layer, which is the sole trust
boundary (see the trust-boundaries question below).

**How I would evolve it:** for materially higher scale or more complex
requirements, I'd introduce a message queue for anything that doesn't need
a synchronous response (e.g. sending a donor confirmation email, or a
future automated-verification pipeline), a caching layer in front of the
admin dashboard's read-heavy list/summary queries, and likely split
image-verification/processing into a background worker rather than doing
it inline in the request that creates the donation.

**Evidence in S1P**

`api/`, `db/schema.ts`, `src/`/`src/admin/` split — describes what exists,
not the evolved version.

---

### Q: Where are the trust boundaries?

**Short answer**

Between the browser and the API — nothing from the client is trusted
without server-side re-validation, and the database/Blob store are never
reachable except through that API layer.

**Deep answer**

**Current S1P architecture:** the browser is fully untrusted. Client-side
validation exists purely for UX (`validateConfirmationForm`); the server
independently re-validates everything with Zod. The uploaded screenshot's
declared MIME type is untrusted; the server checks real bytes. The
idempotency key is client-generated but its _uniqueness guarantee_ is
enforced by the database, not trusted from the client's good behavior. The
donor's browser never has direct database or Blob credentials — it gets a
narrowly-scoped, short-lived presigned upload token, and even that token is
constrained (type/size) so it can't be used to upload something outside
the accepted screenshot criteria. The admin's browser holds only an opaque
session cookie; every admin request is re-authorized server-side, not
trusted because a previous request in the session succeeded.

**How I would evolve it:** at genuinely adversarial scale I'd add explicit
request-origin checks and probably a CAPTCHA/bot-challenge at the one
public write endpoint (`POST /api/donations`) that currently has no defense
beyond the IP-based rate limiter — see the abuse-prevention question below.

**Evidence in S1P**

`api/_lib/validation.ts` (server re-validation); `api/_lib/magicBytes.ts`
(real-bytes check); `api/uploads/screenshot.ts` (constrained presigned
token); `Docs/PROJECT_CONTEXT.md` §6.

---

### Q: Where are the bottlenecks? What happens under concurrent submissions?

**Short answer**

The single Postgres connection pool (`max: 5`) is the practical ceiling at
real scale; concurrent submissions are already handled correctly (not just
"probably fine") via the idempotency unique constraint and the atomic
rate-limit upsert — verified by an integration test that specifically
exercises the DB-level unique constraint under a race.

**Deep answer**

**Current S1P architecture:** `db/client.ts` caches one `pg.Pool` with
`max: 5` connections per warm serverless instance. Under real concurrent
load, that pool size — tuned for a low-traffic charity page — would become
the bottleneck before the database itself would. Correctness under
concurrency, though, is already handled, not a gap: two donation
submissions with the same idempotency key racing each other resolve
through Postgres's own `ON CONFLICT` handling (see the earlier concurrency
question), and the rate limiter's `INSERT ... ON CONFLICT DO UPDATE` is a
single atomic statement with no separate read-then-write step for two
concurrent requests to race through.

**How I would evolve it:** raise/tune the pool size and add connection
pooling awareness (Neon's own pooled endpoint helps here already, but a
PgBouncer-style external pooler would matter more at real scale), consider
read replicas for the admin dashboard's list/summary queries (which are
pure reads and don't need to hit the primary), and move the rate limiter to
Redis specifically to take that write traffic off the primary Postgres
instance entirely.

**Evidence in S1P**

`db/client.ts`'s `max: 5`; `donations.integration.test.ts`'s
unique-constraint-under-a-race test case (see `Docs/PROJECT_CONTEXT.md` §8).

---

### Q: How would you handle 10x/100x traffic? Would you introduce Redis? Would you introduce a queue?

**Short answer**

At 10x, I'd start by tuning the connection pool and watching the rate
limiter's write load; at 100x, yes to both Redis (rate limiting, hot
session/read caching) and a queue (anything that doesn't need a synchronous
response in the donation-submission path).

**Deep answer**

This is entirely "how I would evolve it" — none of the below is built.
**10x:** likely still fine on the current architecture with connection-pool
tuning and closer monitoring; the fixed-window rate limiter's imprecision
matters more but isn't yet a redesign trigger. **100x:** I'd introduce
Redis/Upstash specifically for rate limiting (moving that write-heavy,
low-latency-sensitive workload off the primary Postgres, and getting
sliding-window precision instead of the fixed window's up-to-2x burst
tolerance) and for caching the admin dashboard's summary tiles (which
currently recompute a full aggregate query on every dashboard load). A
queue would make sense for anything genuinely asynchronous that doesn't
need to block the donor's submission response — a donor confirmation
email, or a future automated pre-check on the screenshot before it reaches
a human reviewer — but the core `createDonation` write path itself
(idempotency check, rate limit, insert) is a good candidate to _keep_
synchronous, since the donor is waiting on that response and the operations
involved are already fast.

**Evidence in S1P**

None — explicitly flagged as future-only. Current: `api/_lib/rateLimit.ts`;
`getDonationSummary()` in `api/_lib/donations.ts` (the query that would
benefit from caching).

---

### Q: How would you handle image processing at scale?

**Short answer**

Today it's just signature verification (cheap, inline, synchronous). At
real scale, I'd move resizing/transcoding/any heavier processing to a
background job triggered after the donation is created, not before.

**Deep answer**

**Current S1P architecture:** the only "processing" that happens is
reading 16 bytes off the front of the file to check its signature — cheap
enough to do inline, synchronously, in the same request that creates the
donation. There is no resizing, thumbnailing, or transcoding anywhere in
the system; the admin dashboard displays the original uploaded file
directly.

**How I would evolve it:** if screenshots needed thumbnails (for a faster
dashboard list view) or format normalization, I'd generate those
asynchronously after the donation row is created — the donor's own
submission response shouldn't wait on work that only benefits the admin's
later review experience. A queue (or Vercel's own scheduled/background
function options) would trigger that work off the donation's insert.

**Evidence in S1P**

`api/_lib/magicBytes.ts`'s `readLeadingBytes` (16-byte read, no full-file
processing) — describes the current, deliberately minimal state.

---

### Q: How would you improve observability?

**Short answer**

Today, error visibility is `console.error` calls surfaced in Vercel's
function logs — no structured logging, metrics, or tracing. I'd add
structured logging and basic request/error metrics first.

**Deep answer**

**Current S1P architecture:** every route's `catch` block does a plain
`console.error(message, err)` before returning a generic error to the
client — this is genuinely useful for post-hoc debugging via Vercel's
function log viewer, but there's no structured log format, no metrics
(request counts, error rates, latency percentiles), and no distributed
tracing.

**How I would evolve it:** structured JSON logging (so logs are queryable,
not just greppable), basic metrics on each route (request count, error
rate, p50/p95 latency), and specific alerting on the two things that
actually matter for this app's health — the rate limiter rejecting a
suspicious volume of requests, and the donation-creation success rate
dropping (which would likely mean a Blob or Postgres connectivity problem).

**Evidence in S1P**

`console.error` calls across every route handler in `api/` — describes
what exists today.

---

### Q: How would you support multiple admins?

**Short answer**

The schema already supports it (`admin_users` has no uniqueness constraint
tying the system to one row) — what's missing is a sign-up/invite flow and
probably per-admin audit trail on status changes.

**Deep answer**

**Current S1P architecture:** deliberately single-admin by _process_, not
by schema — `admin_users.email` is unique per row, but nothing prevents a
second row from existing; there's simply no code path that creates one
except the manual `npm run db:seed-admin` script, run directly against the
database. `updateDonationStatus` doesn't currently record _which_ admin
made a change.

**How I would evolve it:** add an invite or admin-creation flow (currently
deliberately absent — the project's own decision log frames this as "one
admin, not a user-management system," a scope choice, not a technical
limitation), and add an `updated_by`/audit-log concept so a status change
is attributable to a specific admin, which matters once more than one
person can make them.

**Evidence in S1P**

`db/schema.ts`'s `adminUsers` (no single-row constraint, just a unique
email index); `db/seedAdmin.ts`'s `onConflictDoUpdate` (designed for
rotating _one_ known account, not managing many).

---

### Q: How would you support multiple donation campaigns?

**Short answer**

Not supported today — there's exactly one implicit "campaign." I'd add a
`campaigns` table and a foreign key from `donations`, plus per-campaign
config for the UPI ID/amount range currently hardcoded as single global
values.

**Deep answer**

**Current S1P architecture:** the UPI ID, phone number, and ₹300–3000
amount range are all single global values (`DONATION_CONFIG` on the
frontend, `shared/donationLimits.ts` shared with the backend) — there's no
concept of "which campaign" a donation belongs to anywhere in the schema or
API.

**How I would evolve it:** a `campaigns` table (name, UPI ID, amount range,
active/inactive), a `campaign_id` foreign key added to `donations`, and the
frontend's currently-hardcoded `DONATION_CONFIG` becoming a per-campaign
fetch instead of a static import. The admin dashboard's filters would gain
a campaign dimension alongside the existing status filter.

**Evidence in S1P**

`src/components/donation/config.ts`; `shared/donationLimits.ts` — both
single global values today.

---

### Q: How would you handle retention/deletion?

**Short answer**

Not implemented today — donation records and screenshots are kept
indefinitely. I'd add an explicit retention policy and a scheduled deletion
job, especially for the screenshot files (they may contain partial personal
payment details).

**Deep answer**

**Current S1P architecture:** no deletion path exists for donation records
or their screenshots — `rejected` donations are kept exactly like
`reviewed` ones, and there is no admin action or scheduled job that removes
old data.

**How I would evolve it:** define an explicit retention window (e.g. delete
screenshot files, but keep the anonymized donation record, after N months;
or delete `rejected` records entirely after some period), and implement it
as a scheduled job (Vercel Cron or similar) rather than ad hoc admin
action, so retention is consistent and auditable. This matters more than it
might first appear because screenshots are donor-submitted images that can
incidentally contain partial account information from their UPI app's
confirmation screen.

**Evidence in S1P**

No deletion code path exists in `api/_lib/donations.ts` — explicitly
absent, not overlooked in this description.

---

### Q: How would you improve reliability?

**Short answer**

The current design already handles the two failure modes that matter most
for a donation flow (duplicate submissions, orphaned blobs on rejection)
correctly. I'd add retry/backoff on the Blob delete cleanup and health
checks/alerting for the Postgres and Blob dependencies.

**Deep answer**

**Current S1P architecture:** `safeDeleteBlob`'s cleanup is genuinely
best-effort — a failed delete is logged and dropped, not retried. That's a
deliberate, reasonable tradeoff (an orphaned blob is a bounded minor cost,
never worth failing or complicating an already-rejected request), but it
does mean a failed cleanup is currently a fire-and-forget log line with no
follow-up.

**How I would evolve it:** a lightweight retry queue (or even a periodic
sweep job comparing Blob storage against referenced `screenshot_url`
values in the database) for cleanup failures specifically, plus basic
uptime/health checks against the Postgres connection and Blob
reachability, surfaced as alerts rather than only discoverable by reading
function logs after the fact.

**Evidence in S1P**

`api/_lib/donations.ts`'s `safeDeleteBlob` (current, deliberately
best-effort behavior).

---

### Q: How would you prevent abuse? What changes if donations become high volume?

**Short answer**

Today: IP-based Postgres rate limiting on both public write endpoints, and
server-side re-validation of everything — no CAPTCHA. At high volume, I'd
add a CAPTCHA/bot-challenge and move rate limiting to something with
sliding-window precision.

**Deep answer**

**Current S1P architecture:** `POST /api/donations` is capped at 10/hour
per IP, `POST /api/admin/login` at 20/hour per IP, both via the same
Postgres fixed-window mechanism. This is a real, working deterrent against
casual scripted abuse, and it's explicitly documented as _not_ a claim of
strong resistance against a sophisticated or distributed attacker — there's
no CAPTCHA, no device fingerprinting, no anomaly detection anywhere in the
system.

**How I would evolve it:** if real spam/abuse were observed (the project's
own stance, per `CLAUDE.md`, is to add a CAPTCHA only if that actually
happens, not preemptively), I'd add one at the confirmation-form submit
step specifically — the point where a bot would otherwise complete a full
fake submission. At genuinely high legitimate volume, the fixed window's
imprecision (up to ~2x burst across a window boundary) becomes more
consequential, which is the same case for moving to a Redis-backed sliding
window discussed above.

**Evidence in S1P**

`api/_lib/rateLimit.ts`'s thresholds; `Docs/PROJECT_CONTEXT.md` §6's
explicit "what this security model does NOT claim" section.

---

# Frontend

### Q: Why React/Vite?

**Short answer**

React + TypeScript for a component-driven, type-safe build of a genuinely
stateful multi-step flow; Vite for its dev-server speed and because this
project needs a plain static build with no SSR requirement.

**Deep answer**

The donation flow has real, non-trivial state (which step is showing, form
fields, upload lifecycle, validation errors) that benefits from a
component model with explicit state management rather than hand-rolled DOM
manipulation. TypeScript in strict mode catches an entire class of bugs
(wrong action shapes dispatched to a reducer, a missing field on a
component's props) before runtime. Vite was chosen over alternatives like
Create React App or a hand-rolled bundler config for its dev-server speed
and because this project's actual requirement — a static build plus a
handful of small serverless API routes — never needed a metaframework's
SSR/file-routing features (see the Next.js discussion in the Backend
section, which covers this same reasoning from the backend-integration
angle).

**Evidence in S1P**

`vite.config.ts`; `tsconfig.app.json`'s `strict: true`.

---

### Q: How is state organized? Why reducers where they're used?

**Short answer**

Three small, independently-owned state machines for the donation flow
(step, form, upload) instead of one large reducer or scattered booleans —
each was reached for specifically because the flow it models has multiple
named states and named transitions between them, not just a couple of
independent flags.

**Deep answer**

`useReducer` was chosen over plain `useState` specifically where a piece of
UI has _multiple states with named transitions between them_ — the
donation step flow (`amount → payment → confirmation → success`, 4
actions) and the confirmation form's submission lifecycle
(`idle → submitting → error`, 4 actions) both fit that shape well. They're
kept as two _separate_ reducers, not merged, because they change at
completely different rates for different reasons: the step reducer changes
a handful of times per donation, advanced by discrete button clicks; the
form reducer changes on every keystroke. Merging them would mean every
keystroke re-evaluates step-transition logic that has nothing to do with
typing, and would give the outer flow field-level state responsibility that
3 of its 4 screens never touch at all. The screenshot upload state
(`useScreenshotUpload`) is a third, separate piece for the same reason
again — its lifecycle (`empty → uploading → uploaded`, plus `invalid`/
`error`) doesn't map onto either the step flow or the form's text fields.
Everywhere else in the app (admin auth-check state, dashboard load state,
testimonial crossfade phase), plain `useState` is used — reducers weren't
reached for reflexively, only where the "multiple named states, named
transitions" shape actually fit.

**Evidence in S1P**

`donationReducer.ts`, `confirmationFormReducer.ts`, `useScreenshotUpload.ts`;
`Docs/DECISIONS.md`'s donation-state-architecture reasoning.

---

### Q: How does the donation flow work end to end, from the frontend's perspective?

**Short answer**

`DonationSection` owns `donationReducer` and renders whichever step
component matches the current state; `ConfirmationStep` (the one step with
real form complexity) separately owns the form reducer and the upload hook,
and calls `donationService.submitDonation()` as the one function that
actually talks to the backend.

**Deep answer**

`AmountStep` dispatches `AMOUNT_CONFIRMED` with a validated amount, moving
the outer state to `payment`. `PaymentStep` shows the QR code (generated
client-side by `qrcode.react`, encoding a UPI deep link with the donor's
exact amount pre-filled) and dispatches `PAYMENT_CONFIRMED` on "I've Paid"
— no backend call at this point, purely a UI transition, since nothing has
actually been submitted yet. `ConfirmationStep` is where the real work
happens: it owns `formReducer` (fields, errors, submission status) and
`useScreenshotUpload` (the file's own lifecycle) as sibling pieces of
state, plus a `useRef`-cached idempotency key. On submit, it runs
`validateConfirmationForm` synchronously; if that fails, it dispatches
`VALIDATION_FAILED` and moves focus to the first invalid field. If it
passes, it dispatches `SUBMIT_STARTED` and calls
`donationService.submitDonation()` — the one function this whole flow
depends on for actually reaching the backend. On success, it calls the
`onSuccess` callback passed down from `DonationSection`, which dispatches
`SUBMISSION_SUCCEEDED` on the _outer_ reducer, moving to the `success`
step. On failure, it dispatches `SUBMIT_FAILED` with the error message,
staying on the same step with the donor's typed values intact.

**Evidence in S1P**

`DonationSection.tsx`, `ConfirmationStep.tsx`, `donationService.ts`.

---

### Q: How is form state handled, and how is validation handled?

**Short answer**

`confirmationFormReducer` owns the raw string values, per-field errors, and
submission status; `validateConfirmationForm` is a separate pure function
that only runs synchronously on submit attempt — not on every keystroke.

**Deep answer**

Every field is stored as a raw string in `FormState.values` (even
`amountPaid`, despite being numeric — kept as a string so the input can
hold an empty or partially-typed value without fighting a `number` type).
`validateConfirmationForm(values, uploadState)` is a pure function,
independently unit-tested, that returns a `FormErrors` object — it checks
name/address non-empty, the amount against the shared ₹300–3000 constant,
and the upload state's status. It's synchronous because nothing in this
form's validation is actually async — there was originally a sketch that
included a separate "validating" state in the submission lifecycle, cut
specifically because it would have been true for 0ms in practice with
nothing to show a user during it (documented in `CLAUDE.md`'s decision
log as the seam where an async validation step, like a real-time address
lookup, would get added back if one were ever needed). `FIELD_CHANGED`
clears only that one field's own error, not the whole error set, so fixing
one mistake doesn't hide a still-real error on another field — and errors
don't reappear until the _next_ submit attempt, deliberately not
revalidated on every keystroke, since that tends to read as the form
scolding the user mid-sentence rather than confirming a finished field.

**Evidence in S1P**

`confirmationFormReducer.ts`'s `formReducer` and `validateConfirmationForm`;
`confirmationFormReducer.test.ts`.

---

### Q: How does screenshot preview work, and how is screenshot memory managed?

**Short answer**

`URL.createObjectURL` generates a local preview after a short, honestly-
disclosed synthetic delay (this isn't a real network upload yet); the
object URL is explicitly revoked on replace, on remove, and on unmount,
tracked via a `ref` so the revoke can happen inside effect cleanup without
itself causing a re-render.

**Deep answer**

`useScreenshotUpload.selectFile` first checks the file's type/size against
`shared/screenshotLimits.ts`'s constants; if invalid, it sets an `invalid`
state with a specific message and stops. If valid, it sets `uploading`
(with just the filename, no preview yet) and, after a 500ms
`window.setTimeout`, generates the preview via `URL.createObjectURL(file)`
and moves to `uploaded`. That delay is a deliberately honest UX choice, not
a fake network simulation — the hook's own comment explains that "uploading"
here means _local processing_, since the real network transfer only
happens once, later, when the whole form submits. Memory management: a
`stateRef` mirrors the current state so effect cleanup (on unmount) can
revoke whatever preview URL is currently held without needing `state` as a
dependency; `removeFile` revokes inside its own `setState` updater; and
replacing an already-selected file revokes the _previous_ preview
synchronously, immediately when the new file is chosen — not inside the
delayed callback, because by the time that callback's own `setState`
updater runs, the synchronous `setState({status: 'uploading'})` that
already happened has overwritten the `'uploaded'` state that updater would
have needed to see (this was a real, found-and-fixed bug — see the
Frontend historical-bugs coverage in `Docs/PROJECT_CONTEXT.md` §9).

**Evidence in S1P**

`useScreenshotUpload.ts`; `useScreenshotUpload.test.ts`'s revoke-on-replace
assertion.

---

### Q: How does the frontend interact with the presigned upload flow?

**Short answer**

`donationService.submitDonation()` calls `@vercel/blob/client`'s
`uploadPresigned()` directly against `/api/uploads/screenshot`, gets back a
Blob URL, and only then `POST`s the donation metadata including that URL —
two sequential network operations, not one.

**Deep answer**

The frontend never talks to Vercel Blob's actual storage API with any
credential of its own — `uploadPresigned(pathname, file, { access:
'private', handleUploadUrl: '/api/uploads/screenshot' })` handles the
two-step presigned flow internally: it calls the given URL to get a signed
upload credential, then `PUT`s the file directly to Blob storage using
that credential. The `pathname` itself is generated client-side as a
random UUID plus an extension derived from the file's MIME type — never
the donor's original filename. Once that resolves with the resulting Blob
URL, `submitDonation` makes a second, separate call —
`fetch('/api/donations', { method: 'POST', body: JSON.stringify({...,
screenshotUrl: blob.url }) })`. If that second call's response isn't `ok`,
it throws with the server's own error message (parsed from the JSON error
body) so the confirmation form's `catch` block can show something specific
rather than a generic failure.

**Evidence in S1P**

`donationService.ts`'s `submitDonation`.

---

### Q: How does the frontend handle API failures?

**Short answer**

Every `fetch` call site catches failure and surfaces a specific,
donor/admin-readable message where the server provided one, falling back
to a generic message otherwise — never a silent failure, never a raw error
object shown to the user.

**Deep answer**

On the donor side, `donationService.submitDonation` throws an `Error` with
either the server's own JSON error message or a generic fallback; that
propagates up to `ConfirmationStep`'s `catch`, which dispatches
`SUBMIT_FAILED` with that message and displays it in a `role="alert"`
element — the form's field values and uploaded screenshot are preserved
(`SUBMIT_FAILED` never touches `values`), so the donor can just retry
rather than re-entering everything. On the admin side, `src/admin/api.ts`'s
`request()` helper centralizes this: any non-`ok` response throws a typed
`ApiError` carrying both the message and the HTTP status, which
`DashboardPage`/`SubmissionDetail` catch and render inline (also via
`role="alert"`). `AdminApp`'s initial auth check (`me()`) specifically
treats _any_ failure — network error or a genuine 401 — as "not logged in"
and shows the login page, rather than distinguishing them, since both
cases have the identical correct UI response.

**Evidence in S1P**

`donationService.ts`; `src/admin/api.ts`'s `ApiError`; `ConfirmationStep.tsx`'s
`catch` block; `DashboardPage.tsx`/`SubmissionDetail.tsx`'s error states.

---

### Q: How is accessibility handled, and how does focus management work?

**Short answer**

Beyond standard semantic HTML/labels/contrast, the project found and fixed
three real focus-management bugs that share one root cause: a focused
element disappearing from the DOM silently drops focus to `<body>`, with no
signal to keyboard or screen reader users that anything changed.

**Deep answer**

Every donation-flow step focuses its own `<h2>` on mount via a small
`useAutoFocus` hook (`tabIndex={-1}` makes it programmatically focusable
without joining the normal tab order) — found necessary because advancing a
step removes the just-clicked button from the DOM, and browsers reset
focus to `<body>` by default with zero indication anything happened. The
same root cause showed up twice more: a failed confirmation-form
submission wasn't moving focus anywhere (an `aria-describedby`-associated
error message doesn't get announced until its field is actually _focused_
— fixed by focusing the first invalid field, in a fixed priority order, on
a failed submit), and closing the mobile nav menu via Escape stranded
focus at `<body>` when its now-hidden links unmounted (fixed by explicitly
returning focus to the menu's toggle button). Beyond focus specifically:
44×44px minimum touch targets everywhere (including separating a small
visual dot indicator from its larger clickable wrapper), `--color-red-deep`
(≈5.1:1 contrast) used for all readable error text instead of the brand red
(≈3.96:1, under the 4.5:1 AA minimum — computed via relative luminance, not
eyeballed), and testimonial navigation using plain buttons with
`aria-current` rather than the ARIA `tab`/`tablist` pattern, which was
originally used but implies arrow-key roving focus that was never actually
built — claiming a widget role without its required keyboard behavior was
judged worse than not claiming it.

**Evidence in S1P**

`src/components/ui/useAutoFocus.ts`; `ConfirmationStep.tsx`'s
`FIELD_FOCUS_ORDER`; `Header.tsx`'s Escape handler;
`ConfirmationStep.test.tsx`'s focus-after-failed-submit regression test.

---

### Q: How are animations implemented without hurting performance?

**Short answer**

`transform`/`opacity` only, CSS keyframes, no `requestAnimationFrame` loop
and no canvas anywhere except one deliberate, documented, finite exception
— and every scroll-driven trigger uses `IntersectionObserver`, never a
`scroll` listener.

**Deep answer**

The hero's "Gathering Point" animation — the site's only continuous
ambient motion — is 6–11 small SVG shapes animated purely with CSS
keyframes and custom properties; nothing about it runs JavaScript on every
frame. Every other animated element on the page (button/link hovers, form
field focus rings, the testimonial crossfade, the FAQ accordion, section
entrances) is triggered by a discrete user action or a one-time
scroll-into-view via `useScrollReveal` (`IntersectionObserver`-based), and
animates once, not continuously. There are exactly two documented
exceptions to the "no continuous JS, transform/opacity only" rule: (1)
`useCountUp`'s single finite `requestAnimationFrame` count-up (~1.1s,
cleaned up on completion and unmount) for the Impact section's four
numbers — a one-shot animation with a clear end, not a loop; (2) the FAQ
accordion's `grid-template-rows` transition, the one place a
layout-triggering CSS property is used anywhere in the codebase,
deliberately scoped to one small subtree because it's the only known-good
CSS technique for animating to an unknown `auto` height. A real regression
was caught and fixed in this exact area during a performance audit: the
testimonial dot indicators were animating `width` (a layout-triggering
property, violating the project's own rule) — fixed by animating
`transform: scaleX()` on a fixed-width visual pill instead, which also
incidentally fixed a touch-target-size bug in the same element.

**Evidence in S1P**

`src/components/hero/GatheringPoint.tsx` + `hero.css`;
`src/components/impact/useCountUp.ts`; `src/components/faq/FAQ.tsx`;
`Docs/PROJECT_CONTEXT.md` §3.

---

### Q: How was Lighthouse performance improved?

**Short answer**

Two real, specific findings from an actual Lighthouse run against the
production build — a missing `robots.txt` and a contrast failure on the
primary CTA button — were found and fixed, taking Accessibility from 96 to
100 and SEO from 92 to 100; mobile Performance's 95 was left alone because
no specific fixable cause was found.

**Deep answer**

Lighthouse was run against `vite preview`'s actual production build, not
the dev server (which would give misleading numbers). Desktop started at
Performance 100 / Accessibility 96 / Best Practices 100 / SEO 92, mobile at
Performance 95. The two point-losses were concrete: no `public/robots.txt`
existed at all, so Lighthouse tried to parse `index.html`'s own markup as
robots directives (53 "syntax not understood" errors) — fixed by adding a
real `robots.txt`. The CTA button's white text on the original brand red
(`#E63946`) measured 4.17:1 — under the 4.5:1 WCAG AA minimum — in three
places, plus a freshly-introduced instance in the admin dashboard's own
filter buttons (caught by grepping the whole codebase for `bg-red` rather
than assuming the newer admin code was already clean). Fixed by making
`--color-red-deep` (already a cataloged brand color, ≈5.1:1) the buttons'
resting fill, with a new `--color-red-darkest` added for hover/active — a
real design-system decision (it changes the primary CTA's default color
site-wide), surfaced to the user rather than changed unilaterally.
Re-measured after the fix, not assumed: Accessibility and SEO both reached 100. Mobile's remaining 95 (driven by simulated network/CPU throttling on
an already self-hosted-font, no-scroll-listener page) was deliberately not
chased further — the instruction for that phase was evidence-driven
optimization, and no specific fixable cause was identified.

**Evidence in S1P**

`Docs/PROJECT_CONTEXT.md` §11; `public/robots.txt`; the `--color-red-deep`/
`--color-red-darkest` CSS custom properties.

---

### Q: How is CSP configured?

**Short answer**

Via `vercel.json`, restricting scripts/styles/connections/images to
`'self'` plus the one genuinely-used cross-origin destination (the private
Blob store's upload endpoint) — every allowance was checked against actual
codebase usage first, not copied from a generic permissive template.

**Deep answer**

`style-src` includes `'unsafe-inline'` specifically because inline styles
are genuinely used in two places (`App.tsx`'s scroll sentinel, `FAQ.tsx`'s
height transition) — confirmed by grepping the codebase before writing the
policy, not assumed necessary by default. `connect-src` allows only
`https://*.private.blob.vercel-storage.com`, the one cross-origin
destination the app actually calls (the browser's direct presigned `PUT`
to Blob storage) — narrowed from an earlier, broader policy that also
allowed the public Blob domain, back when it wasn't yet settled whether
uploads would end up public or private. `img-src` has no Blob-domain entry
at all, because the admin dashboard reads screenshots through the
same-origin `/api/admin/donations/[id]/screenshot` route, never an `<img>`
pointed directly at a Blob URL — confirmed by grepping `src/` for any
remaining direct Blob-URL image usage before removing it from the policy.
`/api/*` responses additionally get `Cache-Control: no-store`. This is only
meaningfully testable against a live/preview deployment, since `vite dev`
and `vite preview` don't apply these headers at all.

**Evidence in S1P**

`vercel.json`; `Docs/DECISIONS.md`'s CSP entry.

---

### Q: Why is admin a separate Vite entry? Why not introduce React Router just for admin?

**Short answer**

A separate `admin.html` entry keeps the admin bundle out of every donor's
page load entirely — a router wouldn't help with that on its own, since
both routes would still ship in the same JS bundle. And with exactly two
admin views and zero deep-linking need, `useState` is the entire routing
mechanism required.

**Deep answer**

If admin were "just another route" inside the existing single-page app, a
donor loading the public site would still download all of the admin
dashboard's code in the same JavaScript bundle — a router changes _which_
component renders for a given URL, not which code ships to the browser in
the first place; code-splitting that away would need its own additional
setup. A second Vite entry (`admin.html`, built via
`vite.config.ts`'s multi-page `build.rollupOptions.input`) solves this
directly at the build-tool level: it's a genuinely separate bundle,
verified by comparing actual output byte counts (the public bundle is
374.01 kB with the admin app present, versus a 374.23 kB baseline before it
existed — the admin-specific ~11 kB chunk is only downloaded by someone who
visits `/admin.html`). Once inside that separate admin app, a router still
wasn't introduced, because `AdminApp` only ever needs to show one of two
things (the donation list, or one donation's detail) and there's no
requirement to bookmark or share a link to a specific submission — two
`useState` values (auth status, current view) are the complete "routing"
this needs.

**Evidence in S1P**

`vite.config.ts`'s `build.rollupOptions.input`; `admin.html`;
`AdminApp.tsx`.

---

### Q: How are public/admin bundles separated, concretely?

**Short answer**

Vite's native multi-page build — two HTML entry points, each pulling in
only the JS it actually imports — verified by comparing real build output
sizes, not just assumed from the config.

**Deep answer**

`vite.config.ts`'s `build.rollupOptions.input` lists both `index.html`
(`main`) and `admin.html` (`admin`) as separate entries. Rollup (Vite's
production bundler) then produces separate entry chunks for each, with any
genuinely shared code (React itself, shared UI components like `Button`)
factored into a common chunk both entries reference. This is the standard
mechanism, not a custom one — the discipline here was in _verifying_ it
actually worked as expected rather than trusting the config: comparing the
public bundle's real byte count before and after the admin app existed
(374.23 kB → 374.01 kB combined `main` + shared chunk — effectively
unchanged) and confirming the admin-specific code was a small, separate
~11 kB chunk.

**Evidence in S1P**

`vite.config.ts`; `README.md`'s bundle-size table.

---

### Q: What frontend improvements would you make next?

**Short answer**

Real analytics, donor email/SMS confirmation, and — since it's the most
consequential current gap — actually exercising the deployed admin
dashboard end-to-end against the production backend, not just against
Vitest/local testing.

**Deep answer**

This is deliberately a "future ideas" answer, clearly separated from
what's built. In priority order for a real launch: (1) replace the
remaining placeholder content (2 of 3 testimonials, social links, impact
figures — all clearly flagged as placeholders in the code, not
accidentally shipped as real); (2) donor-facing confirmation
(email/SMS) once a submission is reviewed, currently entirely absent;
(3) real analytics on the donation funnel (currently none); (4) on the
purely technical side, capturing real portfolio screenshots of the live
deployment (explicitly noted as not yet done) and finishing the
production-verification checklist in `Docs/PROJECT_CONTEXT.md` §12–13 —
the admin dashboard UI has so far only been tested against a backend that
wasn't actually running (`vite dev` doesn't serve `/api/*`), which is a
real gap between "the code looks right" and "it's been watched working."

**Evidence in S1P**

`README.md`'s Content Checklist section; `Docs/PROJECT_CONTEXT.md` §12–13.
