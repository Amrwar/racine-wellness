import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { videos } from "@/lib/videos";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/about", "/services", "/programs", "/videos", "/faq", "/contact"].map(
    (p) => ({
      url: `${site.url}${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : 0.8,
    }),
  );
  const videoPages = videos.map((v) => ({
    url: `${site.url}/videos/${v.slug}`,
    lastModified: new Date(v.date),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
  return [...pages, ...videoPages];
}
