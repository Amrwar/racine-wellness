"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { embedUrl, formatDate, thumbnail, type Video, videoCategories } from "@/lib/videos";
import { Play } from "./icons";

/* Thumbnail with graceful fallback if the remote image is missing */
function Thumb({
  video,
  sizes,
  className,
  priority = false,
}: {
  video: Video;
  sizes: string;
  className: string;
  priority?: boolean;
}) {
  const [src, setSrc] = useState(() => thumbnail(video));
  const fallback = src === "/video-poster.svg";
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={fallback}
      onError={() => setSrc("/video-poster.svg")}
      className={className}
    />
  );
}

/* ---------- Player (click-to-load for performance) ---------- */
export function VideoPlayer({ video, autoplay = false }: { video: Video; autoplay?: boolean }) {
  const [active, setActive] = useState(autoplay);
  const src = embedUrl(video.source);

  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl bg-forest-deep shadow-soft">
      {active ? (
        video.source.type === "file" ? (
          <video
            src={src}
            poster={video.source.poster}
            controls
            autoPlay
            playsInline
            className="h-full w-full"
          />
        ) : (
          <iframe
            src={`${src}&autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        )
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group absolute inset-0 h-full w-full text-left"
          aria-label={`Play ${video.title}`}
        >
          <Thumb
            video={video}
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-forest-deep/20 to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream text-forest shadow-soft transition duration-300 group-hover:scale-110">
            <Play className="ml-1 h-8 w-8" />
          </span>
          <span className="absolute bottom-6 left-6 right-6 text-cream">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-sage">
              {video.category} · {video.duration}
            </span>
            <span className="mt-1 block font-display text-xl font-medium sm:text-2xl">
              {video.title}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

/* ---------- Card ---------- */
export function VideoCard({ video, index = 0 }: { video: Video; index?: number }) {
  return (
    <Link
      href={`/videos/${video.slug}`}
      className={`group flex flex-col animate-fade-up delay-${(index % 4) + 1}`}
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-sand shadow-card">
        <Thumb
          video={video}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-forest-deep/10 transition group-hover:bg-forest-deep/30" />
        <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream/90 text-forest opacity-0 shadow-soft transition duration-300 group-hover:opacity-100">
          <Play className="ml-0.5 h-6 w-6" />
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-forest-deep/80 px-2.5 py-1 text-xs font-semibold text-cream backdrop-blur">
          {video.duration}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-clay">
        {video.category}
        <span className="h-px w-5 bg-sand-dark" aria-hidden />
        <span className="font-medium normal-case tracking-normal text-stone">
          {formatDate(video.date)}
        </span>
      </div>
      <h3 className="mt-2 font-display text-xl font-medium leading-snug text-forest transition group-hover:text-moss">
        {video.title}
      </h3>
      <p className="line-clamp-2 mt-2 text-sm leading-relaxed text-stone">{video.description}</p>
    </Link>
  );
}

/* ---------- Filterable gallery ---------- */
export function VideoGallery({ videos }: { videos: Video[] }) {
  const [cat, setCat] = useState("All");
  const list = useMemo(
    () => (cat === "All" ? videos : videos.filter((v) => v.category === cat)),
    [cat, videos],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter videos by category">
        {videoCategories.map((c) => {
          const active = c === cat;
          return (
            <button
              key={c}
              role="tab"
              aria-selected={active}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-forest text-cream"
                  : "border border-forest/15 text-forest hover:border-forest/40"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((v, i) => (
          <VideoCard key={v.slug} video={v} index={i} />
        ))}
      </div>

      {list.length === 0 && (
        <p className="mt-10 text-stone">No videos in this category yet. Check back soon.</p>
      )}
    </div>
  );
}
