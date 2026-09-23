import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema.js'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. See .env.example.')
}

// Neon requires TLS; the local GitHub Actions Postgres service container
// used for integration tests does not support it. Branching on the host
// avoids needing a separate env var just to toggle SSL.
const requiresSsl = /neon\.tech/.test(connectionString)

// Cached at module scope (and additionally on `global` so it survives across
// invocations of the same warm Vercel serverless instance) so a request
// doesn't open a fresh Postgres connection every time — see CLAUDE.md's
// database-connection decision log entry.
declare global {
  var __pgPool: Pool | undefined
}

const pool =
  global.__pgPool ??
  new Pool({
    connectionString,
    ssl: requiresSsl ? { rejectUnauthorized: true } : undefined,
    max: 5,
  })

if (process.env.NODE_ENV !== 'production') {
  global.__pgPool = pool
}

export const db = drizzle(pool, { schema })
