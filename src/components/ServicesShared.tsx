import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { localePath, sectionHref, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";
import type { ServiceItem } from "@/lib/content-data";
import { serviceSlugs } from "@/lib/services";
import type { ServiceLinks, ServicesLabels } from "./ServicesExplorer";

export const serviceHref = (locale: Locale, slug: string) => localePath(locale, `/services/${slug}`);

export function serviceLinks(locale: Locale, items: ServiceItem[]): ServiceLinks {
  return {
    detail: serviceSlugs(items).map((slug) => serviceHref(locale, slug)),
    book: localePath(locale, "/book"),
    contact: sectionHref(locale, "contact"),
  };
}

export function serviceLabels(t: Dictionary): ServicesLabels {
  return {
    search: t.services.search,
    clear: t.services.clear,
    all: t.services.all,
    categories: t.services.categories,
    noMatch: t.services.noMatch,
    learnMore: t.services.learnMore,
    book: t.header.book,
    requestInfo: t.services.requestInfo,
  };
}

/** "Not sure which service is right for you?" → the contact form (Ziad answers personally). */
export function ServiceGuide({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy px-6 py-6 text-white shadow-lg sm:px-8">
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-blue/25 blur-2xl" />
      <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-green ring-1 ring-white/15 sm:grid">
            <Leaf aria-hidden className="h-6 w-6" />
          </span>
          <span aria-hidden className="hidden h-12 w-px bg-white/20 md:block" />
          <div>
            <p className="text-xl font-semibold">{t.services.guideTitle}</p>
            <p className="mt-1 text-white/80">{t.services.guideText}</p>
          </div>
        </div>
        <Link
          href={sectionHref(locale, "contact")}
          className="group inline-flex shrink-0 items-center gap-2 rounded-[var(--btn-radius,9999px)] bg-green px-6 py-3 font-semibold text-navy-deep transition hover:-translate-y-0.5 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
        >
          {t.services.guideButton} <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
