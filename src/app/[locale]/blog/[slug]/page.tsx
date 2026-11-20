import type { Metadata } from "next";
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
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/site";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
        <header className="relative isolate overflow-hidden border-b bg-background pb-10 pt-6 sm:pb-12 sm:pt-8">
          <div aria-hidden className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
          <Container className="max-w-3xl">
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                <li>
                  <LLink href="/" className="transition-colors hover:text-foreground">
                    {t.blog.home}
                  </LLink>
                </li>
                <li aria-hidden>
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
                <li>
                  <LLink href="/blog" className="transition-colors hover:text-foreground">
                    {t.nav.blog}
                  </LLink>
                </li>
                <li aria-hidden>
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
                <li aria-current="page" className="line-clamp-1 min-w-0 font-medium text-foreground">
                  {c.title}
                </li>
              </ol>
            </nav>
            <Badge variant="outline" className="mt-8 bg-background font-medium text-muted-foreground">
              {c.category}
            </Badge>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">{c.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">{c.excerpt}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
              <span className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarImage src={images.portrait} alt="" className="object-[50%_25%]" />
                  <AvatarFallback>{t.blog.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>
                  <span className="block text-sm font-medium text-foreground">{t.blog.author}</span>
                  <span className="block text-xs text-muted-foreground">{t.blog.authorRole}</span>
                </span>
              </span>
              <Separator orientation="vertical" className="hidden h-8 sm:block" />
              <span className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays aria-hidden className="h-3.5 w-3.5" />
                  <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
                </span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock aria-hidden className="h-3.5 w-3.5" />
                  {fill(t.blog.minRead, { n: String(post.readMinutes) })}
                </span>
              </span>
            </div>
          </Container>
        </header>

        <Container className="max-w-4xl pt-10 sm:pt-12">
          <CoverImage
            photo={post.cover}
            alt={c.coverAlt}
            diagram={post.coverDiagram}
            sizes="(min-width: 1024px) 896px, 100vw"
            preload
            className={`rounded-2xl border ${post.coverDiagram ? "aspect-[16/10]" : "aspect-[16/9]"}`}
          />
        </Container>

        <Container className="max-w-3xl py-12 sm:py-16">
          <div id="article-body">
            <ArticleBody blocks={c.body} />
          </div>

          <Separator className="my-12" />

          {/* Contextual call to action */}
          <aside className="rounded-xl border bg-muted/40 p-6 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{t.blog.helpTitle}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{t.blog.helpText}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={localePath(locale, "/book")}
                className={cn(buttonVariants({ variant: "default" }), "group h-10 gap-2 rounded-[var(--btn-radius,0.625rem)] px-4 shadow-xs")}
              >
                {t.blog.ctaButton} <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={sectionHref(locale, "services")}
                className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-[var(--btn-radius,0.625rem)] bg-background px-4 shadow-xs")}
              >
                {t.blog.helpServices}
              </Link>
            </div>
          </aside>

          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">{t.blog.disclaimer}</p>

          <Separator className="my-8" />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <ShareArticle url={url} title={c.title} t={{ share: t.blog.share, copyLink: t.blog.copyLink, copied: t.blog.copied }} />
            <LLink href="/blog" className={cn(buttonVariants({ variant: "ghost" }), "group h-9 w-fit gap-1.5 rounded-[var(--btn-radius,0.625rem)] px-3")}>
              <ArrowLeft aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              {t.blog.backToBlog}
            </LLink>
          </div>

          <div className="mt-10">
            <AuthorCard t={t.blog} />
          </div>
        </Container>
      </article>

      {related.length > 0 && (
        <section className="border-t bg-muted/40 py-16 sm:py-20">
          <Container>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{t.blog.related}</h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
