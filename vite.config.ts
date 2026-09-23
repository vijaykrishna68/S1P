import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
  },
  preview: {
    port: Number(process.env.PORT) || 4173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      // Two separate entry points, two separate bundles — the admin app
      // (src/admin/) is a distinct build output from the public donor-facing
      // one, so a donor's page load never downloads admin code and vice
      // versa. See CLAUDE.md's admin-dashboard note for why this is a Vite
      // multi-page build rather than a route added to the existing SPA.
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin.html'),
      },
    },
  },
  test: {
    // 'node' by default — most tests here are pure logic or backend code
    // with no DOM. Component tests opt into `jsdom` per-file via a
    // `// @vitest-environment jsdom` comment (see ConfirmationStep.test.tsx,
    // useScreenshotUpload.test.ts) rather than paying jsdom's setup cost for
    // every test file, including backend ones that never touch a DOM.
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    // Backend integration tests need a real Postgres (DATABASE_URL) and are
    // deliberately excluded from the default run — see
    // vitest.integration.config.ts and the `test:integration` script, which
    // targets ONLY these files. Running `npm test` locally with no database
    // configured should never fail trying to reach one.
    exclude: [...configDefaults.exclude, '**/*.integration.test.ts'],
  },
})
