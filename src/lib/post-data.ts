/** Validation for articles edited in /admin/blog. Safe to import on the client. */
import type { Block, Photo, Post } from "./blog";

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "Can massage help?" → "can-massage-help" (accents dropped). */
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

/** Site photos, or photos uploaded to Vercel Blob. */
export function isAllowedImage(src: string) {
  return src.startsWith("/images/") || /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i.test(src);
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function photo(v: unknown): Photo | null {
  const o = (v ?? {}) as Record<string, unknown>;
  const src = str(o.src, 500);
  const width = Math.round(Number(o.width));
  const height = Math.round(Number(o.height));
  if (!src || !isAllowedImage(src) || !(width > 0) || !(height > 0)) return null;
  return { src, width, height };
}

function block(v: unknown): Block | null {
  const o = (v ?? {}) as Record<string, unknown>;
  switch (o.type) {
    case "p":
    case "h2":
    case "quote": {
      const text = str(o.text, o.type === "h2" ? 200 : 5000);
      return text ? { type: o.type, text } : null;
    }
    case "list": {
      const items = (Array.isArray(o.items) ? o.items : []).map((x) => str(x, 1000)).filter(Boolean).slice(0, 50);
      return items.length ? { type: "list", items } : null;
    }
    case "image": {
      const p = photo(o.photo);
      if (!p) return null;
      const caption = str(o.caption, 300);
      return { type: "image", photo: p, alt: str(o.alt, 300), ...(caption && { caption }), ...(o.diagram === true && { diagram: true }) };
    }
    default:
      return null;
  }
}

/** Roughly 200 words a minute, from the English text. */
export function readingMinutes(body: Block[]) {
  const words = body
    .map((b) => (b.type === "list" ? b.items.join(" ") : b.type === "image" ? b.caption ?? "" : b.text))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export type PostProblem = string;

/** Validates untrusted input. Returns the clean post, or a list of problems to show the editor. */
export function parsePost(input: unknown): { post: Post } | { problems: PostProblem[] } {
  const o = (input ?? {}) as Record<string, unknown>;
  const problems: string[] = [];
  const slug = str(o.slug, 80);
  if (!SLUG_RE.test(slug) || slug === "new") problems.push("The web address may only use lowercase letters, numbers and dashes.");
  const date = str(o.date, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) problems.push("Choose a publication date.");
  const cover = photo(o.cover);
  if (!cover) problems.push("Choose a cover photo.");

  const lang = (key: "en" | "fr", label: string) => {
    const l = (o[key] ?? {}) as Record<string, unknown>;
    const title = str(l.title, 200);
    const rawBody = Array.isArray(l.body) ? l.body.slice(0, 200) : [];
    const body = rawBody.map(block).filter((b): b is Block => b !== null);
    if (!title) problems.push(`Add the ${label} title.`);
    if (!body.length) problems.push(`Write the ${label} article.`);
    return {
      title,
      excerpt: str(l.excerpt, 400),
      category: str(l.category, 60),
      coverAlt: str(l.coverAlt, 300),
      body,
    };
  };
  const en = lang("en", "English");
  const fr = lang("fr", "French");

  if (problems.length) return { problems };
  return {
    post: {
      slug,
      date,
      readMinutes: readingMinutes(en.body),
      cover: cover!,
      ...(o.coverDiagram === true && { coverDiagram: true }),
      published: o.published === true,
      en,
      fr,
    },
  };
}
