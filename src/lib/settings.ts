import { db, hasDatabase } from "./db";

/** Reads one JSON value from the settings table (null when missing or no database). */
export async function readSetting<T>(key: string): Promise<T | null> {
  if (!hasDatabase()) return null;
  const sql = await db();
  const [row] = await sql`SELECT value FROM settings WHERE key = ${key}`;
  return (row?.value as T) ?? null;
}

export async function writeSetting(key: string, value: unknown) {
  const sql = await db();
  await sql`INSERT INTO settings (key, value, updated_at) VALUES (${key}, ${JSON.stringify(value)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
}
