import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, localePath } from "@/i18n/config";
import { getContent, getText } from "@/lib/content";
import { getDesign } from "@/lib/design";
import { getPricing } from "@/lib/pricing";
import { site } from "@/lib/site";
import { Container, Crumbs, PageHero } from "@/components/ui/site";
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
      <PageHero
        breadcrumb={<Crumbs items={[{ label: t.services.home, href: localePath(locale, "/") }, { label: t.nav.services }]} />}
        eyebrow={t.services.pageEyebrow}
        title={t.services.title}
        lead={t.services.pageLead}
        aside={
          <div className="relative hidden overflow-hidden rounded-2xl border bg-muted p-1.5 shadow-xl shadow-foreground/10 md:block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image src="/images/blog/studio-table-side.webp" alt="" fill preload sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover object-[50%_65%]" />
            </div>
          </div>
        }
      />

      <section className="bg-muted/40 py-12 sm:py-16">
        <Container>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">{t.services.explore}</h2>
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
