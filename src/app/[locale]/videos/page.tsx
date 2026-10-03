import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { LLink } from "@/i18n/LocaleProvider";
import { getVideos } from "@/lib/videos";
import { site } from "@/lib/site";
import { Arrow, Container, Eyebrow, Heading, Lead, Rich } from "@/components/ui";
import { VideoGallery, VideoPlayer } from "@/components/video";
import { CTA } from "@/components/sections";
import { Youtube } from "@/components/icons";
import { alternatesFor } from "../layout";

export async function generateMetadata({ params }: PageProps<"/[locale]/videos">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getDictionary(locale).meta.pages.videos;
  return { title: m.title, description: m.description, alternates: alternatesFor("/videos") };
}

export default async function VideosPage({ params }: PageProps<"/[locale]/videos">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const videos = getVideos(locale);
  const featured = videos.find((v) => v.featured) ?? videos[0];
  const rest = videos.filter((v) => v.slug !== featured.slug);

  return (
    <>
      <section className="relative overflow-hidden border-b border-sand bg-sand/40 pt-36 pb-20 sm:pt-44 sm:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-10%] h-[520px] w-[520px] rounded-full bg-sage/30 blur-3xl"
        />
        <Container className="relative">
          <div className="grid items-end gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Eyebrow className="animate-fade-up">{t.videosPage.eyebrow}</Eyebrow>
              <Heading as="h1" className="animate-fade-up delay-1">
                <Rich text={t.videosPage.title} />
              </Heading>
              <Lead className="mt-7 animate-fade-up delay-2">{t.videosPage.lead}</Lead>
              <a
                href={site.socials.youtube}
                target="_blank"
                rel="noreferrer"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-clay animate-fade-up delay-3"
              >
                <Youtube className="h-5 w-5" /> {t.common.subscribe} <Arrow />
              </a>
            </div>
            <div className="lg:col-span-7 animate-fade-up delay-2">
              <VideoPlayer video={featured} playLabel={t.common.play} />
              <div className="mt-5 flex items-start justify-between gap-6">
                <p className="max-w-xl text-stone">{featured.description}</p>
                <LLink
                  href={`/videos/${featured.slug}`}
                  className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-forest"
                >
                  {t.common.details} <Arrow />
                </LLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <VideoGallery videos={rest} t={t.common} />
        </Container>
      </section>

      <CTA t={t} title={t.cta.videosTitle} text={t.cta.videosText} />
    </>
  );
}
