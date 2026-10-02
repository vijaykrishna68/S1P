# Sacrifice One Pizza

A single-page charity donation site with a real full-stack architecture:
React/TypeScript frontend, Vercel Serverless Functions backend, Neon
Postgres, and Vercel Blob for private screenshot storage. Built as a
portfolio project to demonstrate production-quality engineering — a
hand-rolled signature animation, an explicit multi-state-machine donation
flow, a real backend with idempotency and rate limiting, and
accessibility/security work verified by testing rather than assumed.

The premise: what you'd spend on one pizza (₹300–₹3000) can instead fund
someone's education, food, or essential needs, paid via UPI.

**Live site:** https://sacrifice-one-pizza.vercel.app

For the full engineering rationale behind every decision below, see
[`Docs/DECISIONS.md`](Docs/DECISIONS.md) and [`Docs/PROJECT_CONTEXT.md`](Docs/PROJECT_CONTEXT.md).
For the day-to-day engineering context this project is developed against,
see [`CLAUDE.md`](CLAUDE.md).

---

## What this is (and isn't)

This is a donation **submission and human-review** system: a donor pays via
their own UPI app, uploads a screenshot as proof, and an authenticated
admin later reviews that screenshot and marks the submission reviewed or
rejected. **It is not a payment processor or payment gateway** — no
transaction is ever initiated or verified automatically by this system; the
uploaded screenshot is the donor's claim, not a verified fact.

## Key Features

- A custom signature hero animation ("The Gathering Point") — SVG + CSS
  keyframes, no animation library, no canvas.
- A 4-step donation flow (amount → payment → confirmation → success), with
  live amount validation, a client-generated UPI QR code, and a real
  screenshot upload pipeline.
- A real backend: server-side validation, idempotency, rate limiting,
  image-signature verification, and private file storage — not a mock.
- An authenticated admin dashboard: submission list with filters/pagination,
  summary tiles, per-submission detail with status transitions.
- Keyboard- and screen-reader-tested UX, including focus management across
  every state change, and full `prefers-reduced-motion` support.
- CI (GitHub Actions) running against a real Postgres service container:
  typecheck, lint, format, migrations, unit tests, integration tests, build.

## Architecture

```
Browser (donor)                      Browser (admin)
      │                                     │
      ▼                                     ▼
 index.html (Vite/React SPA)         admin.html (separate Vite entry)
      │                                     │
      ├─ direct PUT (presigned) ──► Vercel Blob (private store)
      │                                     │
      └────────────► /api/* (Vercel Serverless Functions) ◄───────────┘
                              │
                              ▼
                     Neon Postgres (pg + Drizzle ORM)
```

```
api/                  Vercel Serverless Functions (donations, uploads, admin)
db/                   Drizzle schema, DB client, SQL migrations
shared/                Constants shared by both src/ (browser) and api/ (Node)
src/
  components/          Public site sections + the donation flow's state machines
  admin/                Second Vite entry (admin.html) — dashboard + auth
  styles/               Tailwind entry, design tokens, hero keyframes
```

The donation flow is three small, independently-owned state machines rather
than one large one: `donationReducer` (which of 4 screens is showing),
`confirmationFormReducer` (the confirmation form's fields/validation/
submission status), and `useScreenshotUpload` (the screenshot's own
lifecycle). See `Docs/PROJECT_CONTEXT.md` §3 for why they're split.

The backend sits behind one frontend function, `donationService.submitDonation()`
— its signature never changed between the original mock and the real
Postgres/Blob implementation, so no component above it needed to change
when the backend was built.

## Tech Stack

**Frontend:** Vite, React 19 + TypeScript (strict), Tailwind CSS v4,
`qrcode.react` (real UPI QR encoding), `@phosphor-icons/react`. No
animation library, no state management library, no router, no UI component
library.

**Backend:** Vercel Serverless Functions (`/api`, same repo/deploy as the
frontend), Neon Postgres via `drizzle-orm`/`drizzle-kit` (`pg` driver, not
the HTTP/edge driver), `zod` for server-side validation, `bcryptjs` for
admin password hashing, DB-backed opaque sessions (not JWT), Vercel Blob
(private store, presigned OIDC uploads) for screenshot storage.

**Testing:** Vitest + React Testing Library (frontend unit/component
tests, `node` environment by default); a separate integration test suite
against a real Postgres (`vitest.integration.config.ts`).

See [`Docs/DECISIONS.md`](Docs/DECISIONS.md) for why each of these,
specifically, over the alternatives considered.

## Security Characteristics

- Server-side re-validation of every client-side rule (Zod) — the client's
  own validation is UX only and is never trusted.
- Real image-signature ("magic byte") verification on uploaded screenshots,
  not just the declared `Content-Type`.
- Idempotency-key-based duplicate protection, enforced by a real database
  unique constraint (not just an application-level check).
- Postgres-backed fixed-window rate limiting on both the donation endpoint
  (10/hr per IP) and the admin login endpoint (20/hr per IP, keyed
  separately).
- Admin sessions are opaque, database-backed, and hashed at rest (SHA-256
  of the token — the raw token is never stored); cookies are `httpOnly`,
  `SameSite=Strict`, and `Secure` in production.
- Login is timing-safe against email enumeration.
- Screenshots live in a **private** Vercel Blob store; the raw Blob URL is
  never sent to any browser — admins view screenshots only through an
  authenticated server-side proxy route.
- CSP and standard security headers (`X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`) via `vercel.json`.

This is not a claim of "bank-grade" security or PCI-style compliance — see
`Docs/PROJECT_CONTEXT.md` §6 for exactly what each mechanism does and does
not protect against.

## Testing

```bash
npm test               # frontend unit/component tests (no database needed)
npm run test:integration  # backend integration tests (needs DATABASE_URL)
```

Integration tests run against a real Postgres — a GitHub Actions service
container in CI, or a real Neon branch/local Postgres when run manually.
See `Docs/PROJECT_CONTEXT.md` §8 for current test counts and what each
suite covers.

## Deployment

Deployed on Vercel — auto-detected Vite static build (`dist/`) plus `/api`
serverless functions, connected to this GitHub repository. Vercel's own Git
integration handles preview deployments per pull request and production
deployment on merges to `main`.

```bash
npm run build   # optional — vercel deploy builds it too
npx vercel deploy --prod --project sacrifice-one-pizza
```

CI (`.github/workflows/ci.yml`) runs on every PR and on push to `main`:
typecheck → lint → format check → apply migrations against a real Postgres
service container → unit tests → integration tests → build.

## Local Development

```bash
npm install
npm run dev              # start the Vite dev server (frontend only —
                          # /api/* is not served by `vite dev`)
npm run build             # type-check + production build
npm run preview           # preview the production build locally
npm run lint               # ESLint
npm run format              # Prettier write
npm test                     # frontend unit/component tests
npm run test:integration      # backend integration tests (needs DATABASE_URL)
npm run db:generate            # generate a Drizzle migration from schema.ts
npm run db:migrate              # apply migrations
npm run db:studio                # Drizzle Studio (DB browser)
npm run db:seed-admin             # create/rotate the single admin account
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values. See that file
for full comments; names only, no values, below:

- `VITE_UPI_ID`, `VITE_PHONE_NUMBER` — public donation config (not secrets;
  fall back to obvious placeholders if unset).
- `DATABASE_URL` — Neon Postgres connection string (server-only).
- Vercel Blob credentials for the project's **private** store — provisioned
  automatically via OIDC (`VERCEL_OIDC_TOKEN` + `BLOB_STORE_ID`) once the
  store is connected in the Vercel dashboard; a `BLOB_WEBHOOK_PUBLIC_KEY` is
  also needed (an explicit opt-in from the store's connection menu) for the
  presigned-upload callback verification. `BLOB_READ_WRITE_TOKEN` is **not**
  used by the current upload flow — see `Docs/DECISIONS.md`'s file-storage
  section.
- `NODE_ENV` — set to `production` only in the real deployment (controls
  the `Secure` cookie flag).
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — used only by `npm run db:seed-admin`,
  never read by the running app; never commit real values.

## Project Status

Full-stack build complete through backend, authentication, an admin
dashboard, and a CI pipeline verified against a real Postgres. See
[`Docs/PROJECT_CONTEXT.md`](Docs/PROJECT_CONTEXT.md) §12–13 for exactly
what has and hasn't been verified against the live production database and
Blob store, and for current, genuine known limitations (no payment
verification, no CAPTCHA, placeholder content still in place, etc.).

## Documentation Map

| File | Purpose |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Living engineering/design context, phase-by-phase history, full decision log |
| [`Docs/DECISIONS.md`](Docs/DECISIONS.md) | Standalone architecture/decision record (choice, why, alternatives) |
| [`Docs/PROJECT_CONTEXT.md`](Docs/PROJECT_CONTEXT.md) | Deep technical reference: data flow, security model, endpoints, schema, historical bugs |
| [`Docs/INTERVIEW_PREP.md`](Docs/INTERVIEW_PREP.md) | Interview Q&A grounded in this specific implementation |
| [`Docs/CASE_STUDY.md`](Docs/CASE_STUDY.md) | Portfolio-style narrative case study (frontend-focused; predates the backend) |
| [`Docs/PRD.md`](Docs/PRD.md) / [`Docs/02UI_UX.md`](Docs/02UI_UX.md) | Original product/design spec (partially superseded — see `CLAUDE.md`'s Decision Log) |
