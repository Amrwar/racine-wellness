import { test } from "node:test";
import assert from "node:assert/strict";
import { categoriesOf, categoryKey, filterPosts, relatedPosts, searchText } from "../src/lib/blog-search.ts";

import { seedPosts } from "../src/lib/blog.ts";

const items = (locale: "en" | "fr") => seedPosts.map((p) => ({ slug: p.slug, key: categoryKey(p), text: searchText(p, locale) }));
const slugs = (list: { slug: string }[]) => list.map((p) => p.slug);

test("every original article is kept", () => {
  assert.equal(seedPosts.length, 8);
});

test("categories come from the articles, in the preferred order", () => {
  assert.deepEqual(
    categoriesOf(seedPosts, "en").map((c) => c.label),
    ["Massage therapy", "Recovery", "Mobility", "Posture", "Active aging", "Getting started"],
  );
  assert.equal(categoriesOf(seedPosts, "fr")[0].label, "Massothérapie");
});

test("category filter", () => {
  assert.deepEqual(slugs(filterPosts(items("en"), "", "posture")), ["posture-and-desk-work"]);
  assert.equal(filterPosts(items("en"), "", "massage-therapy").length, 2);
  assert.equal(filterPosts(items("en"), "", "all").length, 8);
});

test("search looks at titles, excerpts and article text, ignoring accents", () => {
  assert.ok(slugs(filterPosts(items("en"), "swedish", "all")).includes("deep-tissue-vs-swedish-massage"));
  assert.ok(filterPosts(items("en"), "walk faster", "all").length >= 1, "body text is searchable");
  assert.ok(filterPosts(items("fr"), "epaule", "all").length >= 1, "French without accents finds épaule");
});

test("search and category combine", () => {
  assert.deepEqual(slugs(filterPosts(items("en"), "swedish", "massage-therapy")), ["deep-tissue-vs-swedish-massage"]);
  assert.equal(filterPosts(items("en"), "swedish", "posture").length, 0);
});

test("related articles: three, same category first, never the current one", () => {
  const current = seedPosts.find((p) => p.slug === "myofascial-release-explained")!;
  const related = relatedPosts(seedPosts, current);
  assert.equal(related.length, 3);
  assert.equal(related[0].slug, "deep-tissue-vs-swedish-massage");
  assert.ok(!related.some((p) => p.slug === current.slug));
  assert.equal(new Set(related.map((p) => p.slug)).size, 3);
});
