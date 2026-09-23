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
 */
export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.integration.test.ts'],
  },
})
