import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { localePath, locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return locales.map((locale) => ({
    url: `${site.url}${localePath(locale, "/")}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 1,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `${site.url}${localePath(l, "/")}`])),
    },
  }));
}
