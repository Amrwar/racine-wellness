"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { formatPrice, rateLabel, type PricedService } from "@/lib/pricing-data";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Labels = { choose: string; perSession: string; perSessionTitle: string; lengthAdapted: string; book: string; select: string; duration: string; included: string[] };

/** Treatment switch with one card per session length, as on the Stitch pricing page. */
export function PricingPicker({ services, locale, bookHref, t }: { services: PricedService[]; locale: Locale; bookHref: string; t: Labels }) {
  const [id, setId] = useState(services[0]?.id ?? "");
  const service = services.find((s) => s.id === id) ?? services[0];
  if (!service) return null;
  const mid = service.rates.length === 3 ? 1 : -1;

  return (
    <div>
      {services.length > 1 && (
        <div className="mb-12 flex flex-col items-center">
          <p className="mb-3 text-sm font-medium text-muted-foreground">{t.choose}</p>
          <div role="tablist" className="inline-flex max-w-full flex-wrap justify-center gap-1 rounded-xl border bg-muted p-1">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={s.id === service.id}
                onClick={() => setId(s.id)}
                className={cn(
                  "h-9 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  s.id === service.id ? "bg-background text-foreground shadow-xs ring-1 ring-border" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.title[locale]}
              </button>
            ))}
          </div>
          <p className="mt-4 max-w-2xl text-center text-muted-foreground">{service.text[locale]}</p>
        </div>
      )}

      <ul className={`grid items-stretch gap-6 ${service.rates.length >= 3 ? "lg:grid-cols-3" : service.rates.length === 2 ? "mx-auto max-w-4xl md:grid-cols-2" : "mx-auto max-w-md"}`}>
        {service.rates.map((r, i) => {
          const featured = i === mid;
          const duration = rateLabel(service, r, t);
          return (
            <li
              key={`${service.id}-${r.minutes}`}
              className={cn(
                "flex flex-col justify-between rounded-xl border bg-card p-6 shadow-xs sm:p-8",
                featured && "border-primary shadow-sm ring-2 ring-primary/15",
              )}
            >
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-muted-foreground">{service.title[locale]}</span>
                  <Badge variant={featured ? "default" : "outline"} className="shrink-0">
                    {duration}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-foreground tabular-nums sm:text-5xl">{formatPrice(r.price, locale)}</span>
                  <span className="text-sm text-muted-foreground">{t.perSession}</span>
                </div>
                <Separator className="my-6" />
                <ul className="mb-8 space-y-3">
                  {(service.perSession ? [t.lengthAdapted, ...t.included] : t.included).map((line) => (
                    <li key={line} className="flex items-start gap-3 text-sm text-foreground">
                      <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={`${bookHref}?service=${encodeURIComponent(service.id)}&minutes=${r.minutes}`}
                className={cn(
                  buttonVariants({ variant: featured ? "default" : "outline" }),
                  "group h-10 w-full gap-2 rounded-[var(--btn-radius,0.625rem)] px-4 shadow-xs",
                  featured && "hover:bg-primary/90",
                )}
              >
                {service.perSession ? t.book : t.select.replace("{n}", String(r.minutes))}
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
