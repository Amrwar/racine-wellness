import { db, hasDatabase } from "./db";
import { seedPosts, type Post } from "./blog";

/**
 * Articles live in the posts table. The first read copies the original articles in, once,
 * so deleting them later in the admin doesn't bring them back.
 */
let seeded: Promise<void> | null = null;

async function ensureSeeded() {
  const sql = await db();
  const [flag] = await sql`SELECT 1 FROM settings WHERE key = 'blog_seeded'`;
  if (flag) return;
  for (const p of seedPosts) {
    await sql`INSERT INTO posts (slug, date, published, data)
      VALUES (${p.slug}, ${p.date}, true, ${JSON.stringify({ ...p, published: true })}::jsonb)
      ON CONFLICT (slug) DO NOTHING`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('blog_seeded', 'true'::jsonb) ON CONFLICT (key) DO NOTHING`;
}

async function ready() {
  seeded ??= ensureSeeded().catch((err) => {
    seeded = null;
    throw err;
  });
  await seeded;
  return db();
}

const sortPosts = (list: Post[]) =>
  [...list].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

const published = () => sortPosts(seedPosts.map((p) => ({ ...p, published: true })));

/** Published articles, newest first. Pass drafts: true in the admin. */
export async function getPosts({ drafts = false } = {}): Promise<Post[]> {
  if (!hasDatabase()) return published();
  try {
    const sql = await ready();
    const rows = drafts
      ? await sql`SELECT data FROM posts ORDER BY date DESC, slug`
      : await sql`SELECT data FROM posts WHERE published ORDER BY date DESC, slug`;
    return rows.map((r) => r.data as Post);
  } catch (err) {
    console.error("[posts] falling back to the built-in articles:", err);
    return published();
  }
}

export async function getPost(slug: string, { drafts = false } = {}): Promise<Post | undefined> {
  if (!hasDatabase()) return published().find((p) => p.slug === slug);
  try {
    const sql = await ready();
    const [row] = drafts
      ? await sql`SELECT data FROM posts WHERE slug = ${slug}`
      : await sql`SELECT data FROM posts WHERE slug = ${slug} AND published`;
    return row?.data as Post | undefined;
  } catch (err) {
    console.error("[posts] falling back to the built-in articles:", err);
    return published().find((p) => p.slug === slug);
  }
}

export async function slugTaken(slug: string) {
  const sql = await ready();
  const [row] = await sql`SELECT 1 FROM posts WHERE slug = ${slug}`;
  return Boolean(row);
}

/** Creates or updates an article. `previousSlug` renames it when the web address changed. */
export async function savePost(post: Post, previousSlug?: string) {
  const sql = await ready();
  const data = JSON.stringify(post);
  if (previousSlug && previousSlug !== post.slug) {
    await sql`UPDATE posts SET slug = ${post.slug}, date = ${post.date}, published = ${post.published === true},
      data = ${data}::jsonb, updated_at = now() WHERE slug = ${previousSlug}`;
    return;
  }
  await sql`INSERT INTO posts (slug, date, published, data, updated_at)
    VALUES (${post.slug}, ${post.date}, ${post.published === true}, ${data}::jsonb, now())
    ON CONFLICT (slug) DO UPDATE SET date = EXCLUDED.date, published = EXCLUDED.published,
      data = EXCLUDED.data, updated_at = now()`;
}

export async function deletePost(slug: string) {
  const sql = await ready();
  await sql`DELETE FROM posts WHERE slug = ${slug}`;
}
