import { getContent, getText } from "@/lib/content";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { isLocale, localePath } from "@/i18n/config";
import { LLink } from "@/i18n/LocaleProvider";
import { getPosts } from "@/lib/posts";
import { site } from "@/lib/site";
import { categoriesOf, categoryKey, searchText } from "@/lib/blog-search";
import { Container } from "@/components/ui";
import { BlogCta, FeaturedPost, cardData } from "@/components/blog";
import { BlogExplorer, StaticGrid, type ExplorerItem } from "@/components/BlogExplorer";
import { alternatesFor } from "../layout";

export async function generateMetadata({ params }: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = (await getText(locale)).meta.blog;
  const share = await getContent().then((c) => c.share.blog);
  return {
    title: m.title, description: m.description, alternates: alternatesFor("/blog"),
    // A page-specific share picture; otherwise the home page's (from the layout) applies.
    ...(share && { openGraph: { title: m.title, description: m.description, images: [{ url: share.src, width: share.width, height: share.height }] } }),
  };
}

export default async function BlogPage({ params }: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getText(locale);
  const posts = await getPosts();
  const [featured, ...rest] = posts;
  const items: ExplorerItem[] = posts.map((p) => ({ key: categoryKey(p), text: searchText(p, locale), card: cardData(p, locale, t.blog) }));
  const labels = {
    search: t.blog.search,
    searchLabel: t.blog.searchLabel,
    clear: t.blog.clear,
    all: t.blog.all,
    results: t.blog.results,
    resultsOne: t.blog.resultsOne,
    noResults: t.blog.noResults,
    showAll: t.blog.showAll,
    readMore: t.blog.readMore,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.blog.home, item: `${site.url}${localePath(locale, "/")}` },
      { "@type": "ListItem", position: 2, name: t.nav.blog, item: `${site.url}${localePath(locale, "/blog")}` },
    ],
  };

  return (
    <>
      {/* ---------- Hero: headline left, the HealthyZone studio right ---------- */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-surface via-white to-blue/10">
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[55%] md:block">
          <Image src="/images/blog/studio-table.webp" alt="" fill preload sizes="55vw" className="object-cover object-[50%_60%]" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-surface via-surface/50 to-transparent" />
        </div>
        <div aria-hidden className="absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-blue/10 blur-3xl" />
        <Container className="pb-36 pt-10 sm:pb-40 sm:pt-12">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
            <ol className="flex items-center gap-2">
              <li>
                <LLink href="/" className="hover:text-navy">
                  {t.blog.home}
                </LLink>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-4 w-4" />
              </li>
              <li aria-current="page" className="font-semibold text-navy">
                {t.nav.blog}
              </li>
            </ol>
          </nav>
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-navy">
            <span aria-hidden className="h-0.5 w-5 rounded-full bg-green" />
            {t.blog.eyebrow}
          </p>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-navy sm:text-5xl lg:text-6xl">{t.blog.title}</h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/80">{t.blog.lead}</p>
        </Container>
      </section>

      <section className="bg-surface pb-16 sm:pb-20">
        <Container>
          {featured && (
            <div className="-mt-24 sm:-mt-28">
              <FeaturedPost post={featured} locale={locale} t={t.blog} />
            </div>
          )}
          {rest.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-navy">{t.blog.latest}</h2>
              {/* The search box reads ?q= and ?category= from the address, so it renders in the browser; the plain grid stands in until then. */}
              <Suspense fallback={<StaticGrid items={items.filter((i) => i.card.slug !== featured.slug)} readMore={t.blog.readMore} />}>
                <BlogExplorer items={items} featured={featured.slug} categories={categoriesOf(posts, locale)} t={labels} />
              </Suspense>
            </div>
          )}
        </Container>
      </section>

      <BlogCta locale={locale} t={t.blog} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </>
  );
}
