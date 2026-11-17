import Image from "next/image";
import Link from "next/link";
import { fill } from "@/i18n";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";
import { formatDate, type Block, type Photo, type Post } from "@/lib/blog";
import { images } from "@/lib/site";
import { ArrowRight, CalendarCheck, CalendarDays, Clock } from "lucide-react";
import { Check, Container } from "./ui";
import { ArticleCard, type ArticleCardData } from "./ArticleCard";

type BlogT = Dictionary["blog"];

export const postHref = (locale: Locale, slug: string) => localePath(locale, `/blog/${slug}`);

/** Photos fill their frame; diagrams sit whole on a white card so no labels get cropped. */
export function CoverImage({
  photo,
  alt,
  diagram,
  sizes,
  preload = false,
  className = "",
}: {
  photo: Photo;
  alt: string;
  diagram?: boolean;
  sizes: string;
  preload?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${diagram ? "bg-white" : "bg-surface"} ${className}`}>
      <Image
        src={photo.src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className={
          diagram
            ? "object-contain p-5 transition duration-500 group-hover:scale-[1.02]"
            : "object-cover object-[50%_28%] transition duration-500 group-hover:scale-[1.04]"
        }
      />
    </div>
  );
}

export function PostMeta({ post, locale, t, className = "" }: { post: Post; locale: Locale; t: BlogT; className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2 text-sm ${className}`}>
      <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
      <span aria-hidden>·</span>
      <span>{fill(t.minRead, { n: String(post.readMinutes) })}</span>
    </p>
  );
}

/** Card props for one article in one language. */
export function cardData(post: Post, locale: Locale, t: BlogT): ArticleCardData {
  const c = post[locale];
  return {
    slug: post.slug,
    href: postHref(locale, post.slug),
    title: c.title,
    category: c.category,
    dateIso: post.date,
    dateLabel: formatDate(post.date, locale),
    minutesLabel: fill(t.minRead, { n: String(post.readMinutes) }),
    cover: post.cover,
    coverAlt: c.coverAlt,
    diagram: post.coverDiagram,
  };
}

export function PostCard({ post, locale, t }: { post: Post; locale: Locale; t: BlogT }) {
  return <ArticleCard a={cardData(post, locale, t)} readMore={t.readMore} />;
}

/** The newest article, wide: picture on the left, text on the right (stacked on phones). */
export function FeaturedPost({ post, locale, t }: { post: Post; locale: Locale; t: BlogT }) {
  const c = post[locale];
  return (
    <article className="group relative grid overflow-hidden rounded-3xl bg-white p-3 shadow-xl shadow-navy/10 ring-1 ring-navy/10 sm:p-4 lg:grid-cols-2 lg:gap-4">
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue/10 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -right-10 top-8 h-40 w-40 rotate-12 rounded-[2rem] border border-blue/15" />
      <CoverImage
        photo={post.cover}
        alt={c.coverAlt}
        diagram={post.coverDiagram}
        sizes="(min-width: 1024px) 50vw, 100vw"
        preload
        className={`aspect-[16/10] rounded-2xl lg:aspect-auto lg:min-h-[22rem] ${post.coverDiagram ? "ring-1 ring-navy/5" : ""}`}
      />
      <div className="relative flex flex-col justify-center px-3 py-6 sm:px-6 lg:px-8 lg:py-10">
        <span className="w-fit rounded-full bg-green/25 px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy-deep">{c.category}</span>
        <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-navy sm:text-3xl lg:text-4xl">
          <Link href={postHref(locale, post.slug)} className="focus-visible:outline-none focus-visible:underline">
            {c.title}
          </Link>
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted">{c.excerpt}</p>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
          <span className="flex items-center gap-4 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden className="h-4 w-4" />
              <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
            </span>
            <span aria-hidden className="h-4 w-px bg-navy/15" />
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden className="h-4 w-4" />
              {fill(t.minRead, { n: String(post.readMinutes) })}
            </span>
          </span>
          <Link
            href={postHref(locale, post.slug)}
            className="group/btn inline-flex items-center gap-2 rounded-[var(--btn-radius,9999px)] bg-blue-dark px-6 py-3 font-semibold text-white shadow-lg shadow-blue/25 transition hover:-translate-y-0.5 hover:bg-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
          >
            {t.readArticle} <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Renders an article body with the site's typography. */
export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="text-lg leading-8 text-ink/85">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return (
              <p key={i} className={i === 0 ? "text-xl leading-9 text-ink" : "mt-6"}>
                {b.text}
              </p>
            );
          case "h2":
            return (
              <h2 key={i} className="mt-14 text-2xl font-semibold tracking-tight text-navy sm:text-[1.75rem]">
                {b.text}
              </h2>
            );
          case "list":
            return (
              <ul key={i} className="mt-6 space-y-4">
                {b.items.map((item) => (
                  <li key={item} className="flex gap-4">
                    <span className="mt-1.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-green/20 text-navy">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="my-12 rounded-2xl border-l-4 border-green bg-surface px-7 py-6 text-xl font-medium leading-relaxed text-navy sm:text-2xl"
              >
                {b.text}
              </blockquote>
            );
          case "image":
            return (
              <figure key={i} className="my-12">
                {b.diagram ? (
                  <div className="overflow-hidden rounded-2xl border border-mist/70 bg-white p-4 sm:p-8">
                    <Image
                      src={b.photo.src}
                      alt={b.alt}
                      width={b.photo.width}
                      height={b.photo.height}
                      sizes="(min-width: 768px) 720px, 100vw"
                      className="mx-auto h-auto max-h-[38rem] w-auto"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg shadow-ink/10">
                    <Image
                      src={b.photo.src}
                      alt={b.alt}
                      fill
                      sizes="(min-width: 768px) 720px, 100vw"
                      className="object-cover object-[50%_30%]"
                    />
                  </div>
                )}
                {b.caption && (
                  <figcaption className="mt-3 text-center text-sm leading-relaxed text-muted">{b.caption}</figcaption>
                )}
              </figure>
            );
        }
      })}
    </div>
  );
}

export function AuthorCard({ t }: { t: BlogT }) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-mist/70 bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
      <Image
        src={images.portrait}
        alt={t.author}
        width={96}
        height={96}
        className="h-20 w-20 shrink-0 rounded-full object-cover object-[50%_25%] ring-4 ring-white"
      />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-dark">{t.by}</p>
        <p className="mt-1 text-lg font-semibold text-navy">{t.author}</p>
        <p className="text-sm font-medium text-muted">{t.authorRole}</p>
        <p className="mt-3 leading-relaxed text-ink/80">{t.authorBio}</p>
      </div>
    </div>
  );
}

/** Closing call to action shared by the blog pages: a navy banner with the booking button. */
export function BlogCta({ locale, t }: { locale: Locale; t: BlogT }) {
  return (
    <section className="bg-surface pb-16 pt-4 sm:pb-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-8 text-white shadow-xl shadow-navy/20 sm:px-10 sm:py-10">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue/30 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-green/10 blur-3xl" />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center">
            <span className="hidden h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 md:grid">
              <CalendarCheck aria-hidden className="h-8 w-8 text-green" />
            </span>
            <span aria-hidden className="hidden h-14 w-px bg-white/20 md:block" />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.ctaTitle}</h2>
              <p className="mt-2 text-white/80">{t.ctaText}</p>
            </div>
            <Link
              href={localePath(locale, "/book")}
              className="group inline-flex shrink-0 items-center gap-2 rounded-[var(--btn-radius,9999px)] bg-blue-dark px-7 py-3.5 font-semibold text-white shadow-lg shadow-black/20 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              <span aria-hidden className="h-2 w-2 rounded-full bg-green" />
              {t.ctaButton}
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
