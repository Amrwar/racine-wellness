import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ClipboardList, Sparkles, UserRound } from "lucide-react";
import { htmlLang, isLocale, localePath, sectionHref, type Locale } from "@/i18n/config";
import { getContent, getText } from "@/lib/content";
import { getPricing } from "@/lib/pricing";
import { formatPrice, rateLabel } from "@/lib/pricing-data";
import { categoryOf, servicePhoto, serviceSlugs } from "@/lib/services";
import { serviceDetails } from "@/lib/service-details";
import { site } from "@/lib/site";
import { Button, Container, Crumbs, PageHero } from "@/components/ui/site";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
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
  const priced = pricing.services.find((p) => p.id === s.bookingId);
  const detail = serviceDetails[slug];
  const photo = servicePhoto(s);
  const links = serviceLinks(locale, items, pricing, t);
  const others = items.map((x, i) => ({ x, i })).filter(({ i }) => i !== index).slice(0, 3);
  const primary = priced ? { href: `${localePath(locale, "/book")}?service=${encodeURIComponent(priced.id)}`, label: t.header.book } : { href: sectionHref(locale, "contact"), label: ts.requestInfo };
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
      <PageHero
        breadcrumb={
          <Crumbs
            items={[
              { label: ts.home, href: localePath(locale, "/") },
              { label: t.nav.services, href: localePath(locale, "/services") },
              { label: s.title[locale] },
            ]}
          />
        }
        eyebrow={cat ? ts.categories[cat] : undefined}
        title={s.title[locale]}
        aside={
          <div className="relative overflow-hidden rounded-2xl border bg-muted p-1.5 shadow-xl shadow-foreground/10">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image src={photo} alt="" fill preload sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-[50%_25%]" />
              {links.price[index] && (
                <Badge variant="secondary" className="absolute bottom-3 left-3 h-7 bg-background/95 px-3 text-sm font-semibold text-foreground shadow-md backdrop-blur">
                  {links.price[index]}
                </Badge>
              )}
              <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-navy text-green shadow-md">
                <ServiceIconView icon={s.icon} image={s.image} className="h-4 w-4" />
              </span>
            </div>
          </div>
        }
      >
        <p className="mt-5 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{s.text[locale]}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={primary.href} size="lg">
            {primary.label} <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button href={localePath(locale, "/services")} variant="outline" size="lg">
            {ts.viewAll}
          </Button>
        </div>
      </PageHero>

      {/* ---------- Includes + benefits ---------- */}
      {detail && (
        <section className="bg-background py-14 sm:py-20">
          <Container className="grid gap-5 md:grid-cols-2">
            <ListCard title={ts.includesTitle} items={L(detail.includes)} />
            <ListCard title={ts.benefitsTitle} items={L(detail.benefits)} accent />
          </Container>
        </section>
      )}

      {/* ---------- What to expect ---------- */}
      <section className="border-t bg-muted/40 py-14 sm:py-20">
        <Container>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">{ts.expectTitle}</h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {ts.expect.map((e, i) => {
              const Icon = [ClipboardList, Sparkles, UserRound][i % 3];
              return (
                <li key={i} className="rounded-xl border bg-card p-6 shadow-xs">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-lg border bg-muted text-navy">
                      <Icon aria-hidden className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-xs font-medium text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="font-semibold tracking-tight text-foreground">{e.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{e.text}</p>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* ---------- Suitability, options, preparation ---------- */}
      <section className="border-t bg-background py-14 sm:py-20">
        <Container className="grid gap-5 lg:grid-cols-3">
          {detail && (
            <div className="rounded-xl border bg-card p-6 shadow-xs sm:p-7">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{ts.suitabilityTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{detail.suitability[locale]}</p>
            </div>
          )}
          <div className="rounded-xl border bg-card p-6 shadow-xs sm:p-7">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{ts.optionsTitle}</h2>
            {priced ? (
              <>
                {priced.perSession && <p className="mt-3 text-sm text-muted-foreground">{t.pricing.lengthAdapted}</p>}
                <div className="mt-4 divide-y rounded-lg border">
                  {priced.rates.map((r) => (
                    <Link
                      key={r.minutes}
                      href={`${localePath(locale, "/book")}?service=${encodeURIComponent(priced.id)}&minutes=${r.minutes}`}
                      className="group flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm transition-colors hover:bg-muted"
                    >
                      <span className="text-foreground/80">{rateLabel(priced, r, t.pricing)}</span>
                      <span className="flex items-center gap-1.5 font-semibold tabular-nums text-foreground">
                        {formatPrice(r.price, locale)}
                        <ArrowRight aria-hidden className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
                <Link href={localePath(locale, "/pricing")} className={cn(buttonVariants({ variant: "link" }), "mt-3 h-auto px-0 text-navy")}>
                  {ts.seePricing}
                </Link>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{ts.optionsNone}</p>
                <Link href={sectionHref(locale, "contact")} className={cn(buttonVariants({ variant: "outline" }), "mt-4 h-9 px-4")}>
                  {ts.requestInfo}
                </Link>
              </>
            )}
          </div>
          {detail && (
            <div className="rounded-xl border bg-card p-6 shadow-xs sm:p-7">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{ts.prepTitle}</h2>
              <ul className="mt-4 space-y-3">
                {L(detail.preparation).map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-foreground/85">
                    <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </section>

      {/* ---------- FAQ (the site questions, when Ziad has added some) ---------- */}
      {content.faq.items.length > 0 && (
        <section className="border-t bg-muted/40 py-14 sm:py-20">
          <Container>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-3xl font-semibold tracking-tight text-foreground">{content.faq.title[locale]}</h2>
              <Accordion type="single" collapsible className="rounded-xl border bg-card px-5 shadow-xs">
                {content.faq.items.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="py-5 text-base font-medium hover:no-underline">{f.q[locale]}</AccordionTrigger>
                    <AccordionContent className="whitespace-pre-line pb-5 text-[0.95rem] leading-relaxed text-muted-foreground">{f.a[locale]}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Container>
        </section>
      )}

      {/* ---------- Other services + guidance ---------- */}
      <section className="border-t bg-background py-14 sm:py-20">
        <Container>
          {others.length > 0 && (
            <>
              <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{ts.otherServices}</h2>
              <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
    <div className="rounded-xl border bg-card p-6 shadow-xs sm:p-8">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <Separator className="my-5" />
      <ul className="space-y-3.5">
        {items.map((x) => (
          <li key={x} className="flex items-start gap-3 text-foreground/85">
            <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full", accent ? "bg-green/25 text-navy-deep" : "bg-navy text-green")}>
              <Check aria-hidden className="h-3 w-3" />
            </span>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}
