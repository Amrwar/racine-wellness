"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { filterPosts } from "@/lib/blog-search";
import { cn } from "@/lib/utils";
import { ArticleCard, type ArticleCardData } from "./ArticleCard";
import { buttonVariants } from "./ui/button";
import { Input } from "./ui/input";

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
        <div className="relative w-full lg:max-w-md">
          <label htmlFor="blog-search" className="sr-only">
            {t.searchLabel}
          </label>
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="blog-search"
            type="search"
            value={query}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQ("")}
            placeholder={t.search}
            className="h-10 rounded-lg bg-background pl-10 pr-10 shadow-xs [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label={t.clear}
              className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          )}
        </div>
        <span aria-hidden className="hidden h-8 w-px bg-border lg:block" />
        <div role="group" aria-label={t.all} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {[{ key: "all", label: t.all }, ...categories].map((c) => {
            const on = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={on}
                onClick={() => setC(c.key)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium shadow-xs transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  on ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <p role="status" className="mt-5 text-sm text-muted-foreground">
        {count}
      </p>

      {shown.length > 0 ? (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((i) => (
            <li key={i.card.slug}>
              <ArticleCard a={i.card} readMore={t.readMore} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed bg-card p-10 text-center">
          <p className="text-muted-foreground">{t.noResults}</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              sync("", "all");
            }}
            className={cn(buttonVariants({ variant: "outline" }), "mt-4 h-9 rounded-[var(--btn-radius,0.625rem)] px-4")}
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
    <ul className="mt-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <li key={i.card.slug}>
          <ArticleCard a={i.card} readMore={readMore} />
        </li>
      ))}
    </ul>
  );
}
