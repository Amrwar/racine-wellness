import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { localePath, locales } from "@/i18n/config";
import { posts } from "@/lib/blog";

function entries(path: string, lastModified: Date, priority: number): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${site.url}${localePath(locale, path)}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `${site.url}${localePath(l, path)}`])),
    },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...entries("/", now, 1),
    ...entries("/blog", now, 0.8),
    ...posts.flatMap((p) => entries(`/blog/${p.slug}`, new Date(p.date), 0.7)),
  ];
}
