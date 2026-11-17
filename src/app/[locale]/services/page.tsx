import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { isLocale, localePath } from "@/i18n/config";
import { LLink } from "@/i18n/LocaleProvider";
import { getContent, getText } from "@/lib/content";
import { getDesign } from "@/lib/design";
import { getPricing } from "@/lib/pricing";
import { site } from "@/lib/site";
import { Container } from "@/components/ui";
import { BlogCta } from "@/components/blog";
import { ServicesExplorer } from "@/components/ServicesExplorer";
import { ServiceGuide, serviceLabels, serviceLinks } from "@/components/ServicesShared";
import { alternatesFor } from "../layout";

export async function generateMetadata({ params }: PageProps<"/[locale]/services">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = (await getText(locale)).services;
  return { title: t.metaTitle, description: t.metaDescription, alternates: alternatesFor("/services") };
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [t, content, design, pricing] = await Promise.all([getText(locale), getContent(), getDesign(), getPricing()]);
  const items = content.services.items;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.services.home, item: `${site.url}${localePath(locale, "/")}` },
      { "@type": "ListItem", position: 2, name: t.nav.services, item: `${site.url}${localePath(locale, "/services")}` },
    ],
  };

  return (
    <>
      {/* Hero: headline left, the HealthyZone studio right */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-surface via-white to-blue/10">
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[52%] md:block">
          <Image src="/images/blog/studio-table-side.webp" alt="" fill preload sizes="52vw" className="object-cover object-[50%_65%]" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-surface via-surface/50 to-transparent" />
        </div>
        <div aria-hidden className="absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-blue/10 blur-3xl" />
        <Container className="py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
            <ol className="flex items-center gap-2">
              <li>
                <LLink href="/" className="hover:text-navy">
                  {t.services.home}
                </LLink>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-4 w-4" />
              </li>
              <li aria-current="page" className="font-semibold text-navy">
                {t.nav.services}
              </li>
            </ol>
          </nav>
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-navy">
            <span aria-hidden className="h-0.5 w-5 rounded-full bg-green" />
            {t.services.pageEyebrow}
          </p>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-navy sm:text-5xl lg:text-6xl">{t.services.title}</h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/80">{t.services.pageLead}</p>
        </Container>
      </section>

      <section className="bg-surface py-12 sm:py-16">
        <Container>
          <h2 className="mb-6 text-3xl font-semibold tracking-tight text-navy">{t.services.explore}</h2>
          <ServicesExplorer items={items} locale={locale} links={serviceLinks(locale, items, pricing, t)} columns={items.length === 4 ? 2 : design.layout.servicesColumns} t={serviceLabels(t)} />
          <div className="mt-12">
            <ServiceGuide locale={locale} t={t} />
          </div>
        </Container>
      </section>

      <BlogCta locale={locale} t={t.blog} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </>
  );
}
