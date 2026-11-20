"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, ViewTransition } from "react";
import { ArrowRight, Dumbbell, Footprints, Hand, Leaf, Search, Sparkles, Trophy, X } from "lucide-react";
import type { ServiceItem } from "@/lib/content-data";
import type { Locale } from "@/i18n/config";
import { categoryOf, categoryOrder, filterServices, isBookable, servicePhoto, type ServiceCategory } from "@/lib/services";
import { ServiceIconView } from "./icons";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { buttonVariants } from "./ui/button";
import { Input } from "./ui/input";

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
/** Per service (same order as the items): its page, its main action (booking or contact) and a price summary. */
export type ServiceLinks = { detail: string[]; action: string[]; price: string[] };

const chipIcons: Record<ServiceCategory, typeof Hand> = { massage: Hand, movement: Footprints, strength: Dumbbell, aging: Leaf, youth: Trophy };

/** One service: photo, category, name, short description, Learn more and the main action. */
export function ServiceCard({ s, index, locale, links, t }: { s: ServiceItem; index: number; locale: Locale; links: ServiceLinks; t: ServicesLabels }) {
  const cat = categoryOf(s);
  const bookable = isBookable(s);
  const price = links.price[index];
  const slug = links.detail[index].split("/").pop();
  return (
    <article className="group @container flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5 motion-reduce:hover:translate-y-0">
      <ViewTransition name={`service-photo-${slug}`} share="morph" default="none">
      <div className="relative aspect-[16/10] overflow-hidden border-b bg-muted">
        <Image
          src={servicePhoto(s)}
          alt=""
          fill
          sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 100vw"
          className="object-cover object-[50%_25%] transition duration-500 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
        />
        {price && (
          <Badge variant="secondary" className="absolute bottom-3 left-3 h-6 bg-background/95 px-2.5 font-semibold text-foreground shadow-sm backdrop-blur">
            {price}
          </Badge>
        )}
      </div>
      </ViewTransition>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border bg-muted text-navy">
            <ServiceIconView icon={s.icon} image={s.image} className="h-4 w-4" />
          </span>
          {cat && <Badge variant="outline" className="font-medium text-muted-foreground">{t.categories[cat]}</Badge>}
        </div>
        <h3 data-edit={`services.items.${index}.title`} className="text-lg font-semibold leading-snug tracking-tight text-foreground">
          {s.title[locale]}
        </h3>
        <p data-edit={`services.items.${index}.text`} className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {s.text[locale]}
        </p>
        <div className="mt-auto flex flex-col gap-2 pt-5 @[19rem]:flex-row @[19rem]:items-center">
          <Link href={links.detail[index]} className={cn(buttonVariants({ variant: "outline" }), "h-9 w-full rounded-[var(--btn-radius,0.625rem)] px-3 @[19rem]:w-auto @[19rem]:flex-1")}>
            {t.learnMore}
            <span className="sr-only">: {s.title[locale]}</span>
          </Link>
          <Link
            href={links.action[index]}
            className={cn(buttonVariants({ variant: bookable ? "default" : "secondary" }), "group/b h-9 w-full rounded-[var(--btn-radius,0.625rem)] px-3 @[19rem]:w-auto @[19rem]:flex-1")}
          >
            {bookable ? t.book : t.requestInfo}
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover/b:translate-x-0.5" />
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
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="service-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder={t.search}
            className="h-10 rounded-lg bg-background pl-10 pr-10 shadow-xs [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t.clear}
              className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          )}
        </div>
        {present.length > 1 && (
          <>
            <span aria-hidden className="hidden h-8 w-px bg-border lg:block" />
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
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium shadow-xs transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      on ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon aria-hidden className={cn("h-4 w-4", on ? "text-green" : "text-muted-foreground")} />
                    {c === "all" ? t.all : t.categories[c]}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ul className={`mt-8 grid gap-5 md:grid-cols-2 ${columns === 3 ? "xl:grid-cols-3" : ""}`}>
        {visible.map(({ s, i }) => (
          <li key={i}>
            <ServiceCard s={s} index={i} locale={locale} links={links} t={t} />
          </li>
        ))}
        {visible.length === 0 && (
          <li className="col-span-full rounded-xl border border-dashed bg-card p-10 text-center">
            <p className="text-muted-foreground">{t.noMatch}</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className={cn(buttonVariants({ variant: "outline" }), "mt-4 h-9 px-4")}
            >
              {t.all}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
