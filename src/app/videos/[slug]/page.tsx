import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getVideo, thumbnail, videos } from "@/lib/videos";
import { site } from "@/lib/site";
import { Arrow, Button, Container, Eyebrow, Heading } from "@/components/ui";
import { VideoCard, VideoPlayer } from "@/components/video";
import { CTA } from "@/components/sections";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return videos.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = getVideo(slug);
  if (!video) return {};
  return {
    title: video.title,
    description: video.description,
    openGraph: {
      title: video.title,
      description: video.description,
      type: "video.other",
      images: [{ url: thumbnail(video) }],
    },
  };
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params;
  const video = getVideo(slug);
  if (!video) notFound();

  const related = videos
    .filter((v) => v.slug !== video.slug)
    .sort((a, b) => (a.category === video.category ? -1 : 0) - (b.category === video.category ? -1 : 0))
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: thumbnail(video),
    uploadDate: video.date,
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    ...(video.source.type === "youtube"
      ? { embedUrl: `https://www.youtube.com/embed/${video.source.id}` }
      : {}),
  };

  return (
    <>
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-24">
        <Container>
          <Link
            href="/videos"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-stone transition hover:text-forest"
          >
            <Arrow className="rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0" />
            All videos
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <VideoPlayer video={video} />
            </div>
            <aside className="lg:col-span-4">
              <Eyebrow>
                {video.category} · {video.duration}
              </Eyebrow>
              <Heading as="h1" className="!text-3xl sm:!text-4xl lg:!text-4xl">
                {video.title}
              </Heading>
              <p className="mt-3 text-sm text-stone">
                Published {formatDate(video.date)} · {site.owner}
              </p>
              <p className="mt-6 leading-relaxed text-stone">{video.description}</p>
              <div className="mt-8 rounded-3xl bg-sand/60 p-6">
                <p className="font-display text-xl font-medium text-forest">
                  Want a plan built around you?
                </p>
                <p className="mt-2 text-sm text-stone">
                  Book a free 20-minute discovery call to talk about your goals.
                </p>
                <Button href="/contact" className="mt-5 w-full">
                  Book a free call <Arrow />
                </Button>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="border-t border-sand py-20 sm:py-28">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <Heading as="h3">Keep watching</Heading>
            <Link href="/videos" className="group inline-flex items-center gap-2 text-sm font-semibold text-clay">
              All videos <Arrow />
            </Link>
          </div>
          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((v, i) => (
              <VideoCard key={v.slug} video={v} index={i} />
            ))}
          </div>
        </Container>
      </section>

      <CTA />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
