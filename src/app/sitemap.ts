import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getVideoSlugs } from "@/lib/videos";
import { localePath, locales } from "@/i18n/config";

const pages = ["/", "/about", "/services", "/programs", "/videos", "/faq", "/contact"];

function entry(path: string, lastModified: Date, priority: number, changeFrequency: "monthly" | "yearly") {
  return locales.map((locale) => ({
    url: `${site.url}${localePath(locale, path)}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `${site.url}${localePath(l, path)}`])),
    },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...pages.flatMap((p) => entry(p, now, p === "/" ? 1 : 0.8, "monthly")),
    ...getVideoSlugs().flatMap((slug) => entry(`/videos/${slug}`, now, 0.6, "yearly")),
  ];
}
