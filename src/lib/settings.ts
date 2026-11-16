import { draftMode } from "next/headers";
import { db, hasDatabase } from "./db";

/** Settings that can be previewed before saving (Admin → Preview). Drafts live in "<key>_draft". */
export const previewableKeys = ["content", "text", "design"] as const;
export type PreviewableKey = (typeof previewableKeys)[number];

async function previewing() {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    // Outside a request (e.g. at build time) there is no preview.
    return false;
  }
}

/**
 * Reads one JSON value from the settings table (null when missing or no database).
 * With preview on (only in Ziad's browser), an unsaved draft is returned instead when there is one.
 */
export async function readSetting<T>(key: string): Promise<T | null> {
  if (!hasDatabase()) return null;
  const sql = await db();
  if ((previewableKeys as readonly string[]).includes(key) && (await previewing())) {
    const [draft] = await sql`SELECT value FROM settings WHERE key = ${`${key}_draft`}`;
    if (draft) return draft.value as T;
  }
  const [row] = await sql`SELECT value FROM settings WHERE key = ${key}`;
  return (row?.value as T) ?? null;
}

/** Settings whose earlier versions are kept so they can be restored (never passwords or tokens). */
export const historyKeys = ["content", "text", "design", "pricing", "business", "availability"] as const;

/** Saves a value; for historyKeys the previous version goes into the change history. */
export async function writeSetting(key: string, value: unknown) {
  const sql = await db();
  const [previous] = (historyKeys as readonly string[]).includes(key) ? await sql`SELECT value FROM settings WHERE key = ${key}` : [];
  if (previous && JSON.stringify(previous.value) !== JSON.stringify(value)) {
    await sql`INSERT INTO settings_history (key, value) VALUES (${key}, ${JSON.stringify(previous.value)}::jsonb)`;
    // Keep the 40 most recent versions per setting.
    await sql`DELETE FROM settings_history WHERE key = ${key} AND id NOT IN (
      SELECT id FROM settings_history WHERE key = ${key} ORDER BY saved_at DESC LIMIT 40)`;
  }
  await sql`INSERT INTO settings (key, value, updated_at) VALUES (${key}, ${JSON.stringify(value)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
  // Saving publishes: any preview draft for this setting is now out of date.
  await sql`DELETE FROM settings WHERE key = ${`${key}_draft`}`;
}

/** Stores an unsaved version for preview only. */
export async function writeDraft(key: PreviewableKey, value: unknown) {
  const sql = await db();
  await sql`INSERT INTO settings (key, value, updated_at) VALUES (${`${key}_draft`}, ${JSON.stringify(value)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
}

export async function discardDrafts() {
  const sql = await db();
  await sql`DELETE FROM settings WHERE key IN ('content_draft', 'text_draft', 'design_draft')`;
}

/** Starts an editor fresh: its preview shows the published version until something changes. */
export async function discardDraft(key: PreviewableKey) {
  const sql = await db();
  await sql`DELETE FROM settings WHERE key = ${`${key}_draft`}`;
}
