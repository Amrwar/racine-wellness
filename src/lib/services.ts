/** Service categories, web addresses and search. Pure (type-only imports) so tests can run them directly. */
import type { ServiceItem } from "./content-data";

type Lang = "en" | "fr";
export type ServiceCategory = "massage" | "movement" | "strength" | "aging" | "youth";

/** Each built-in service icon belongs to one category; other icons only appear under "All". */
const byIcon: Partial<Record<string, ServiceCategory>> = {
  hands: "massage",
  posture: "movement",
  mobility: "movement",
  strength: "strength",
  heart: "aging",
  youth: "youth",
};
export const categoryOf = (s: Pick<ServiceItem, "icon">): ServiceCategory | undefined => byIcon[s.icon];
export const categoryOrder: ServiceCategory[] = ["massage", "movement", "strength", "aging", "youth"];

/** Massage is the only service with published prices and online booking; the others are by request. */
export const isBookable = (s: Pick<ServiceItem, "icon">) => categoryOf(s) === "massage";

export const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export const slugify = (s: string) =>
  fold(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/** Web address for each service, from its English name; duplicates get -2, -3… */
export function serviceSlugs(items: Pick<ServiceItem, "title">[]): string[] {
  const used = new Map<string, number>();
  return items.map((s, i) => {
    const base = slugify(s.title.en) || `service-${i + 1}`;
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}

/** Services matching every word typed (name, description, category label) and the chosen category. */
export function filterServices<T extends Pick<ServiceItem, "icon" | "title" | "text">>(
  items: T[],
  query: string,
  category: ServiceCategory | "all",
  locale: Lang,
  categoryLabels: Record<ServiceCategory, string>,
): T[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  return items.filter((s) => {
    const cat = categoryOf(s);
    if (category !== "all" && cat !== category) return false;
    const hay = fold(`${s.title[locale]} ${s.text[locale]} ${cat ? categoryLabels[cat] : ""}`);
    return words.every((w) => hay.includes(w));
  });
}

/** A real HealthyZone photo for massage cards when no photo was uploaded; other services show their icon. */
export const defaultServicePhoto = (s: Pick<ServiceItem, "icon">) => (categoryOf(s) === "massage" ? "/images/blog/swedish.webp" : null);
