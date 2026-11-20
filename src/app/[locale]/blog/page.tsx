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
import { Container, Eyebrow } from "@/components/ui/site";
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
      <section className="relative isolate -mt-16 overflow-hidden border-b bg-background pt-16">
        <div aria-hidden className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <Container className="grid items-center gap-10 py-12 sm:py-16 md:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div>
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
              <ol className="flex items-center gap-1.5">
                <li>
                  <LLink href="/" className="transition-colors hover:text-foreground">
                    {t.blog.home}
                  </LLink>
                </li>
                <li aria-hidden>
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
                <li aria-current="page" className="font-medium text-foreground">
                  {t.nav.blog}
                </li>
              </ol>
            </nav>
            <Eyebrow>{t.blog.eyebrow}</Eyebrow>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl">{t.blog.title}</h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">{t.blog.lead}</p>
          </div>
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl border bg-muted shadow-xs md:block">
            <Image src="/images/blog/studio-table.webp" alt="" fill preload sizes="(min-width: 1152px) 520px, 45vw" className="object-cover object-[50%_60%]" />
          </div>
        </Container>
      </section>

      <section className="bg-muted/40 py-12 sm:py-16">
        <Container>
          {featured && <FeaturedPost post={featured} locale={locale} t={t.blog} />}
          {rest.length > 0 && (
            <div className="mt-14">
              <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{t.blog.latest}</h2>
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
