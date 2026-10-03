import data from "../../content/videos.json";
import type { Locale } from "@/i18n/config";

export type VideoSource =
  | { type: "youtube"; id: string }
  | { type: "vimeo"; id: string }
  | { type: "file"; url: string; poster?: string };

type Localized = string | Partial<Record<Locale, string>>;

type RawVideo = {
  slug: string;
  title: Localized;
  description: Localized;
  category: Localized;
  duration: string;
  date: string;
  source: VideoSource;
  featured?: boolean;
};

/** A video with all text resolved for one locale. */
export type Video = {
  slug: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  date: string;
  source: VideoSource;
  featured?: boolean;
};

function pick(value: Localized, locale: Locale): string {
  if (typeof value === "string") return value;
  return value[locale] ?? value.en ?? Object.values(value)[0] ?? "";
}

const raw = (data as RawVideo[])
  .slice()
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getVideos(locale: Locale): Video[] {
  return raw.map((v) => ({
    ...v,
    title: pick(v.title, locale),
    description: pick(v.description, locale),
    category: pick(v.category, locale),
  }));
}

export function getVideo(locale: Locale, slug: string) {
  return getVideos(locale).find((v) => v.slug === slug);
}

export function getVideoSlugs() {
  return raw.map((v) => v.slug);
}

export function getCategories(videos: Video[], allLabel: string) {
  return [allLabel, ...Array.from(new Set(videos.map((v) => v.category)))];
}

export function thumbnail(v: Video) {
  switch (v.source.type) {
    case "youtube":
      return `https://i.ytimg.com/vi/${v.source.id}/hqdefault.jpg`;
    case "vimeo":
      return `https://vumbnail.com/${v.source.id}.jpg`;
    case "file":
      return v.source.poster ?? "/video-poster.svg";
  }
}

export function embedUrl(s: VideoSource, locale: Locale) {
  switch (s.type) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${s.id}?rel=0&modestbranding=1&hl=${locale}`;
    case "vimeo":
      return `https://player.vimeo.com/video/${s.id}?dnt=1`;
    case "file":
      return s.url;
  }
}

export function formatDate(d: string, locale: Locale) {
  return new Date(d + "T12:00:00").toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
