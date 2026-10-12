import Image from "next/image";
import Link from "next/link";
import { fill } from "@/i18n";
import { localePath, sectionHref, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";
import { formatDate, type Block, type Photo, type Post } from "@/lib/blog";
import { images } from "@/lib/site";
import { Arrow, Button, Check, Container } from "./ui";

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

function CategoryChip({ children, onImage = false }: { children: React.ReactNode; onImage?: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
        onImage ? "bg-white/95 text-navy shadow-sm" : "bg-blue/10 text-blue-dark"
      }`}
    >
      {children}
    </span>
  );
}

export function PostCard({ post, locale, t }: { post: Post; locale: Locale; t: BlogT }) {
  const c = post[locale];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-mist/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10">
      <div className="relative">
        <CoverImage
          photo={post.cover}
          alt={c.coverAlt}
          diagram={post.coverDiagram}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[4/3]"
        />
        <div className="absolute left-4 top-4">
          <CategoryChip onImage>{c.category}</CategoryChip>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <PostMeta post={post} locale={locale} t={t} className="text-muted" />
        <h3 className="mt-2 text-lg font-semibold leading-snug text-navy">
          <Link href={postHref(locale, post.slug)} className="after:absolute after:inset-0">
            {c.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 leading-relaxed text-muted">{c.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-blue-dark">
          {t.readArticle} <Arrow />
        </span>
      </div>
    </article>
  );
}

export function FeaturedPost({ post, locale, t }: { post: Post; locale: Locale; t: BlogT }) {
  const c = post[locale];
  return (
    <article className="group relative grid overflow-hidden rounded-3xl bg-white shadow-xl shadow-ink/10 ring-1 ring-mist/70 lg:grid-cols-2">
      <CoverImage
        photo={post.cover}
        alt={c.coverAlt}
        diagram={post.coverDiagram}
        sizes="(min-width: 1024px) 50vw, 100vw"
        preload
        className="aspect-[4/3] lg:aspect-auto lg:min-h-[26rem]"
      />
      <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-green/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#007a43]">
            {t.featured}
          </span>
          <CategoryChip>{c.category}</CategoryChip>
        </div>
        <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-navy sm:text-4xl">
          <Link href={postHref(locale, post.slug)} className="after:absolute after:inset-0">
            {c.title}
          </Link>
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted">{c.excerpt}</p>
        <PostMeta post={post} locale={locale} t={t} className="mt-6 text-muted" />
        <span className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-dark">
          {t.readArticle} <Arrow />
        </span>
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

/** Closing call to action shared by the blog pages. */
export function BlogCta({ locale, t }: { locale: Locale; t: BlogT }) {
  return (
    <section className="bg-navy py-16 text-white sm:py-20">
      <Container className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight">{t.ctaTitle}</h2>
          <p className="mt-3 text-lg leading-relaxed text-white/75">{t.ctaText}</p>
        </div>
        <Button href={sectionHref(locale, "contact")} size="lg" className="shrink-0">
          {t.ctaButton} <Arrow />
        </Button>
      </Container>
    </section>
  );
}
