import type { Metadata } from "next";
import Link from "next/link";
import { videos } from "@/lib/videos";
import { site } from "@/lib/site";
import { Arrow, Container, Eyebrow, Heading, Lead } from "@/components/ui";
import { VideoGallery, VideoPlayer } from "@/components/video";
import { CTA } from "@/components/sections";
import { Youtube } from "@/components/icons";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Free training, nutrition and naturopathy videos from a Montréal personal trainer and naturopath. Workouts, mobility routines, recipes and natural health tips.",
};

export default function VideosPage() {
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
              <Eyebrow className="animate-fade-up">Videos</Eyebrow>
              <Heading as="h1" className="animate-fade-up delay-1">
                Learn from the{" "}
                <em className="font-light italic text-moss">studio.</em>
              </Heading>
              <Lead className="mt-7 animate-fade-up delay-2">
                Practical lessons on strength, mobility, nutrition and natural health.
                Short enough to watch between meetings, useful enough to change your week.
              </Lead>
              <a
                href={site.socials.youtube}
                target="_blank"
                rel="noreferrer"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-clay animate-fade-up delay-3"
              >
                <Youtube className="h-5 w-5" /> Subscribe on YouTube <Arrow />
              </a>
            </div>
            <div className="lg:col-span-7 animate-fade-up delay-2">
              <VideoPlayer video={featured} />
              <div className="mt-5 flex items-start justify-between gap-6">
                <p className="max-w-xl text-stone">{featured.description}</p>
                <Link
                  href={`/videos/${featured.slug}`}
                  className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-forest"
                >
                  Details <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <VideoGallery videos={rest} />
        </Container>
      </section>

      <CTA
        title="Want this applied to your body?"
        text="Videos are a start. A personal plan is where change happens. Book a free call and let's talk about yours."
      />
    </>
  );
}
