import { defineConfig } from 'vitest/config'

/**
 * Backend integration tests need a real Postgres reachable via DATABASE_URL
 * (a GitHub Actions service container in CI, a Neon dev branch locally) — see
 * db/testUtils.ts and CLAUDE.md's testing-strategy note. Kept as a fully
 * separate config rather than merged with the main one specifically because
 * Vitest/Vite's `mergeConfig` concatenates array options like `exclude`
 * instead of replacing them — an override of `exclude: []` here would not
 * have actually cleared the base config's own exclusion of
 * `*.integration.test.ts`, which is exactly the file this config exists to
 * run. No React/Tailwind plugins are needed: these are plain Node/TS tests,
 * not component tests.
 *
 * `fileParallelism: false` is load-bearing, not a performance tweak: Vitest
 * runs separate test FILES concurrently by default, each in its own worker.
 * `db/testUtils.ts`'s `resetDatabase()` (a `TRUNCATE`) and every test's own
 * inserts all hit the SAME physical Postgres — there is no per-worker schema
 * or transaction isolation between files. With files running concurrently,
 * one file's `beforeEach` truncate (or its inserts) can land mid-flight
 * during another file's test, corrupting its row counts. This is exactly
 * what a real CI run surfaced: `listDonations` pagination/status-filter
 * tests saw roughly double/triple the rows they inserted themselves, and a
 * rate-limit test never reached its threshold because a concurrent
 * truncate reset the counter mid-loop. Tests *within* one file were never
 * the problem — Vitest already runs those sequentially by default; only
 * cross-file concurrency needed disabling.
 *
 * `testTimeout: 20000` raises Vitest's 5000ms default specifically for this
 * config. CI's Postgres is a same-network service container, so the default
 * is plenty there; run locally against a real Neon branch, the rate-limit
 * tests' MAX_DONATIONS_PER_HOUR-iteration loop (each iteration doing several
 * sequential round trips: idempotency check, rate-limit upsert, insert) adds
 * up to more than 5s of real network latency alone, with no slow application
 * code involved — confirmed by timing the same loop against CI's Postgres
 * (well under 5s) versus a remote Neon connection (consistently 6-7s). This
 * is a test-infrastructure timeout, not a production rate-limit change —
 * `MAX_DONATIONS_PER_HOUR` and the rate limiter's own logic are untouched.
 */
export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.integration.test.ts'],
    fileParallelism: false,
    testTimeout: 20000,
  },
})
