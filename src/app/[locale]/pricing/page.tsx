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
import { Button, Check, Container, Eyebrow } from "@/components/ui/site";
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
  // Table columns: the session lengths of the treatments priced by length (per-session prices span the row).
  const durations = [...new Set(pricing.services.filter((s) => !s.perSession).flatMap((s) => s.rates.map((r) => r.minutes)))].sort((a, b) => a - b);

  return (
    <>
      {/* ---------- Header & highlights ---------- */}
      <section className="relative isolate overflow-hidden border-b bg-background pb-16 pt-14 sm:pt-20">
        <div aria-hidden className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <Container>
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <Eyebrow>{p.eyebrow}</Eyebrow>
            <h1 className="mb-5 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">{p.title}</h1>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">{p.lead}</p>
            <ul className="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
              {p.highlights.map((h, i) => {
                const Icon = highlightIcons[i % highlightIcons.length];
                return (
                  <li key={h} className="flex items-center justify-center gap-2 rounded-xl border bg-card p-3.5 text-sm font-medium text-foreground shadow-xs">
                    <Icon aria-hidden className="h-4 w-4 shrink-0 text-navy" />
                    {h}
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </section>

      {/* ---------- Rates ---------- */}
      <section className="bg-muted/40 py-16 sm:py-20">
        <Container>
          {pricing.promo.enabled && pricing.promo[locale] && (
            <p className="mx-auto mb-10 flex w-fit max-w-full items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm font-medium text-foreground shadow-xs">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-green" />
              {pricing.promo[locale]}
            </p>
          )}
          <PricingPicker
            services={pricing.services}
            locale={locale}
            bookHref={book}
            t={{ choose: p.choose, perSession: p.perSession, perSessionTitle: t.pricing.perSessionTitle, lengthAdapted: t.pricing.lengthAdapted, book: t.pricing.book, select: p.select, duration: t.pricing.duration, included: p.included }}
          />
          {pricing.homeVisits[locale] && (
            <p className="mx-auto mt-10 flex max-w-3xl items-start justify-center gap-3 text-center text-base font-medium text-foreground">
              <MapPinIcon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
              {pricing.homeVisits[locale]}
            </p>
          )}
        </Container>
      </section>

      {/* ---------- Services ---------- */}
      <section className="border-t bg-background py-20 sm:py-24">
        <Container>
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <Eyebrow>{t.services.eyebrow}</Eyebrow>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{t.services.title}</h2>
            </div>
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">{t.services.lead}</p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.services.items.map((s, i) => (
              <li key={i} className="flex gap-4 rounded-xl border bg-card p-6 shadow-xs transition-colors hover:bg-muted/40">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy text-green">
                  <ServiceIconView icon={s.icon} image={s.image} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold tracking-tight text-foreground">{s.title[locale]}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text[locale]}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---------- All rates table ---------- */}
      <section className="border-t bg-muted/40 py-20 sm:py-24">
        <Container>
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
            <CenterHeader eyebrow={p.compareEyebrow} title={p.compareTitle} lead={p.compareLead} />
            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[32rem] border-collapse text-left">
                <thead>
                  <tr className="border-b text-sm font-medium text-muted-foreground">
                    <th scope="col" className="px-4 py-3 font-medium">{p.treatment}</th>
                    {durations.map((m) => (
                      <th key={m} scope="col" className="px-4 py-3 text-right font-medium">
                        {t.pricing.duration.replace("{n}", String(m))}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pricing.services.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-muted/40">
                      <th scope="row" className="px-4 py-4 font-medium text-foreground">{s.title[locale]}</th>
                      {s.perSession ? (
                        <td colSpan={Math.max(durations.length, 1)} className="px-4 py-4 text-right text-lg font-semibold tracking-tight text-foreground tabular-nums">
                          {formatPrice(s.rates[0].price, locale)} <span className="text-sm font-normal tracking-normal text-muted-foreground">{t.pricing.perSession} · {t.pricing.lengthAdapted}</span>
                        </td>
                      ) : durations.map((m) => {
                        const rate = s.rates.find((r) => r.minutes === m);
                        return (
                          <td key={m} className="px-4 py-4 text-right text-lg font-semibold tracking-tight text-foreground tabular-nums">
                            {rate ? formatPrice(rate.price, locale) : <span className="text-sm font-normal text-muted-foreground">—</span>}
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
      <section className="border-t bg-background py-20 sm:py-24">
        <Container>
          <CenterHeader eyebrow={p.stepsEyebrow} title={p.stepsTitle} lead={p.stepsLead} />
          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {p.steps.map((s, i) => {
              const Icon = stepIcons[i % stepIcons.length];
              return (
                <li key={i} className="flex flex-col rounded-xl border bg-card p-6 shadow-xs">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-lg border bg-muted text-navy">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold tracking-tight text-foreground">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* ---------- Insurance receipts ---------- */}
      <section className="border-t bg-muted/40 py-20 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>{p.insuranceEyebrow}</Eyebrow>
            <h2 className="mb-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{p.insuranceTitle}</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">{p.insuranceText}</p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <div>
              <div className="mb-6 flex items-center gap-3 border-b pb-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy text-green">
                  <Stethoscope aria-hidden className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">{site.owner}</p>
                  <p className="text-sm text-muted-foreground">{t.credentialsLine}</p>
                </div>
              </div>
              <ul className="space-y-4">
                {t.about.credentials.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-sm font-medium text-foreground">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border bg-muted text-navy">
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
        <section className="border-t bg-background py-20 sm:py-24">
          <Container>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{content.faq.title[locale]}</h2>
              <div className="space-y-3">
                {content.faq.items.map((f, i) => (
                  <details key={i} className="group rounded-xl border bg-card px-5 py-4 shadow-xs [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                      {f.q[locale]}
                      <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{f.a[locale]}</p>
                  </details>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ---------- Final call to action ---------- */}
      <section className="border-t bg-background py-20 sm:py-24">
        <Container>
          <div className="relative isolate overflow-hidden rounded-2xl border bg-card p-8 text-center shadow-sm sm:p-12 lg:p-16">
            <div aria-hidden className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
            <div className="relative mx-auto flex max-w-3xl flex-col items-center">
              <h2 className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">{p.ctaTitle}</h2>
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">{p.ctaText}</p>
              <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
                <Button href={book} size="lg" className="w-full sm:w-auto">
                  {t.pricing.book} <ArrowRight aria-hidden className="h-4 w-4" />
                </Button>
                <Button href={phoneHref(business.phone)} variant="outline" size="lg" className="w-full sm:w-auto">
                  <Phone className="h-4 w-4" /> {business.phone}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function CenterHeader({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      <p className="text-lg leading-relaxed text-muted-foreground">{lead}</p>
    </div>
  );
}
