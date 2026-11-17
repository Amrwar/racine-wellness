import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { localePath, locales } from "@/i18n/config";
import { getPosts } from "@/lib/posts";
import { getContent } from "@/lib/content";
import { serviceSlugs } from "@/lib/services";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  const now = new Date();
  return [
    ...entries("/", now, 1),
    ...entries("/services", now, 0.9),
    ...serviceSlugs((await getContent()).services.items).flatMap((slug) => entries(`/services/${slug}`, now, 0.8)),
    ...entries("/pricing", now, 0.9),
    ...entries("/book", now, 0.9),
    ...entries("/blog", now, 0.8),
    ...posts.flatMap((p) => entries(`/blog/${p.slug}`, new Date(p.date), 0.7)),
  ];
}
