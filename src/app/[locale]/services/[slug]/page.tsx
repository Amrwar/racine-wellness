import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ChevronDown, ChevronRight, ClipboardList, Sparkles, UserRound } from "lucide-react";
import { htmlLang, isLocale, localePath, sectionHref, type Locale } from "@/i18n/config";
import { LLink } from "@/i18n/LocaleProvider";
import { getContent, getText } from "@/lib/content";
import { getPricing } from "@/lib/pricing";
import { formatPrice } from "@/lib/pricing-data";
import { categoryOf, defaultServicePhoto, isBookable, serviceSlugs } from "@/lib/services";
import { serviceDetails } from "@/lib/service-details";
import { site } from "@/lib/site";
import { Container } from "@/components/ui";
import { ServiceIconView } from "@/components/icons";
import { ServiceCard } from "@/components/ServicesExplorer";
import { ServiceGuide, serviceLabels, serviceLinks } from "@/components/ServicesShared";
import { alternatesFor } from "../../layout";

// Services added in the admin get a page on first visit.
export const dynamicParams = true;

export async function generateStaticParams() {
  const items = (await getContent()).services.items;
  return serviceSlugs(items).map((slug) => ({ slug }));
}

async function find(slug: string) {
  const items = (await getContent()).services.items;
  const index = serviceSlugs(items).indexOf(slug);
  return index < 0 ? null : { items, index, service: items[index] };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/services/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const found = await find(slug);
  if (!isLocale(locale) || !found) return {};
  const s = found.service;
  return {
    title: s.title[locale],
    description: s.text[locale].slice(0, 160),
    alternates: alternatesFor(`/services/${slug}`),
    openGraph: { title: s.title[locale], description: s.text[locale].slice(0, 200) },
  };
}

export default async function ServicePage({ params }: PageProps<"/[locale]/services/[slug]">) {
  const { locale, slug } = await params;
  const found = await find(slug);
  if (!isLocale(locale) || !found) notFound();
  const { items, index, service: s } = found;
  const [t, content, pricing] = await Promise.all([getText(locale), getContent(), getPricing()]);
  const ts = t.services;
  const cat = categoryOf(s);
  const bookable = isBookable(s);
  const detail = serviceDetails[slug];
  const photo = s.photo?.src ?? defaultServicePhoto(s);
  const links = serviceLinks(locale, items);
  const others = items.map((x, i) => ({ x, i })).filter(({ i }) => i !== index).slice(0, 3);
  const primary = bookable ? { href: localePath(locale, "/book"), label: t.header.book } : { href: sectionHref(locale, "contact"), label: ts.requestInfo };
  const L = (list?: Record<Locale, string[]>) => list?.[locale] ?? [];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: s.title[locale],
      description: s.text[locale],
      serviceType: cat ? ts.categories[cat] : s.title[locale],
      inLanguage: htmlLang[locale],
      provider: { "@type": "LocalBusiness", name: site.name, url: site.url },
      areaServed: "Greater Montréal, QC",
      url: `${site.url}${localePath(locale, `/services/${slug}`)}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: ts.home, item: `${site.url}${localePath(locale, "/")}` },
        { "@type": "ListItem", position: 2, name: t.nav.services, item: `${site.url}${localePath(locale, "/services")}` },
        { "@type": "ListItem", position: 3, name: s.title[locale], item: `${site.url}${localePath(locale, `/services/${slug}`)}` },
      ],
    },
  ];

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-surface via-white to-blue/10">
        <div aria-hidden className="absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-blue/10 blur-3xl" />
        <Container className="grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <LLink href="/" className="hover:text-navy">
                    {ts.home}
                  </LLink>
                </li>
                <li aria-hidden>
                  <ChevronRight className="h-4 w-4" />
                </li>
                <li>
                  <LLink href="/services" className="hover:text-navy">
                    {t.nav.services}
                  </LLink>
                </li>
                <li aria-hidden>
                  <ChevronRight className="h-4 w-4" />
                </li>
                <li aria-current="page" className="font-semibold text-navy">
                  {s.title[locale]}
                </li>
              </ol>
            </nav>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-green">
                <ServiceIconView icon={s.icon} image={s.image} className="h-6 w-6" />
              </span>
              {cat && <span className="text-xs font-bold uppercase tracking-[0.2em] text-navy">{ts.categories[cat]}</span>}
            </div>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-navy sm:text-5xl">{s.title[locale]}</h1>
            <p className="mt-5 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-ink/80">{s.text[locale]}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={primary.href}
                className="group inline-flex items-center gap-2 rounded-[var(--btn-radius,9999px)] bg-blue-dark px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue/25 transition hover:-translate-y-0.5 hover:bg-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
              >
                {primary.label} <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <LLink href="/services" className="inline-flex items-center rounded-[var(--btn-radius,9999px)] bg-white px-6 py-3.5 font-semibold text-navy ring-1 ring-navy/15 hover:ring-blue-dark">
                {ts.viewAll}
              </LLink>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-navy shadow-2xl shadow-navy/20 ring-1 ring-navy/10">
              {photo ? (
                <Image src={photo} alt="" fill preload sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-navy to-navy-deep text-green">
                  <div aria-hidden className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-blue/25 blur-3xl" />
                  <ServiceIconView icon={s.icon} image={s.image} className="relative h-24 w-24" />
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ---------- Includes + benefits ---------- */}
      {detail && (
        <section className="bg-white py-14 sm:py-20">
          <Container className="grid gap-6 md:grid-cols-2">
            <ListCard title={ts.includesTitle} items={L(detail.includes)} />
            <ListCard title={ts.benefitsTitle} items={L(detail.benefits)} accent />
          </Container>
        </section>
      )}

      {/* ---------- What to expect ---------- */}
      <section className="bg-surface py-14 sm:py-20">
        <Container>
          <h2 className="text-3xl font-semibold tracking-tight text-navy">{ts.expectTitle}</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {ts.expect.map((e, i) => {
              const Icon = [ClipboardList, Sparkles, UserRound][i % 3];
              return (
                <li key={i} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-navy/10">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-3xl font-bold text-blue-dark">{String(i + 1).padStart(2, "0")}</span>
                    <Icon aria-hidden className="h-6 w-6 text-navy" />
                  </div>
                  <h3 className="font-semibold text-navy">{e.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{e.text}</p>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* ---------- Suitability, options, preparation ---------- */}
      <section className="bg-white py-14 sm:py-20">
        <Container className="grid gap-6 lg:grid-cols-3">
          {detail && (
            <div className="rounded-2xl bg-surface p-6 ring-1 ring-navy/10 sm:p-8">
              <h2 className="text-xl font-semibold text-navy">{ts.suitabilityTitle}</h2>
              <p className="mt-3 leading-relaxed text-muted">{detail.suitability[locale]}</p>
            </div>
          )}
          <div className="rounded-2xl bg-surface p-6 ring-1 ring-navy/10 sm:p-8">
            <h2 className="text-xl font-semibold text-navy">{ts.optionsTitle}</h2>
            {bookable ? (
              <>
                <ul className="mt-4 space-y-4">
                  {pricing.services.map((p) => (
                    <li key={p.id}>
                      <p className="font-semibold text-ink">{p.title[locale]}</p>
                      <p className="mt-1 flex flex-wrap gap-2">
                        {p.rates.map((r) => (
                          <Link
                            key={r.minutes}
                            href={`${localePath(locale, "/book")}?service=${encodeURIComponent(p.id)}&minutes=${r.minutes}`}
                            className="rounded-full bg-white px-3 py-1 text-sm text-navy ring-1 ring-navy/15 hover:ring-blue-dark"
                          >
                            {t.pricing.duration.replace("{n}", String(r.minutes))} · <span className="font-semibold">{formatPrice(r.price, locale)}</span>
                          </Link>
                        ))}
                      </p>
                    </li>
                  ))}
                </ul>
                <LLink href="/pricing" className="mt-4 inline-flex text-sm font-semibold text-blue-dark underline underline-offset-4">
                  {ts.seePricing}
                </LLink>
              </>
            ) : (
              <>
                <p className="mt-3 leading-relaxed text-muted">{ts.optionsNone}</p>
                <Link href={sectionHref(locale, "contact")} className="mt-4 inline-flex text-sm font-semibold text-blue-dark underline underline-offset-4">
                  {ts.requestInfo}
                </Link>
              </>
            )}
          </div>
          {detail && (
            <div className="rounded-2xl bg-surface p-6 ring-1 ring-navy/10 sm:p-8">
              <h2 className="text-xl font-semibold text-navy">{ts.prepTitle}</h2>
              <ul className="mt-4 space-y-3">
                {L(detail.preparation).map((p) => (
                  <li key={p} className="flex items-start gap-3 text-ink">
                    <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-blue-dark" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </section>

      {/* ---------- FAQ (the site's questions, when Ziad has added some) ---------- */}
      {content.faq.items.length > 0 && (
        <section className="bg-surface py-14 sm:py-20">
          <Container>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-3xl font-semibold tracking-tight text-navy">{content.faq.title[locale]}</h2>
              <div className="space-y-4">
                {content.faq.items.map((f, i) => (
                  <details key={i} className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy/10 [&_summary::-webkit-details-marker]:hidden">
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

      {/* ---------- Other services + guidance ---------- */}
      <section className="bg-surface pb-20 pt-4 sm:pt-6">
        <Container>
          {others.length > 0 && (
            <>
              <h2 className="mb-6 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{ts.otherServices}</h2>
              <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {others.map(({ x, i }) => (
                  <li key={i}>
                    <ServiceCard s={x} index={i} locale={locale} links={links} t={serviceLabels(t)} />
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-12">
            <ServiceGuide locale={locale} t={t} />
          </div>
        </Container>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

function ListCard({ title, items, accent = false }: { title: string; items: string[]; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-navy/10 sm:p-8">
      <h2 className="text-xl font-semibold text-navy">{title}</h2>
      <ul className="mt-5 space-y-4">
        {items.map((x) => (
          <li key={x} className="flex items-start gap-3 text-ink">
            <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${accent ? "bg-green/25 text-navy-deep" : "bg-navy text-green"}`}>
              <Check aria-hidden className="h-3.5 w-3.5" />
            </span>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}
