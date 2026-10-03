import data from "../../content/videos.json";

export type VideoSource =
  | { type: "youtube"; id: string }
  | { type: "vimeo"; id: string }
  | { type: "file"; url: string; poster?: string };

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

export const videos: Video[] = (data as Video[])
  .slice()
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const videoCategories = [
  "All",
  ...Array.from(new Set(videos.map((v) => v.category))),
];

export function getVideo(slug: string) {
  return videos.find((v) => v.slug === slug);
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

export function embedUrl(s: VideoSource) {
  switch (s.type) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${s.id}?rel=0&modestbranding=1`;
    case "vimeo":
      return `https://player.vimeo.com/video/${s.id}?dnt=1`;
    case "file":
      return s.url;
  }
}

export function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
