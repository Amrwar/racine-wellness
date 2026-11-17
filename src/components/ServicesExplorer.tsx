"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Dumbbell, Footprints, Hand, Leaf, Search, Sparkles } from "lucide-react";
import type { ServiceItem } from "@/lib/content-data";
import type { Locale } from "@/i18n/config";
import { ServiceIconView } from "./icons";

export type ServicesLabels = {
  search: string;
  all: string;
  categories: { massage: string; movement: string; strength: string; aging: string };
  noMatch: string;
  learnMore: string;
  showLess: string;
  book: string;
};

type Category = keyof ServicesLabels["categories"];

/** Each built-in service icon belongs to one category; other icons only appear under "All". */
const categoryOf: Partial<Record<string, Category>> = {
  hands: "massage",
  posture: "movement",
  mobility: "movement",
  strength: "strength",
  youth: "strength",
  heart: "aging",
};
const chipIcons: Record<Category, typeof Hand> = { massage: Hand, movement: Footprints, strength: Dumbbell, aging: Leaf };

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Home-page services: search, category chips and horizontal cards. */
export function ServicesExplorer({ items, locale, bookHref, columns = 3, t }: { items: ServiceItem[]; locale: Locale; bookHref: string; columns?: 2 | 3; t: ServicesLabels }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [open, setOpen] = useState<number | null>(null);

  const present = (Object.keys(t.categories) as Category[]).filter((c) => items.some((s) => categoryOf[s.icon] === c));
  const words = fold(query).split(/\s+/).filter(Boolean);
  const visible = items
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => category === "all" || categoryOf[s.icon] === category)
    .filter(({ s }) => words.every((w) => fold(`${s.title[locale]} ${s.text[locale]}`).includes(w)));

  return (
    <div>
      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center">
        <label className="relative block w-full lg:max-w-md">
          <span className="sr-only">{t.search}</span>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            className="w-full rounded-full border border-navy/15 bg-white py-3 pl-12 pr-4 text-ink shadow-sm placeholder:text-muted/70 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
          />
        </label>
        {present.length > 1 && (
          <>
            <span aria-hidden className="hidden h-8 w-px bg-navy/15 lg:block" />
            <div role="group" aria-label={t.all} className="flex flex-wrap gap-2">
              {(["all", ...present] as const).map((c) => {
                const Icon = c === "all" ? Sparkles : chipIcons[c];
                const on = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setCategory(c)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 ${
                      on ? "bg-navy text-white shadow-md" : "bg-white text-navy ring-1 ring-navy/10 hover:ring-blue"
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

      <ul className={`mt-10 grid gap-6 md:grid-cols-2 ${columns === 3 ? "xl:grid-cols-3" : ""}`}>
        {visible.map(({ s, i }) => {
          const cat = categoryOf[s.icon];
          const expanded = open === i;
          return (
            <li key={i} className="group flex overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-navy/10 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-navy/10">
              <div className="relative w-[38%] shrink-0 overflow-hidden bg-navy">
                {s.photo ? (
                  <Image src={s.photo.src} alt="" fill sizes="(min-width: 1280px) 180px, (min-width: 768px) 25vw, 38vw" className="object-cover transition duration-500 group-hover:scale-105" />
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
                <h3 data-edit={`services.items.${i}.title`} className="text-lg font-semibold leading-snug text-navy">
                  {s.title[locale]}
                </h3>
                <p data-edit={`services.items.${i}.text`} className={`mt-1.5 text-sm leading-relaxed text-muted ${expanded ? "" : "line-clamp-3"}`}>
                  {s.text[locale]}
                </p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpen(expanded ? null : i)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-blue-dark"
                  >
                    {expanded ? t.showLess : t.learnMore}
                    <ArrowRight aria-hidden className={`h-4 w-4 transition-transform ${expanded ? "-rotate-90" : ""}`} />
                  </button>
                  <Link
                    href={bookHref}
                    className="rounded-[var(--btn-radius,9999px)] bg-blue-dark px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
                  >
                    {t.book}
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
        {visible.length === 0 && <li className="col-span-full rounded-2xl bg-white p-8 text-center text-muted ring-1 ring-navy/10">{t.noMatch}</li>}
      </ul>
    </div>
  );
}
