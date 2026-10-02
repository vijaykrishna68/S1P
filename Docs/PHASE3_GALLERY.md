# Phase 3 — Gallery: Technical Reference

Status: **Implemented.** Backend logic verified against a real Postgres
(25 integration tests, see below); frontend verified by typecheck, lint,
build, and structural browser checks. Full live-network E2E (real upload
through a running server) was not verified in this environment — see
"Known limitations" at the end.

Builds on the approved [Phase 1 IA Proposal](PHASE1_IA_PROPOSAL.md), which
scoped the Gallery's public/admin experience and explicitly deferred the
backend to this phase.

---

## Data model

One new table, `gallery_images` (`db/schema.ts`, migration
`db/migrations/0001_regular_hydra.sql`):

| Column       | Type                                 | Notes                                                                                   |
| ------------ | ------------------------------------ | --------------------------------------------------------------------------------------- |
| `id`         | uuid, PK                             | `defaultRandom()`                                                                       |
| `blob_url`   | text, not null                       | The actual Blob URL — server-side only, never sent to the browser (see "Storage" below) |
| `caption`    | text, nullable                       | Optional; doubles as the image's alt text when present                                  |
| `created_at` | timestamptz, not null, default now() | Ordering (newest first); indexed                                                        |

No `sortOrder`, album, tag, like, or comment columns — none of those were
requested, and `createdAt` ordering is the only need so far. A nullable
`sortOrder` integer is the natural place to add manual reordering later, if
ever needed — not built now.

## API endpoints

| Method   | Path                         | Auth   | Purpose                                                                                                                                                 |
| -------- | ---------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/gallery`               | Public | List all images, newest first. Returns `{ items: PublicGalleryImage[] }` — never the raw `blobUrl`.                                                     |
| `POST`   | `/api/gallery`               | Admin  | Create a gallery image record after the browser has uploaded the file directly to Blob. Body: `{ blobUrl, caption? }`.                                  |
| `DELETE` | `/api/gallery/[id]`          | Admin  | Delete the DB row, then best-effort delete the underlying Blob object.                                                                                  |
| `GET`    | `/api/gallery/[id]/image`    | Public | Streams the actual image bytes, resolved server-side from the DB row. This is what makes a Private-store blob effectively public — see "Storage" below. |
| `POST`   | `/api/admin/uploads/gallery` | Admin  | Issues a short-lived, scoped presigned Blob upload token (the `handleUploadPresigned` callback route).                                                  |

Business logic lives in `api/_lib/gallery.ts` (`createGalleryImage`,
`listGalleryImages`, `getGalleryImageById`, `deleteGalleryImage`,
`toPublicGalleryImage`), matching the existing `api/_lib/donations.ts`
convention.

## Storage approach

**The project's one Vercel Blob store is fixed at Private** (access mode is
set at store creation — see `CLAUDE.md`'s Decision Log). Gallery images
live in that same store — **no second Blob store or new environment
variable was introduced.** Instead, `GET /api/gallery/[id]/image` makes an
otherwise-private object effectively public: it resolves the blob URL from
its own database row (never from client input), fetches it server-side via
`get(url, { access: 'private' })`, and streams the bytes through — the
browser only ever receives image bytes, never a Blob URL or the OIDC
credential that authorizes reading one. This is the exact same
private-blob-through-a-route pattern already used for admin-only donation
screenshots (`api/admin/donations/[id]/screenshot.ts`), just without the
admin gate, since gallery images are meant to be public.

`Cache-Control: public, max-age=86400` (one day) on that route — long enough
to meaningfully cut repeat function invocations for a popular image, short
enough that a delete becomes invisible within, at most, a day. (Deliberately
not a year/`immutable`: that would let a deleted image linger in caches far
longer than reasonable for a small site's moderation needs.)

Uploads use the same **Vercel Signed URLs flow** as donation screenshots
(`issueSignedToken` + `handleUploadPresigned`, no `BLOB_READ_WRITE_TOKEN`) —
see `api/admin/uploads/gallery.ts`. The only difference from the donation
upload route: this one calls `requireAdmin` _before_ issuing any token, so
an unauthenticated caller can never obtain one.

Image-signature verification (`api/_lib/magicBytes.ts`'s
`verifyBlobIsRealImage`) and best-effort blob cleanup
(`api/_lib/blobCleanup.ts`'s `safeDeleteBlob`) were **extracted from
`donations.ts`** into shared modules during this phase, since gallery
uploads need the exact same checks — `donations.ts` now imports them
instead of duplicating the logic. This was a pure refactor (verified by
typecheck and the pre-existing donation tests' logic being unchanged); see
"Known limitations" for what wasn't re-run.

## Authentication / authorization

No new auth mechanism — every admin-only gallery route calls the existing
`requireAdmin()` (session-cookie-backed, DB-verified), exactly like every
other admin route. No Blob write or delete credential is ever sent to the
browser; every privileged storage operation (`issueSignedToken`, `get`,
`del`) happens server-side only. Verified directly: grepped the built
client bundle for `BLOB_READ_WRITE_TOKEN`, `VERCEL_OIDC_TOKEN`,
`BLOB_STORE_ID`, `DATABASE_URL`, `ADMIN_PASSWORD`, `admin_session`,
`password_hash`, `token_hash` — the three Blob-related names appear only as
inert string literals inside `@vercel/blob/client`'s own bundled SDK code
(error messages / `process.env` lookups that always resolve to `undefined`
in a browser), never as an actual credential value. The other five terms
don't appear at all.

## Upload validation rules

`shared/galleryLimits.ts` (new, mirrors `shared/screenshotLimits.ts`):

- **Formats:** PNG, JPEG, WEBP (`ALLOWED_GALLERY_IMAGE_TYPES`) — same set as
  donation screenshots.
- **Max size:** 5MB (`MAX_GALLERY_IMAGE_BYTES`) — smaller than donations'
  8MB, since gallery photos are for on-page display, not proof-of-payment
  fidelity.
- **Max caption length:** 200 characters.
- **Filename handling:** the admin's original filename is never used as the
  storage path — a random `gallery/${crypto.randomUUID()}.<ext>` pathname is
  generated client-side (mirrors `donationService.ts`), plus
  `addRandomSuffix: true` on the presigned token (defense in depth).
- **Server-side enforcement:** the presigned token itself constrains
  `allowedContentTypes`/`maximumSizeInBytes`, and after upload,
  `verifyBlobIsRealImage` sniffs the actual leading bytes against known
  PNG/JPEG/WEBP signatures — a file renamed to end in `.png` is rejected
  (and its orphaned blob cleaned up) unless it actually is one. The
  declared `Content-Type` is never trusted alone.
- **Deletion:** the DB row is deleted first (the real source of truth for
  "is this still in the gallery"), then the underlying blob is best-effort
  deleted — an orphaned blob afterward is an accepted minor cost, same
  philosophy as `donations.ts`'s existing cleanup path.

## Placeholder-image approach

**None shipped.** Per the approved brief, the Gallery ships with zero seed/
placeholder image records — the empty state ("Photos from our journey are
on their way. Check back soon.") is the real, intentional first-run
experience, not a stand-in for missing seed data. There is no seed script
and nothing to "remove before production" — real photos only ever enter the
gallery through the admin upload flow itself.

## Deployment requirements

- **Run the migration** (`npm run db:migrate`, or apply
  `db/migrations/0001_regular_hydra.sql` directly) against the production
  database before this feature goes live — additive only (`CREATE TABLE`),
  no existing data affected.
- **No new environment variables.** Gallery reuses the exact same
  `DATABASE_URL` and OIDC Blob credentials (`VERCEL_OIDC_TOKEN` +
  `BLOB_STORE_ID`) every other feature already depends on.
- `.env.example`'s `BLOB_READ_WRITE_TOKEN` comment was corrected in this
  phase — it previously read as if that token were still required, which
  hasn't been true since the OIDC migration (see `CLAUDE.md`'s Decision
  Log); it's not used by the donation upload route, the admin screenshot
  route, or this new gallery code.

## Tests added

All in `api/_lib/` (this project's established location for every
`*.integration.test.ts` file, regardless of what it tests — see
`adminScreenshotRoute.integration.test.ts`'s own comment on why):

- **`gallery.integration.test.ts`** — `createGalleryImage` (real image
  accepted; non-image rejected + blob cleaned up; blank caption stored as
  `null`), `listGalleryImages` (newest-first ordering, empty case),
  `getGalleryImageById`, `deleteGalleryImage` (row + blob removed, missing
  id returns null, row still removed if blob cleanup itself fails),
  `toPublicGalleryImage` (never exposes `blobUrl`).
- **`galleryRoutes.integration.test.ts`** — `GET/POST /api/gallery` (public
  list; unauthenticated create rejected with 401 and zero Blob/DB side
  effects; authenticated create accepted; invalid-image rejected;
  non-Blob-URL rejected), `DELETE /api/gallery/[id]` (unauthenticated
  rejected, authenticated succeeds, 404 for a nonexistent id),
  `POST /api/admin/uploads/gallery` (unauthenticated rejected _before_
  `issueSignedToken`/`handleUploadPresigned` are ever called; authenticated
  proceeds).
- **`galleryImageRoute.integration.test.ts`** — `GET /api/gallery/[id]/image`
  (serves with no auth required; 404 for a nonexistent id with zero Blob
  calls; ignores any client-supplied path/URL query params and only ever
  fetches the requested image's own blob).

**25/25 passing against a real Postgres** (confirmed via `.env.local`'s
`DATABASE_URL`). Deliberately **not** run via the blanket `npm run
test:integration` script and deliberately **not** using the existing
`resetDatabase()` helper — that truncates `donations`/`admin_users`/
`admin_sessions`/`rate_limits`, which could wipe a developer's real seeded
admin account. A new `resetGalleryImages()` helper
(`db/testUtils.ts`) truncates only `gallery_images`; any admin/session rows
these tests create for auth testing are deleted by id in `afterEach`,
never truncated in bulk.

## Known limitations

- **The pre-existing `donations.integration.test.ts` / `auth.integration.test.ts`
  / `adminScreenshotRoute.integration.test.ts` / `donationsAdmin.integration.test.ts`
  were not re-run in this phase**, since doing so requires `resetDatabase()`,
  which truncates shared tables that may hold a developer's real seeded
  data. The `donations.ts` refactor (extracting `verifyBlobIsRealImage`/
  `safeDeleteBlob`) is a pure, mechanical extraction — the moved code is
  unchanged — verified by a clean typecheck, but not re-verified by
  re-running those specific tests. Run `npm run test:integration` yourself
  for full confidence (it will truncate `donations`/`admin_users`/
  `rate_limits`; re-seed via `npm run db:seed-admin` afterward if needed).
- **No full live-network end-to-end test** (a real browser session logging
  in, uploading a real file through a running server, and seeing it appear)
  was completed in this environment — `vite dev` doesn't execute `/api/*`
  (a pre-existing, already-documented limitation — see
  `Docs/PROJECT_CONTEXT.md`), and `vercel dev` hit an unrelated Windows/CLI
  tooling issue (a spurious `yarn` invocation) that wasn't resolved given
  time constraints. Backend correctness is instead verified by the 25
  integration tests above, run directly against a real Postgres with
  realistic mocked Blob responses.
