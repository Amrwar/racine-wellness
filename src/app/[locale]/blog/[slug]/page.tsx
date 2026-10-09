import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { htmlLang, isLocale, localePath } from "@/i18n/config";
import { getPost, getPosts, posts } from "@/lib/blog";
import { images, site } from "@/lib/site";
import { Container } from "@/components/ui";
import { ArticleBody, AuthorCard, BlogCta, CoverImage, PostCard, PostMeta } from "@/components/blog";
import { alternatesFor } from "../../layout";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!isLocale(locale) || !post) return {};
  const c = post[locale];
  return {
    title: c.title,
    description: c.excerpt,
    alternates: alternatesFor(`/blog/${slug}`),
    openGraph: {
      type: "article",
      title: c.title,
      description: c.excerpt,
      publishedTime: post.date,
      images: [{ url: post.cover.src, width: post.cover.width, height: post.cover.height, alt: c.coverAlt }],
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!isLocale(locale) || !post) notFound();
  const t = getDictionary(locale);
  const c = post[locale];
  const related = getPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: c.title,
    description: c.excerpt,
    image: `${site.url}${post.cover.src}`,
    datePublished: post.date,
    inLanguage: htmlLang[locale],
    author: { "@type": "Person", name: site.owner, jobTitle: t.credentialsLine },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: `${site.url}${localePath(locale, `/blog/${slug}`)}`,
  };

  return (
    <>
      <article>
        <header className="bg-surface pb-12 pt-12 sm:pt-16">
          <Container className="max-w-4xl">
            <Link
              href={localePath(locale, "/blog")}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-dark"
            >
              <span aria-hidden className="transition group-hover:-translate-x-0.5">
                ←
              </span>
              {t.blog.backToBlog}
            </Link>
            <p className="mt-8">
              <span className="inline-flex rounded-full bg-blue/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-dark">
                {c.category}
              </span>
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.12] tracking-tight text-navy sm:text-5xl">
              {c.title}
            </h1>
            <p className="mt-5 max-w-3xl text-xl leading-relaxed text-muted">{c.excerpt}</p>
            <div className="mt-8 flex items-center gap-4">
              <Image
                src={images.portrait}
                alt=""
                width={56}
                height={56}
                className="h-12 w-12 rounded-full object-cover object-top ring-2 ring-white"
              />
              <div>
                <p className="font-semibold text-navy">{t.blog.author}</p>
                <PostMeta post={post} locale={locale} t={t.blog} className="text-muted" />
              </div>
            </div>
          </Container>
        </header>

        <div className="bg-gradient-to-b from-surface from-50% to-white">
          <Container className="max-w-5xl">
            <CoverImage
              photo={post.cover}
              alt={c.coverAlt}
              diagram={post.coverDiagram}
              sizes="(min-width: 1024px) 1024px, 100vw"
              preload
              className={`rounded-3xl shadow-2xl shadow-ink/15 ${
                post.coverDiagram ? "aspect-[16/10] ring-1 ring-mist/70" : "aspect-[16/9]"
              }`}
            />
          </Container>
        </div>

        <Container className="max-w-3xl py-14 sm:py-20">
          <ArticleBody blocks={c.body} />
          <p className="mt-14 border-t border-mist/70 pt-6 text-sm leading-relaxed text-muted">{t.blog.disclaimer}</p>
          <div className="mt-10">
            <AuthorCard t={t.blog} />
          </div>
        </Container>
      </article>

      <section className="border-t border-mist/60 bg-surface py-16 sm:py-20">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{t.blog.related}</h2>
          <ul className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} locale={locale} t={t.blog} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <BlogCta locale={locale} t={t.blog} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
