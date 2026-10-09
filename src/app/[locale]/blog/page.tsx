import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { getPosts } from "@/lib/blog";
import { Container, Eyebrow } from "@/components/ui";
import { BlogCta, FeaturedPost, PostCard } from "@/components/blog";
import { alternatesFor } from "../layout";

export async function generateMetadata({ params }: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getDictionary(locale).meta.blog;
  return { title: m.title, description: m.description, alternates: alternatesFor("/blog") };
}

export default async function BlogPage({ params }: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const [featured, ...rest] = getPosts();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink pb-36 pt-20 text-white sm:pb-44 sm:pt-28">
        <Image
          src="/images/blog/sports-massage.webp"
          alt=""
          fill
          preload
          sizes="100vw"
          className="-z-20 object-cover object-[50%_35%]"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/60" />
        <Container>
          <div className="max-w-2xl">
            <Eyebrow light className="animate-fade-up">
              {t.blog.eyebrow}
            </Eyebrow>
            <h1 className="animate-fade-up delay-1 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              {t.blog.title}
            </h1>
            <p className="animate-fade-up delay-2 mt-6 text-lg leading-relaxed text-white/75">{t.blog.lead}</p>
          </div>
        </Container>
      </section>

      <section className="bg-surface pb-20 sm:pb-28">
        <Container>
          <div className="-mt-24 sm:-mt-32">
            <FeaturedPost post={featured} locale={locale} t={t.blog} />
          </div>
          <ul className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} locale={locale} t={t.blog} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <BlogCta locale={locale} t={t.blog} />
    </>
  );
}
