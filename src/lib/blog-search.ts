/** Blog search, categories and related articles. Pure functions (type-only imports) so tests can run them. */
import type { Block, Post } from "./blog";

type Lang = "en" | "fr";

export const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/** Stable key for a category, taken from the English name: "Massage therapy" → "massage-therapy". */
export const categoryKey = (post: Post) =>
  fold(post.en.category)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const blockText = (b: Block) => (b.type === "list" ? b.items.join(" ") : b.type === "image" ? `${b.alt} ${b.caption ?? ""}` : b.text);

/** Everything a search looks at for one article: title, excerpt, category and the article text. */
export function searchText(post: Post, locale: Lang) {
  const c = post[locale];
  return fold([c.title, c.excerpt, c.category, ...c.body.map(blockText)].join(" "));
}

/** Preferred order of the filter chips; categories not listed come after, alphabetically. */
const order = ["massage-therapy", "recovery", "mobility", "posture", "active-aging", "getting-started"];

/** The categories present in these articles, with their label in the given language. */
export function categoriesOf(posts: Post[], locale: Lang): { key: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const p of posts) if (!seen.has(categoryKey(p))) seen.set(categoryKey(p), p[locale].category);
  const rank = (k: string) => (order.includes(k) ? order.indexOf(k) : order.length);
  return [...seen.entries()]
    .sort(([a, la], [b, lb]) => rank(a) - rank(b) || la.localeCompare(lb))
    .map(([key, label]) => ({ key, label }));
}

/** Articles matching every word of the query and the category ("all" or empty = any). */
export function filterPosts<T extends { key: string; text: string }>(items: T[], query: string, category: string): T[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  return items.filter((i) => (!category || category === "all" || i.key === category) && words.every((w) => i.text.includes(w)));
}

/** Up to `count` other articles: same category first, then the most recent. Never the current one, never twice. */
export function relatedPosts(posts: Post[], current: Post, count = 3): Post[] {
  const others = posts.filter((p) => p.slug !== current.slug);
  const same = others.filter((p) => categoryKey(p) === categoryKey(current));
  const rest = others.filter((p) => categoryKey(p) !== categoryKey(current));
  const byDate = (a: Post, b: Post) => b.date.localeCompare(a.date);
  return [...same.sort(byDate), ...rest.sort(byDate)].slice(0, count);
}
