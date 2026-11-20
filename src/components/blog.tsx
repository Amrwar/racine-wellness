import Image from "next/image";
import Link from "next/link";
import { fill } from "@/i18n";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";
import { formatDate, type Block, type Photo, type Post } from "@/lib/blog";
import { images } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ArrowRight, CalendarCheck, CalendarDays, Clock } from "lucide-react";
import { Check, Container } from "./ui/site";
import { Badge } from "./ui/badge";
import { buttonVariants } from "./ui/button";
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
    <div className={cn("relative overflow-hidden", diagram ? "bg-white" : "bg-muted", className)}>
      <Image
        src={photo.src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className={
          diagram
            ? "object-contain p-5 transition duration-500 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
            : "object-cover object-[50%_28%] transition duration-500 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
        }
      />
    </div>
  );
}

export function PostMeta({ post, locale, t, className = "" }: { post: Post; locale: Locale; t: BlogT; className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground", className)}>
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
    <article className="group grid overflow-hidden rounded-xl border bg-card shadow-xs transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5 motion-reduce:hover:translate-y-0 lg:grid-cols-2">
      <CoverImage
        photo={post.cover}
        alt={c.coverAlt}
        diagram={post.coverDiagram}
        sizes="(min-width: 1024px) 50vw, 100vw"
        preload
        className="aspect-[16/10] border-b lg:aspect-auto lg:min-h-[22rem] lg:border-b-0 lg:border-r"
      />
      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <Badge variant="outline" className="font-medium text-muted-foreground">
          {c.category}
        </Badge>
        <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          <Link href={postHref(locale, post.slug)} className="focus-visible:underline focus-visible:outline-none">
            {c.title}
          </Link>
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{c.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden className="h-3.5 w-3.5" />
              <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden className="h-3.5 w-3.5" />
              {fill(t.minRead, { n: String(post.readMinutes) })}
            </span>
          </span>
          <Link
            href={postHref(locale, post.slug)}
            className={cn(buttonVariants({ variant: "default" }), "group/btn h-10 gap-2 rounded-[var(--btn-radius,0.625rem)] px-4 shadow-xs")}
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
    <div className="text-[1.0625rem] leading-8 text-foreground/85">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return (
              <p key={i} className={i === 0 ? "text-xl leading-9 text-foreground" : "mt-6"}>
                {b.text}
              </p>
            );
          case "h2":
            return (
              <h2 key={i} className="mt-12 text-2xl font-semibold tracking-tight text-foreground">
                {b.text}
              </h2>
            );
          case "list":
            return (
              <ul key={i} className="mt-6 space-y-3">
                {b.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border bg-muted text-navy">
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
                className="my-10 border-l-2 border-foreground/20 pl-6 text-xl font-medium leading-relaxed tracking-tight text-foreground sm:text-2xl"
              >
                {b.text}
              </blockquote>
            );
          case "image":
            return (
              <figure key={i} className="my-10">
                {b.diagram ? (
                  <div className="overflow-hidden rounded-xl border bg-white p-4 sm:p-8">
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
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
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
                  <figcaption className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">{b.caption}</figcaption>
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
    <div className="flex flex-col gap-5 rounded-xl border bg-card p-6 shadow-xs sm:flex-row sm:items-center">
      <Image
        src={images.portrait}
        alt={t.author}
        width={96}
        height={96}
        className="h-16 w-16 shrink-0 rounded-full border object-cover object-[50%_25%]"
      />
      <div>
        <p className="text-xs font-medium text-muted-foreground">{t.by}</p>
        <p className="mt-0.5 font-semibold tracking-tight text-foreground">{t.author}</p>
        <p className="text-sm text-muted-foreground">{t.authorRole}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.authorBio}</p>
      </div>
    </div>
  );
}

/** Closing call to action shared by the blog pages: a bordered panel with the booking button. */
export function BlogCta({ locale, t }: { locale: Locale; t: BlogT }) {
  return (
    <section className="border-t bg-background py-16 sm:py-20">
      <Container>
        <div className="relative isolate overflow-hidden rounded-2xl border bg-card px-6 py-8 shadow-xs sm:px-10 sm:py-10">
          <div aria-hidden className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_80%_at_100%_0%,black,transparent)]" />
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-lg border bg-muted text-navy md:grid">
              <CalendarCheck aria-hidden className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{t.ctaTitle}</h2>
              <p className="mt-2 text-muted-foreground">{t.ctaText}</p>
            </div>
            <Link
              href={localePath(locale, "/book")}
              className={cn(buttonVariants({ variant: "default" }), "group h-10 shrink-0 gap-2 rounded-[var(--btn-radius,0.625rem)] px-4 shadow-xs")}
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
