import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, CalendarCheck, ChevronDown, ClipboardList, House, MapPin as MapPinIcon, Receipt as ReceiptIcon, Sparkles, Stethoscope, UserRound } from "lucide-react";
import { isLocale, localePath } from "@/i18n/config";
import { getContent, getText } from "@/lib/content";
import { getBusiness } from "@/lib/business";
import { getPricing } from "@/lib/pricing";
import { phoneHref } from "@/lib/business-data";
import { formatPrice } from "@/lib/pricing-data";
import { site } from "@/lib/site";
import { Button, Check, Container } from "@/components/ui";
import { PricingPicker } from "@/components/PricingPicker";
import { Phone, ServiceIconView } from "@/components/icons";
import { alternatesFor } from "../layout";

export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = (await getText(locale)).pricingPage;
  return { title: t.metaTitle, description: t.metaDescription, alternates: alternatesFor("/pricing") };
}

const highlightIcons = [ReceiptIcon, MapPinIcon, House, Sparkles];
const stepIcons = [ClipboardList, CalendarCheck, UserRound, BadgeCheck];

export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [t, content, business, pricing] = await Promise.all([getText(locale), getContent(), getBusiness(), getPricing()]);
  const p = t.pricingPage;
  const book = localePath(locale, "/book");
  const durations = [...new Set(pricing.services.flatMap((s) => s.rates.map((r) => r.minutes)))].sort((a, b) => a - b);

  return (
    <>
      {/* ---------- Header & highlights ---------- */}
      <section className="relative isolate overflow-hidden bg-surface pb-16 pt-14 sm:pt-20">
        <Glow className="-right-24 -top-32 h-[34rem] w-[34rem] bg-blue/10" />
        <Glow className="-left-24 bottom-0 h-[26rem] w-[26rem] bg-green/10" />
        <Container>
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-navy shadow-sm ring-1 ring-navy/10">
              <span aria-hidden className="h-2 w-2 rounded-full bg-green" />
              {p.eyebrow}
            </span>
            <h1 className="mb-6 text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-navy sm:text-6xl">{p.title}</h1>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted">{p.lead}</p>
            <ul className="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
              {p.highlights.map((h, i) => {
                const Icon = highlightIcons[i % highlightIcons.length];
                return (
                  <li key={h} className="flex items-center justify-center gap-2 rounded-xl bg-white/80 p-3.5 text-sm font-semibold text-navy shadow-sm ring-1 ring-navy/5 backdrop-blur">
                    <Icon aria-hidden className="h-4 w-4 shrink-0 text-blue-dark" />
                    {h}
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </section>

      {/* ---------- Rates ---------- */}
      <section className="bg-surface pb-20">
        <Container>
          {pricing.promo.enabled && pricing.promo[locale] && (
            <p className="mx-auto mb-10 flex w-fit items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white">
              <span aria-hidden className="h-2 w-2 rounded-full bg-green" />
              {pricing.promo[locale]}
            </p>
          )}
          <PricingPicker
            services={pricing.services}
            locale={locale}
            bookHref={book}
            t={{ choose: p.choose, perSession: p.perSession, select: p.select, duration: t.pricing.duration, included: p.included }}
          />
          {pricing.homeVisits[locale] && (
            <p className="mx-auto mt-10 flex max-w-3xl items-start justify-center gap-3 text-center text-lg font-medium text-ink">
              <MapPinIcon aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-blue-dark" />
              {pricing.homeVisits[locale]}
            </p>
          )}
        </Container>
      </section>

      {/* ---------- Services ---------- */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <DotEyebrow>{t.services.eyebrow}</DotEyebrow>
              <h2 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t.services.title}</h2>
            </div>
            <p className="max-w-md text-lg leading-relaxed text-muted">{t.services.lead}</p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.services.items.map((s, i) => (
              <li key={i} className="flex gap-5 rounded-2xl border border-navy/10 bg-surface p-6 transition hover:bg-white hover:shadow-lg">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy text-green">
                  <ServiceIconView icon={s.icon} image={s.image} className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-semibold text-navy">{s.title[locale]}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text[locale]}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---------- All rates table ---------- */}
      <section className="bg-surface py-16">
        <Container>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 sm:p-10 lg:p-12">
            <CenterHeader eyebrow={p.compareEyebrow} title={p.compareTitle} lead={p.compareLead} />
            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[32rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-navy/10 text-xs font-bold uppercase tracking-wider text-muted">
                    <th scope="col" className="px-4 py-4">{p.treatment}</th>
                    {durations.map((m) => (
                      <th key={m} scope="col" className="px-4 py-4 text-right">
                        {t.pricing.duration.replace("{n}", String(m))}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {pricing.services.map((s) => (
                    <tr key={s.id}>
                      <th scope="row" className="px-4 py-5 font-semibold text-navy">{s.title[locale]}</th>
                      {durations.map((m) => {
                        const rate = s.rates.find((r) => r.minutes === m);
                        return (
                          <td key={m} className="px-4 py-5 text-right text-xl font-bold text-navy">
                            {rate ? formatPrice(rate.price, locale) : <span className="text-base font-normal text-muted">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------- How booking works ---------- */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <CenterHeader eyebrow={p.stepsEyebrow} title={p.stepsTitle} lead={p.stepsLead} />
          <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {p.steps.map((s, i) => {
              const Icon = stepIcons[i % stepIcons.length];
              return (
                <li key={i} className="flex flex-col rounded-2xl border border-navy/10 bg-surface p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-4xl font-bold text-blue">{String(i + 1).padStart(2, "0")}</span>
                    <Icon aria-hidden className="h-6 w-6 text-navy" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-navy">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{s.text}</p>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* ---------- Insurance receipts ---------- */}
      <section className="bg-surface py-20 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <DotEyebrow>{p.insuranceEyebrow}</DotEyebrow>
            <h2 className="mb-5 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{p.insuranceTitle}</h2>
            <p className="text-lg leading-relaxed text-muted">{p.insuranceText}</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-navy p-8 text-white shadow-2xl shadow-navy/25 sm:p-10">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-green/15 blur-2xl" />
            <div className="relative">
              <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-6">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-green text-navy">
                  <Stethoscope aria-hidden className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-semibold">{site.owner}</p>
                  <p className="text-sm text-white/70">{t.credentialsLine}</p>
                </div>
              </div>
              <ul className="space-y-4">
                {t.about.credentials.map((c) => (
                  <li key={c} className="flex items-start gap-3 font-medium">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-green">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------- FAQ (only when Ziad has added questions) ---------- */}
      {content.faq.items.length > 0 && (
        <section className="bg-white py-20 sm:py-24">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-12 text-center text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{content.faq.title[locale]}</h2>
              <div className="space-y-4">
                {content.faq.items.map((f, i) => (
                  <details key={i} className="group rounded-2xl border border-navy/10 bg-white p-6 shadow-sm [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-navy">
                      {f.q[locale]}
                      <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-blue-dark transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-4 whitespace-pre-line leading-relaxed text-muted">{f.a[locale]}</p>
                  </details>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ---------- Final call to action ---------- */}
      <section className="bg-white pb-24 pt-4">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-navy p-10 text-center text-white shadow-2xl shadow-navy/30 sm:p-14 lg:p-20">
            <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-green/15 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-blue/20 blur-3xl" />
            <div className="relative mx-auto flex max-w-3xl flex-col items-center">
              <h2 className="mb-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{p.ctaTitle}</h2>
              <p className="mb-10 max-w-2xl text-lg leading-relaxed text-white/80">{p.ctaText}</p>
              <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
                <Button href={book} size="lg" className="w-full sm:w-auto">
                  {t.pricing.book} <ArrowRight aria-hidden className="h-[18px] w-[18px] text-green" />
                </Button>
                <Button href={phoneHref(business.phone)} variant="outline-light" size="lg" className="w-full sm:w-auto">
                  <Phone className="h-5 w-5" /> {business.phone}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function DotEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-dark">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-navy" />
      {children}
    </p>
  );
}

function CenterHeader({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-dark">{eyebrow}</p>
      <h2 className="mb-3 mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{title}</h2>
      <p className="text-lg leading-relaxed text-muted">{lead}</p>
    </div>
  );
}

function Glow({ className }: { className: string }) {
  return <div aria-hidden className={`pointer-events-none absolute -z-10 rounded-full blur-3xl ${className}`} />;
}
