import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

/** True when a database is connected (DATABASE_URL comes from the Neon integration on Vercel). */
export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function connect() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = neon(url);
  }
  return client;
}

/** Creates the tables on first use, so there is no separate migration step. */
async function ensureSchema(sql: NeonQueryFunction<false, false>) {
  await sql`CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    message TEXT,
    wants_receipt BOOLEAN NOT NULL DEFAULT false,
    locale TEXT NOT NULL DEFAULT 'en',
    status TEXT NOT NULL DEFAULT 'new'
  )`;
  await sql`CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages (created_at DESC)`;
  await sql`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    service_id TEXT NOT NULL,
    service_title TEXT NOT NULL,
    minutes INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    wants_receipt BOOLEAN NOT NULL DEFAULT false,
    locale TEXT NOT NULL DEFAULT 'en',
    status TEXT NOT NULL DEFAULT 'pending'
  )`;
  await sql`CREATE INDEX IF NOT EXISTS bookings_start_at_idx ON bookings (start_at)`;
  await sql`CREATE TABLE IF NOT EXISTS posts (
    slug TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT false,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS client_notes (
    client_key TEXT PRIMARY KEY,
    notes TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminded_at TIMESTAMPTZ`;
  await sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply TEXT`;
  await sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ`;
  await sql`CREATE TABLE IF NOT EXISTS settings_history (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS settings_history_key_idx ON settings_history (key, saved_at DESC)`;
  await sql`CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    ip TEXT NOT NULL,
    at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
}

/** The SQL client, with the schema guaranteed to exist. Use as a tagged template: sql`SELECT ...`. */
export async function db() {
  const sql = connect();
  schemaReady ??= ensureSchema(sql).catch((err) => {
    schemaReady = null;
    throw err;
  });
  await schemaReady;
  return sql;
}
