"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { filterPosts } from "@/lib/blog-search";
import { ArticleCard, type ArticleCardData } from "./ArticleCard";

export type ExplorerItem = { key: string; text: string; card: ArticleCardData };
type Labels = { search: string; searchLabel: string; clear: string; all: string; results: string; resultsOne: string; noResults: string; showAll: string; readMore: string };

/** Search box, category pills and the article grid. Filters are kept in the address (?q=…&category=…). */
/** `featured` is shown above the grid, so it is left out until the reader searches or filters. */
export function BlogExplorer({ items, featured, categories, t }: { items: ExplorerItem[]; featured?: string; categories: { key: string; label: string }[]; t: Labels }) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(categories.some((c) => c.key === params.get("category")) ? params.get("category")! : "all");

  const sync = (q: string, c: string) => {
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    if (c !== "all") next.set("category", c);
    const qs = next.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  };
  const setQ = (q: string) => {
    setQuery(q);
    sync(q, category);
  };
  const setC = (c: string) => {
    setCategory(c);
    sync(query, c);
  };

  const browsing = !query.trim() && category === "all";
  const shown = filterPosts(items, query, category).filter((i) => !(browsing && i.card.slug === featured));
  const count = shown.length === 1 ? t.resultsOne : t.results.replace("{n}", String(shown.length));

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-sm">
          <label htmlFor="blog-search" className="sr-only">
            {t.searchLabel}
          </label>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQ("")}
            placeholder={t.search}
            className="w-full rounded-full border border-navy/15 bg-white py-3 pl-12 pr-11 text-ink shadow-sm placeholder:text-muted/70 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label={t.clear}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          )}
        </div>
        <span aria-hidden className="hidden h-8 w-px bg-navy/15 lg:block" />
        <div role="group" aria-label={t.all} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {[{ key: "all", label: t.all }, ...categories].map((c) => {
            const on = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={on}
                onClick={() => setC(c.key)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 ${
                  on ? "bg-blue-dark text-white shadow-md shadow-blue/25" : "bg-blue/10 text-navy hover:bg-blue/20"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <p role="status" className="mt-5 text-sm text-muted">
        {count}
      </p>

      {shown.length > 0 ? (
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {shown.map((i) => (
            <li key={i.card.slug}>
              <ArticleCard a={i.card} readMore={t.readMore} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-2xl bg-white p-10 text-center ring-1 ring-navy/10">
          <p className="text-muted">{t.noResults}</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              sync("", "all");
            }}
            className="mt-4 rounded-full bg-blue-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy"
          >
            {t.showAll}
          </button>
        </div>
      )}
    </div>
  );
}

/** Server-rendered grid shown before the search box loads (and to search engines). */
export function StaticGrid({ items, readMore }: { items: ExplorerItem[]; readMore: string }) {
  return (
    <ul className="mt-[5.5rem] grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
      {items.map((i) => (
        <li key={i.card.slug}>
          <ArticleCard a={i.card} readMore={readMore} />
        </li>
      ))}
    </ul>
  );
}
