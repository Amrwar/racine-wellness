import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { localePath, sectionHref, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";
import type { ServiceItem } from "@/lib/content-data";
import { serviceSlugs } from "@/lib/services";
import { priceSummary, type Pricing } from "@/lib/pricing-data";
import type { ServiceLinks, ServicesLabels } from "./ServicesExplorer";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

export const serviceHref = (locale: Locale, slug: string) => localePath(locale, `/services/${slug}`);

export function serviceLinks(locale: Locale, items: ServiceItem[], pricing: Pricing, t: Dictionary): ServiceLinks {
  const priced = (s: ServiceItem) => pricing.services.find((p) => p.id === s.bookingId);
  return {
    detail: serviceSlugs(items).map((slug) => serviceHref(locale, slug)),
    action: items.map((s) => (priced(s) ? `${localePath(locale, "/book")}?service=${encodeURIComponent(priced(s)!.id)}` : sectionHref(locale, "contact"))),
    price: items.map((s) => {
      const p = priced(s);
      return p ? priceSummary(p, locale, t.pricing) : "";
    }),
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
    <div className="flex flex-col items-start justify-between gap-5 rounded-xl border bg-card p-5 shadow-xs sm:p-6 md:flex-row md:items-center">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy text-green">
          <Leaf aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold tracking-tight text-foreground">{t.services.guideTitle}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t.services.guideText}</p>
        </div>
      </div>
      <Link href={sectionHref(locale, "contact")} className={cn(buttonVariants({ variant: "outline" }), "group h-10 shrink-0 rounded-[var(--btn-radius,0.625rem)] px-4")}>
        {t.services.guideButton} <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
