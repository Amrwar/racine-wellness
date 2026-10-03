import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { isLocale, locales } from "@/i18n/config";
import { LLink } from "@/i18n/LocaleProvider";
import { formatDate, getVideo, getVideos, getVideoSlugs, thumbnail } from "@/lib/videos";
import { site } from "@/lib/site";
import { Arrow, Button, Container, Eyebrow, Heading } from "@/components/ui";
import { VideoCard, VideoPlayer } from "@/components/video";
import { CTA } from "@/components/sections";
import { alternatesFor } from "../../layout";

type Props = PageProps<"/[locale]/videos/[slug]">;

export function generateStaticParams() {
  return locales.flatMap((locale) => getVideoSlugs().map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const video = getVideo(locale, slug);
  if (!video) return {};
  return {
    title: video.title,
    description: video.description,
    alternates: alternatesFor(`/videos/${slug}`),
    openGraph: {
      title: video.title,
      description: video.description,
      type: "video.other",
      images: [{ url: thumbnail(video) }],
    },
  };
}

export default async function VideoPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const video = getVideo(locale, slug);
  if (!video) notFound();

  const related = getVideos(locale)
    .filter((v) => v.slug !== video.slug)
    .sort(
      (a, b) =>
        (a.category === video.category ? -1 : 0) - (b.category === video.category ? -1 : 0),
    )
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: thumbnail(video),
    uploadDate: video.date,
    inLanguage: locale,
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    ...(video.source.type === "youtube"
      ? { embedUrl: `https://www.youtube.com/embed/${video.source.id}` }
      : {}),
  };

  return (
    <>
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-24">
        <Container>
          <LLink
            href="/videos"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-stone transition hover:text-forest"
          >
            <Arrow className="rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0" />
            {t.common.allVideos}
          </LLink>

          <div className="mt-8 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <VideoPlayer video={video} playLabel={t.common.play} />
            </div>
            <aside className="lg:col-span-4">
              <Eyebrow>
                {video.category} · {video.duration}
              </Eyebrow>
              <Heading as="h1" className="!text-3xl sm:!text-4xl lg:!text-4xl">
                {video.title}
              </Heading>
              <p className="mt-3 text-sm text-stone">
                {t.common.published} {formatDate(video.date, locale)} · {site.owner}
              </p>
              <p className="mt-6 leading-relaxed text-stone">{video.description}</p>
              <div className="mt-8 rounded-3xl bg-sand/60 p-6">
                <p className="font-display text-xl font-medium text-forest">{t.videosPage.sidebarTitle}</p>
                <p className="mt-2 text-sm text-stone">{t.videosPage.sidebarText}</p>
                <Button href="/contact" className="mt-5 w-full">
                  {t.header.bookCall} <Arrow />
                </Button>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="border-t border-sand py-20 sm:py-28">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <Heading as="h3">{t.common.keepWatching}</Heading>
            <LLink href="/videos" className="group inline-flex items-center gap-2 text-sm font-semibold text-clay">
              {t.common.allVideos} <Arrow />
            </LLink>
          </div>
          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((v, i) => (
              <VideoCard key={v.slug} video={v} index={i} />
            ))}
          </div>
        </Container>
      </section>

      <CTA t={t} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
