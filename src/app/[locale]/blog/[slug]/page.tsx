import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, Clock } from "lucide-react";
import { fill } from "@/i18n";
import { getText } from "@/lib/content";
import { htmlLang, isLocale, localePath, sectionHref } from "@/i18n/config";
import { LLink } from "@/i18n/LocaleProvider";
import { getPost, getPosts } from "@/lib/posts";
import { formatDate } from "@/lib/blog";
import { relatedPosts } from "@/lib/blog-search";
import { images, site } from "@/lib/site";
import { Container } from "@/components/ui";
import { ArticleCard } from "@/components/ArticleCard";
import { ReadingProgress, ShareArticle } from "@/components/ArticleExtras";
import { ArticleBody, AuthorCard, BlogCta, CoverImage, cardData } from "@/components/blog";
import { alternatesFor } from "../../layout";

// New articles from the admin render on first visit, then stay cached until edited.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

const absolute = (src: string) => (src.startsWith("http") ? src : `${site.url}${src}`);

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug);
  if (!isLocale(locale) || !post) return {};
  const c = post[locale];
  return {
    title: c.title,
    description: c.excerpt,
    alternates: alternatesFor(`/blog/${slug}`),
    authors: [{ name: site.owner }],
    openGraph: {
      type: "article",
      title: c.title,
      description: c.excerpt,
      publishedTime: post.date,
      authors: [site.owner],
      section: c.category,
      images: [{ url: post.cover.src, width: post.cover.width, height: post.cover.height, alt: c.coverAlt }],
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { locale, slug } = await params;
  const post = await getPost(slug);
  if (!isLocale(locale) || !post) notFound();
  const t = await getText(locale);
  const c = post[locale];
  const related = relatedPosts(await getPosts(), post, 3);
  const url = `${site.url}${localePath(locale, `/blog/${slug}`)}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: c.title,
      description: c.excerpt,
      image: absolute(post.cover.src),
      datePublished: post.date,
      articleSection: c.category,
      inLanguage: htmlLang[locale],
      author: { "@type": "Person", name: site.owner, jobTitle: t.credentialsLine, url: `${site.url}${localePath(locale, "/")}#about` },
      publisher: { "@type": "Organization", name: site.name, url: site.url },
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t.blog.home, item: `${site.url}${localePath(locale, "/")}` },
        { "@type": "ListItem", position: 2, name: t.nav.blog, item: `${site.url}${localePath(locale, "/blog")}` },
        { "@type": "ListItem", position: 3, name: c.title, item: url },
      ],
    },
  ];

  return (
    <>
      <ReadingProgress label={t.blog.progress} />
      <article>
        <header className="relative isolate overflow-hidden bg-gradient-to-b from-surface to-white pb-10 pt-8 sm:pt-10">
          <div aria-hidden className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-blue/10 blur-3xl" />
          <Container className="max-w-4xl">
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <li>
                  <LLink href="/" className="hover:text-navy">
                    {t.blog.home}
                  </LLink>
                </li>
                <li aria-hidden>
                  <ChevronRight className="h-4 w-4" />
                </li>
                <li>
                  <LLink href="/blog" className="hover:text-navy">
                    {t.nav.blog}
                  </LLink>
                </li>
                <li aria-hidden>
                  <ChevronRight className="h-4 w-4" />
                </li>
                <li aria-current="page" className="line-clamp-1 font-medium text-navy">
                  {c.title}
                </li>
              </ol>
            </nav>
            <span className="mt-8 inline-flex rounded-full bg-green/25 px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy-deep">{c.category}</span>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-navy sm:text-5xl">{c.title}</h1>
            <p className="mt-5 max-w-3xl text-xl leading-relaxed text-muted">{c.excerpt}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="flex items-center gap-3">
                <Image src={images.portrait} alt="" width={56} height={56} className="h-11 w-11 rounded-full object-cover object-[50%_25%] ring-2 ring-white" />
                <span>
                  <span className="block font-semibold text-navy">{t.blog.author}</span>
                  <span className="block text-sm text-muted">{t.blog.authorRole}</span>
                </span>
              </span>
              <span aria-hidden className="hidden h-8 w-px bg-navy/15 sm:block" />
              <span className="flex items-center gap-4 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays aria-hidden className="h-4 w-4" />
                  <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock aria-hidden className="h-4 w-4" />
                  {fill(t.blog.minRead, { n: String(post.readMinutes) })}
                </span>
              </span>
            </div>
          </Container>
        </header>

        <Container className="max-w-5xl">
          <CoverImage
            photo={post.cover}
            alt={c.coverAlt}
            diagram={post.coverDiagram}
            sizes="(min-width: 1024px) 1024px, 100vw"
            preload
            className={`rounded-3xl shadow-2xl shadow-navy/15 ${post.coverDiagram ? "aspect-[16/10] ring-1 ring-navy/10" : "aspect-[16/9]"}`}
          />
        </Container>

        <div className="mx-auto w-full max-w-[760px] px-5 py-12 sm:px-8 sm:py-16">
          <div id="article-body">
            <ArticleBody blocks={c.body} />
          </div>

          {/* Contextual call to action */}
          <aside className="mt-14 rounded-2xl bg-surface p-6 ring-1 ring-navy/10 sm:p-8">
            <h2 className="text-xl font-semibold text-navy">{t.blog.helpTitle}</h2>
            <p className="mt-2 leading-relaxed text-muted">{t.blog.helpText}</p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Link
                href={localePath(locale, "/book")}
                className="group inline-flex items-center gap-2 rounded-[var(--btn-radius,9999px)] bg-blue-dark px-5 py-2.5 font-semibold text-white shadow-md shadow-blue/25 transition hover:bg-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
              >
                {t.blog.ctaButton} <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href={sectionHref(locale, "services")} className="font-semibold text-navy underline underline-offset-4 hover:text-blue-dark">
                {t.blog.helpServices}
              </Link>
            </div>
          </aside>

          <p className="mt-10 border-t border-navy/10 pt-6 text-sm leading-relaxed text-muted">{t.blog.disclaimer}</p>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <ShareArticle url={url} title={c.title} t={{ share: t.blog.share, copyLink: t.blog.copyLink, copied: t.blog.copied }} />
            <LLink href="/blog" className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-dark">
              <ArrowLeft aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              {t.blog.backToBlog}
            </LLink>
          </div>

          <div className="mt-10">
            <AuthorCard t={t.blog} />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-navy/10 bg-surface py-16 sm:py-20">
          <Container>
            <h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{t.blog.related}</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {related.map((p) => (
                <li key={p.slug}>
                  <ArticleCard a={cardData(p, locale, t.blog)} readMore={t.blog.readMore} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <BlogCta locale={locale} t={t.blog} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
