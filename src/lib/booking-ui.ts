/** Small pure helpers for the booking page. No imports beyond types, so tests can run them directly. */
import type { PricedService } from "./pricing-data";

type Lang = "en" | "fr";

/** Treatments whose name or description contains every word typed (accents and case ignored). */
export function filterServices(services: PricedService[], query: string, locale: Lang): PricedService[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return services;
  return services.filter((s) => {
    const hay = fold(`${s.title[locale]} ${s.text[locale]} ${s.title.en} ${s.title.fr}`);
    return words.every((w) => hay.includes(w));
  });
}

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/** The reference shown to the client after a request, e.g. 42 → "HZ-00042". */
export function bookingReference(id: number): string {
  return `HZ-${String(Math.max(0, Math.trunc(id))).padStart(5, "0")}`;
}

/** Real HealthyZone photos used as treatment thumbnails; any other treatment gets the studio photo. */
const thumbnails: Record<string, string> = {
  swedish: "/images/blog/swedish.webp",
  therapeutic: "/images/blog/deep-tissue.webp",
};
export const studioPhoto = "/images/blog/studio-table-side.webp";

export function thumbnailFor(serviceId: string): string {
  return thumbnails[serviceId] ?? studioPhoto;
}
