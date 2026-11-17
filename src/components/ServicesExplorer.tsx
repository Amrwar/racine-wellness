"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Dumbbell, Footprints, Hand, Leaf, Search, Sparkles, Trophy, X } from "lucide-react";
import type { ServiceItem } from "@/lib/content-data";
import type { Locale } from "@/i18n/config";
import { categoryOf, categoryOrder, defaultServicePhoto, filterServices, isBookable, type ServiceCategory } from "@/lib/services";
import { ServiceIconView } from "./icons";

export type ServicesLabels = {
  search: string;
  clear: string;
  all: string;
  categories: Record<ServiceCategory, string>;
  noMatch: string;
  learnMore: string;
  book: string;
  requestInfo: string;
};
export type ServiceLinks = { detail: string[]; book: string; contact: string };

const chipIcons: Record<ServiceCategory, typeof Hand> = { massage: Hand, movement: Footprints, strength: Dumbbell, aging: Leaf, youth: Trophy };

/** One service: photo (or icon panel), category, name, short description, Learn more and the main action. */
export function ServiceCard({ s, index, locale, links, t }: { s: ServiceItem; index: number; locale: Locale; links: ServiceLinks; t: ServicesLabels }) {
  const cat = categoryOf(s);
  const photo = s.photo?.src ?? defaultServicePhoto(s);
  const bookable = isBookable(s);
  return (
    <article className="group relative flex h-full overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-navy/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-navy/10 motion-reduce:hover:translate-y-0">
      <div className="relative w-[38%] shrink-0 overflow-hidden bg-navy">
        {photo ? (
          <Image src={photo} alt="" fill sizes="(min-width: 1280px) 180px, (min-width: 768px) 25vw, 38vw" className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100" />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-navy to-navy-deep text-green">
            <div aria-hidden className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue/25 blur-2xl" />
            <ServiceIconView icon={s.icon} image={s.image} className="relative h-12 w-12" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-blue-dark ring-1 ring-navy/5">
            <ServiceIconView icon={s.icon} image={s.image} className="h-5 w-5" />
          </span>
          {cat && <span className="text-[11px] font-bold uppercase tracking-wider text-muted">{t.categories[cat]}</span>}
        </div>
        <h3 data-edit={`services.items.${index}.title`} className="text-lg font-semibold leading-snug text-navy">
          {s.title[locale]}
        </h3>
        <p data-edit={`services.items.${index}.text`} className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted">
          {s.text[locale]}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <Link href={links.detail[index]} className="group/more inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-blue-dark">
            {t.learnMore}
            <span className="sr-only">: {s.title[locale]}</span>
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover/more:translate-x-0.5" />
          </Link>
          <Link
            href={bookable ? links.book : links.contact}
            className={`rounded-[var(--btn-radius,9999px)] px-4 py-2 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 ${
              bookable ? "bg-blue-dark text-white hover:bg-navy" : "bg-white text-navy ring-1 ring-navy/20 hover:ring-blue-dark"
            }`}
          >
            {bookable ? t.book : t.requestInfo}
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Search box, category pills and the full services grid. */
export function ServicesExplorer({
  items,
  locale,
  links,
  columns = 3,
  t,
}: {
  items: ServiceItem[];
  locale: Locale;
  links: ServiceLinks;
  columns?: 2 | 3;
  t: ServicesLabels;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "all">("all");

  const present = categoryOrder.filter((c) => items.some((s) => categoryOf(s) === c));
  const shownSet = new Set(filterServices(items, query, category, locale, t.categories));
  const visible = items.map((s, i) => ({ s, i })).filter(({ s }) => shownSet.has(s));

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-md">
          <label htmlFor="service-search" className="sr-only">
            {t.search}
          </label>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            id="service-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder={t.search}
            className="w-full rounded-full border border-navy/15 bg-white py-3 pl-12 pr-11 text-ink shadow-sm placeholder:text-muted/70 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t.clear}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          )}
        </div>
        {present.length > 1 && (
          <>
            <span aria-hidden className="hidden h-8 w-px bg-navy/15 lg:block" />
            <div role="group" aria-label={t.all} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              {(["all", ...present] as const).map((c) => {
                const Icon = c === "all" ? Sparkles : chipIcons[c];
                const on = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setCategory(c)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 ${
                      on ? "bg-blue-dark text-white shadow-md shadow-blue/25" : "bg-blue/10 text-navy hover:bg-blue/20"
                    }`}
                  >
                    <Icon aria-hidden className={`h-4 w-4 ${on ? "text-green" : "text-blue-dark"}`} />
                    {c === "all" ? t.all : t.categories[c]}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ul className={`mt-8 grid gap-6 md:grid-cols-2 ${columns === 3 ? "xl:grid-cols-3" : ""}`}>
        {visible.map(({ s, i }) => (
          <li key={i}>
            <ServiceCard s={s} index={i} locale={locale} links={links} t={t} />
          </li>
        ))}
        {visible.length === 0 && (
          <li className="col-span-full rounded-2xl bg-white p-8 text-center ring-1 ring-navy/10">
            <p className="text-muted">{t.noMatch}</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="mt-4 rounded-full bg-blue-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy"
            >
              {t.all}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
