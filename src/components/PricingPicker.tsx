"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { formatPrice, rateLabel, type PricedService } from "@/lib/pricing-data";
import type { Locale } from "@/i18n/config";

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
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-dark">{t.choose}</p>
          <div role="tablist" className="inline-flex flex-wrap justify-center gap-1 rounded-[1.75rem] bg-white p-1.5 shadow-inner ring-1 ring-navy/10">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={s.id === service.id}
                onClick={() => setId(s.id)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                  s.id === service.id ? "bg-navy text-white shadow-sm" : "text-muted hover:text-navy"
                }`}
              >
                {s.title[locale]}
              </button>
            ))}
          </div>
          <p className="mt-4 max-w-2xl text-center text-muted">{service.text[locale]}</p>
        </div>
      )}

      <ul className={`grid items-stretch gap-8 ${service.rates.length >= 3 ? "lg:grid-cols-3" : service.rates.length === 2 ? "mx-auto max-w-4xl md:grid-cols-2" : "mx-auto max-w-md"}`}>
        {service.rates.map((r, i) => {
          const featured = i === mid;
          const duration = rateLabel(service, r, t);
          return (
            <li
              key={`${service.id}-${r.minutes}`}
              className={`flex flex-col justify-between rounded-2xl bg-white p-8 transition-all duration-300 ${
                featured ? "shadow-xl ring-2 ring-navy lg:-translate-y-2" : "shadow-sm ring-1 ring-navy/10 hover:shadow-md"
              }`}
            >
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-dark">{service.title[locale]}</span>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${featured ? "bg-green text-navy-deep" : "bg-surface text-navy"}`}>
                    {duration}
                  </span>
                </div>
                <div className="mb-8 flex items-baseline gap-2 rounded-xl bg-surface p-5">
                  <span className="text-5xl font-bold tracking-tight text-navy">{formatPrice(r.price, locale)}</span>
                  <span className="text-sm text-muted">{t.perSession}</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {(service.perSession ? [t.lengthAdapted, ...t.included] : t.included).map((line) => (
                    <li key={line} className="flex items-start gap-3 text-sm text-ink">
                      <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-blue-dark" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={`${bookHref}?service=${encodeURIComponent(service.id)}&minutes=${r.minutes}`}
                className={`group inline-flex w-full items-center justify-center gap-2 rounded-[var(--btn-radius,9999px)] px-6 py-3.5 text-sm font-semibold transition ${
                  featured ? "bg-navy text-white shadow-md hover:bg-navy-deep" : "bg-surface text-navy hover:bg-navy hover:text-white"
                }`}
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
