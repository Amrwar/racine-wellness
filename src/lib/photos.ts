import { del, list } from "@vercel/blob";
import { db } from "./db";

export type LibraryPhoto = { url: string; pathname: string; size: number; uploadedAt: string; inUse: boolean };

/** Every URL mentioned in the website settings (including unsaved drafts) and blog articles. */
async function usedUrls() {
  const sql = await db();
  const [settings, posts] = await Promise.all([sql`SELECT value::text AS v FROM settings`, sql`SELECT data::text AS v FROM posts`]);
  return [...settings, ...posts].map((r) => r.v as string).join("\n");
}

/** All photos uploaded from the admin, newest first, marked in use or not. */
export async function getLibrary(): Promise<LibraryPhoto[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  const blobs = [];
  let cursor: string | undefined;
  do {
    const page = await list({ cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  const used = await usedUrls();
  return blobs
    .map((b) => ({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: new Date(b.uploadedAt).toISOString(), inUse: used.includes(b.url) }))
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

/** Deletes a photo, but only if nothing uses it (checked again right before deleting). */
export async function deleteUnused(url: string) {
  if (!/^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i.test(url)) return false;
  if ((await usedUrls()).includes(url)) return false;
  await del(url);
  return true;
}
